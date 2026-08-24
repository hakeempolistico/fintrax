'use client'

import { Bot, LoaderCircle, Send, Sparkles, User } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const starterPrompts = [
  'How much did I spend this month?',
  'Which bills are due soon?',
  'Show my biggest spending categories.',
  'What is my current financial overview?',
]

export default function AiChatClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsSending(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data?.message ?? 'Unable to contact Fintrax AI.')
        return
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.answer }])
    } catch {
      setError('Unable to contact Fintrax AI. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
      <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Fintrax AI</h1>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                Read only
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Ask about your accounts, transactions, bills, loans, spending, and cash flow.
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[560px] flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                Ask Fintrax about your finances
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Fintrax AI can read only the data attached to your signed-in member account. It cannot access or search another member&apos;s records.
              </p>

              <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${message.role === 'user' ? 'bg-brand-500 text-white' : 'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200'}`}>
                  {message.content}
                </div>

                {message.role === 'user' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isSending && (
            <div className="flex gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <Bot className="h-4 w-4" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-5">
          {error && (
            <div className="mb-3 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isSending}
              maxLength={8000}
              autoComplete="off"
              placeholder="Ask Fintrax about your finances..."
              className="h-11 flex-1 bg-transparent px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-white/90"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-gray-400">
            Read-only AI. Fintrax filters every data lookup to your authenticated member account.
          </p>
        </div>
      </div>
    </section>
  )
}
