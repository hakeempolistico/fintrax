import config from '@/payload.config'
import { chatWithFintraxAI, FintraxChatMessage } from '@/services/ai/fintrax-ai.service'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const CONVERSATION_COLLECTION = 'ai-conversations' as any
const MAX_STORED_MESSAGES = 200
const MAX_MESSAGE_LENGTH = 8000

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

    const messages: FintraxChatMessage[] = [...history, { role: 'user', content: message }]
    const answer = await chatWithFintraxAI(memberId, messages)
    const storedMessages = [...messages, { role: 'assistant' as const, content: answer }].slice(-MAX_STORED_MESSAGES)

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
