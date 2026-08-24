'use client'

import MarkdownMessage from '@/components/fintrax/ai/MarkdownMessage'
import { Bot, LoaderCircle, MessageSquare, Plus, Send, Sparkles, Trash2, User } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ConversationSummary = {
  id: string
  title: string
  createdAt?: string
  updatedAt?: string
}

const starterPrompts = [
  'How much did I spend this month?',
  'Which bills are due soon?',
  'Show my biggest spending categories.',
  'What is my current financial overview?',
]

export default function AiChatClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void refreshConversations()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const refreshConversations = async () => {
    try {
      const response = await fetch('/api/ai-chat', { credentials: 'include' })
      const data = await response.json().catch(() => ({}))
      if (response.ok) setConversations(Array.isArray(data.conversations) ? data.conversations : [])
    } catch {
      // Chat remains usable even if the history list cannot load.
    }
  }

  const loadConversation = async (id: string) => {
    if (isSending || isLoadingConversation) return
    setError('')
    setIsLoadingConversation(true)

    try {
      const response = await fetch(`/api/ai-chat?id=${encodeURIComponent(id)}`, { credentials: 'include' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data?.message ?? 'Unable to load conversation.')
        return
      }

      setActiveConversationId(data.conversation.id)
      setMessages(Array.isArray(data.conversation.messages) ? data.conversation.messages : [])
    } catch {
      setError('Unable to load conversation.')
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const newConversation = () => {
    if (isSending) return
    setActiveConversationId(null)
    setMessages([])
    setInput('')
    setError('')
  }

  const deleteConversation = async (id: string) => {
    if (isSending) return
    try {
      const response = await fetch(`/api/ai-chat?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) return
      setConversations((current) => current.filter((conversation) => conversation.id !== id))
      if (activeConversationId === id) newConversation()
    } catch {
      setError('Unable to delete conversation.')
    }
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    setMessages((current) => [...current, { role: 'user', content: trimmed }])
    setInput('')
    setError('')
    setIsSending(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: activeConversationId ?? undefined,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data?.message ?? 'Unable to contact Fintrax AI.')
        return
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.answer }])
      setActiveConversationId(data.conversationId)
      setConversations((current) => {
        const existing = current.find((conversation) => conversation.id === data.conversationId)
        const next = existing
          ? current.map((conversation) =>
              conversation.id === data.conversationId
                ? { ...conversation, title: data.title, updatedAt: new Date().toISOString() }
                : conversation,
            )
          : [{ id: data.conversationId, title: data.title, updatedAt: new Date().toISOString() }, ...current]
        return [...next].sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
      })
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
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={newConversation}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>

        <div className="mt-4">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-gray-400">Your conversations</p>
          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto lg:max-h-[540px]">
            {conversations.length === 0 ? (
              <p className="px-2 py-3 text-xs leading-5 text-gray-400">Your private AI conversations will appear here.</p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center rounded-lg ${activeConversationId === conversation.id ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'}`}
                >
                  <button
                    type="button"
                    onClick={() => void loadConversation(conversation.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate text-sm text-gray-700 dark:text-gray-300">{conversation.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteConversation(conversation.id)}
                    aria-label="Delete conversation"
                    className="mr-1 rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="mt-4 border-t border-gray-100 px-2 pt-3 text-xs leading-5 text-gray-400 dark:border-gray-800">
          Conversation history is stored under your signed-in member account only.
        </p>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Fintrax AI</h1>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Read only</span>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Ask about your accounts, transactions, bills, loans, spending, and cash flow.</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {isLoadingConversation ? (
              <div className="flex h-full min-h-72 items-center justify-center text-sm text-gray-400">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-14 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10"><Sparkles className="h-8 w-8" /></div>
                <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">Ask Fintrax about your finances</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">Fintrax AI can read only the data attached to your signed-in member account. Conversation history is private to that same member.</p>
                <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10">{prompt}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10"><Bot className="h-4 w-4" /></div>}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'whitespace-pre-wrap bg-brand-500 text-white' : 'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200'}`}>
                    {message.role === 'assistant' ? <MarkdownMessage content={message.content} /> : message.content}
                  </div>
                  {message.role === 'user' && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300"><User className="h-4 w-4" /></div>}
                </div>
              ))
            )}

            {isSending && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10"><Bot className="h-4 w-4" /></div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"><LoaderCircle className="h-4 w-4 animate-spin" />Thinking...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-5">
            {error && <div className="mb-3 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">{error}</div>}
            <form onSubmit={onSubmit} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900">
              <input value={input} onChange={(event) => setInput(event.target.value)} disabled={isSending || isLoadingConversation} maxLength={8000} autoComplete="off" placeholder="Ask Fintrax about your finances..." className="h-11 flex-1 bg-transparent px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-white/90" />
              <button type="submit" disabled={isSending || isLoadingConversation || !input.trim()} aria-label="Send message" className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40">
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-gray-400">Read-only AI. Data and conversation lookups are scoped to your authenticated member account.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
