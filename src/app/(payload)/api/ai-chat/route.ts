import config from '@/payload.config'
import { chatWithFintraxAI, FintraxChatMessage } from '@/services/ai/fintrax-ai.service'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || user.collection !== 'members') {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const messages = Array.isArray(body?.messages) ? body.messages : []

    if (!messages.length) {
      return NextResponse.json({ message: 'A message is required.' }, { status: 400 })
    }

    const answer = await chatWithFintraxAI(String(user.id), messages as FintraxChatMessage[])
    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Fintrax AI chat error:', error)
    const message = error instanceof Error ? error.message : 'Unable to process AI chat request.'
    const configurationError = message.includes('ANTHROPIC_API_KEY')
    return NextResponse.json(
      { message: configurationError ? 'Fintrax AI is not configured yet.' : message },
      { status: configurationError ? 503 : 500 },
    )
  }
}
