import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Bot, Send, Sparkles } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Chat | Fintrax',
  description: 'Chat with Fintrax AI about your finances.',
}

export default function AiChatPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="AI Chat" />

      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Fintrax AI</h1>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    Preview
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  Your financial assistant is coming soon.
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[480px] flex-col justify-between p-5 sm:p-6">
            <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                Ask Fintrax anything about your finances
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                This is the static AI Chat workspace for now. Later, it can answer questions about transactions,
                spending, bills, loans, balances, and financial trends using your Fintrax data.
              </p>

              <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
                {[
                  'How much did I spend this month?',
                  'Which bills are due soon?',
                  'Show my biggest spending categories.',
                  'How are my loan balances changing?',
                ].map((prompt) => (
                  <div
                    key={prompt}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300"
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900">
                <input
                  type="text"
                  disabled
                  placeholder="AI Chat is coming soon..."
                  className="h-11 flex-1 bg-transparent px-3 text-sm text-gray-500 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-gray-400"
                />
                <button
                  type="button"
                  disabled
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                Static preview only. No AI requests are sent yet.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
