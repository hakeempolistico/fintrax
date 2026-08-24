import config from '@/payload.config'
import { chatWithFintraxAI, FintraxChatMessage } from '@/services/ai/fintrax-ai.service'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const CONVERSATION_COLLECTION = 'ai-conversations' as any
const MAX_STORED_MESSAGES = 200
const MAX_MESSAGE_LENGTH = 8000
const APP_TIME_ZONE = 'Asia/Manila'

const sanitizeStoredMessages = (messages: any): FintraxChatMessage[] => {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((message) =>
      (message?.role === 'user' || message?.role === 'assistant') &&
      typeof message?.content === 'string',
    )
    .map((message) => ({ role: message.role, content: message.content }))
    .slice(-MAX_STORED_MESSAGES)
}

const getLocalDateParts = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const getPart = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
  }
}

const formatDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const getLastDayOfMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate()

const addTemporalScope = (message: string) => {
  const normalized = message.toLowerCase()
  const { year, month, day } = getLocalDateParts()
  const today = formatDate(year, month, day)

  let scope: string | null = null

  if (/\bthis month\b|\bcurrent month\b/.test(normalized)) {
    scope = `${formatDate(year, month, 1)} through ${today}`
  } else if (/\blast month\b|\bprevious month\b/.test(normalized)) {
    const previousMonth = month === 1 ? 12 : month - 1
    const previousYear = month === 1 ? year - 1 : year
    scope = `${formatDate(previousYear, previousMonth, 1)} through ${formatDate(previousYear, previousMonth, getLastDayOfMonth(previousYear, previousMonth))}`
  } else if (/\bthis year\b|\bcurrent year\b/.test(normalized)) {
    scope = `${formatDate(year, 1, 1)} through ${today}`
  } else if (/\btoday\b/.test(normalized)) {
    scope = `${today} only`
  }

  if (!scope) return message

  return `${message}\n\n[Fintrax internal date constraint: The user's requested period is ${scope}, based on timezone ${APP_TIME_ZONE}. For transaction, spending, income, expense, payment, or cash-flow analysis, use only records inside this period. Do not use an all-time financial overview to answer a period-specific question, and do not include transactions outside this period.]`
}

async function authenticateMember(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user || user.collection !== 'members') return null
  return { payload, user }
}

async function findOwnedConversation(payload: any, memberId: string, conversationId: string) {
  const result = await payload.find({
    collection: CONVERSATION_COLLECTION,
    depth: 0,
    limit: 1,
    where: {
      and: [
        { id: { equals: conversationId } },
        { member: { equals: memberId } },
      ],
    },
  })

  return result.docs?.[0] ?? null
}

export async function GET(request: NextRequest) {
  const auth = await authenticateMember(request)
  if (!auth) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })

  const memberId = String(auth.user.id)
  const conversationId = request.nextUrl.searchParams.get('id')

  if (conversationId) {
    const conversation = await findOwnedConversation(auth.payload, memberId, conversationId)
    if (!conversation) return NextResponse.json({ message: 'Conversation not found.' }, { status: 404 })

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messages: sanitizeStoredMessages(conversation.messages),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    })
  }

  const result = await auth.payload.find({
    collection: CONVERSATION_COLLECTION,
    depth: 0,
    page: 1,
    limit: 50,
    sort: '-updatedAt',
    where: { member: { equals: memberId } },
  })

  return NextResponse.json({
    conversations: result.docs.map((conversation: any) => ({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    })),
  })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateMember(request)
    if (!auth) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const conversationId = typeof body?.conversationId === 'string' ? body.conversationId.trim() : ''

    if (!message) return NextResponse.json({ message: 'A message is required.' }, { status: 400 })
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ message: 'Message is too long.' }, { status: 400 })
    }

    const memberId = String(auth.user.id)
    let conversation: any = null
    let history: FintraxChatMessage[] = []

    if (conversationId) {
      conversation = await findOwnedConversation(auth.payload, memberId, conversationId)
      if (!conversation) {
        return NextResponse.json({ message: 'Conversation not found.' }, { status: 404 })
      }
      history = sanitizeStoredMessages(conversation.messages)
    }

    const aiMessage = addTemporalScope(message)
    const aiMessages: FintraxChatMessage[] = [...history, { role: 'user', content: aiMessage }]
    const answer = await chatWithFintraxAI(memberId, aiMessages)

    const storedMessages = [
      ...history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: answer },
    ].slice(-MAX_STORED_MESSAGES)

    if (conversation) {
      conversation = await auth.payload.update({
        collection: CONVERSATION_COLLECTION,
        id: conversation.id,
        data: { messages: storedMessages },
      })
    } else {
      conversation = await auth.payload.create({
        collection: CONVERSATION_COLLECTION,
        data: {
          member: auth.user.id,
          title: message.slice(0, 120),
          messages: storedMessages,
        },
      })
    }

    return NextResponse.json({
      answer,
      conversationId: conversation.id,
      title: conversation.title,
    })
  } catch (error) {
    console.error('Fintrax AI chat error:', error)
    const message = error instanceof Error ? error.message : 'Unable to process AI chat request.'
    const configurationError = message.includes('ANTHROPIC_API_KEY')
    return NextResponse.json(
      { message: configurationError ? 'Fintrax AI is not configured yet.' : 'Unable to process AI chat request.' },
      { status: configurationError ? 503 : 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateMember(request)
  if (!auth) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })

  const conversationId = request.nextUrl.searchParams.get('id')
  if (!conversationId) return NextResponse.json({ message: 'Conversation id is required.' }, { status: 400 })

  const memberId = String(auth.user.id)
  const conversation = await findOwnedConversation(auth.payload, memberId, conversationId)
  if (!conversation) return NextResponse.json({ message: 'Conversation not found.' }, { status: 404 })

  await auth.payload.delete({ collection: CONVERSATION_COLLECTION, id: conversation.id })
  return NextResponse.json({ success: true })
}
