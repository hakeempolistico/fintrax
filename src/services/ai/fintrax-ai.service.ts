import config from '@/payload.config'
import { getPayload } from 'payload'

type ChatRole = 'user' | 'assistant'

export type FintraxChatMessage = {
  role: ChatRole
  content: string
}

type ClaudeTextBlock = { type: 'text'; text: string }
type ClaudeToolUseBlock = { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
type ClaudeContentBlock = ClaudeTextBlock | ClaudeToolUseBlock | Record<string, unknown>

type ClaudeResponse = {
  content?: ClaudeContentBlock[]
  stop_reason?: string
  error?: { message?: string }
}

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-5'
const MAX_TOOL_ROUNDS = 5
const MAX_HISTORY_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 8000

const tools = [
  {
    name: 'get_financial_overview',
    description: 'Get the authenticated user financial overview: account balances, income, expenses, bills, and loans.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_transactions',
    description: 'Get the authenticated user transactions, optionally filtered by dates, type, or category.',
    input_schema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        endDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        type: { type: 'string', enum: ['income', 'expense', 'payment', 'transfer'] },
        category: { type: 'string' },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_spending_summary',
    description: 'Summarize authenticated user expenses and payments by category for an optional date range.',
    input_schema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        endDate: { type: 'string', description: 'ISO date YYYY-MM-DD' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_accounts',
    description: 'Get authenticated user accounts and calculated current balances.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_bills',
    description: 'Get authenticated user bills and billing details.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_loans',
    description: 'Get authenticated user loan balances and repayment details.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
]

const relationshipId = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) return String((value as { id: unknown }).id)
  return undefined
}

const dateBoundary = (value: unknown, end = false) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  return `${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z`
}

function transactionWhere(memberId: string, input: Record<string, unknown>, spendingOnly = false) {
  const and: any[] = [{ member: { equals: memberId } }]
  const startDate = dateBoundary(input.startDate)
  const endDate = dateBoundary(input.endDate, true)

  if (startDate) and.push({ date: { greater_than_equal: startDate } })
  if (endDate) and.push({ date: { less_than_equal: endDate } })
  if (spendingOnly) and.push({ type: { in: ['expense', 'payment'] } })
  else if (typeof input.type === 'string') and.push({ type: { equals: input.type } })
  if (typeof input.category === 'string' && input.category.trim()) and.push({ category: { equals: input.category.trim() } })
  return { and } as any
}

async function getOwnedRelationshipMaps(memberId: string) {
  const payload = await getPayload({ config })
  const [accounts, bills, loans] = await Promise.all([
    payload.find({ collection: 'accounts', pagination: false, depth: 0, where: { member: { equals: memberId } } }),
    payload.find({ collection: 'bills', pagination: false, depth: 0, where: { member: { equals: memberId } } }),
    payload.find({ collection: 'loans', pagination: false, depth: 0, where: { member: { equals: memberId } } }),
  ])

  return {
    accounts: new Map((accounts.docs as any[]).map((item) => [String(item.id), { id: item.id, name: item.name }])),
    bills: new Map((bills.docs as any[]).map((item) => [String(item.id), { id: item.id, provider: item.provider }])),
    loans: new Map((loans.docs as any[]).map((item) => [String(item.id), { id: item.id, name: item.name }])),
  }
}

async function getTransactions(memberId: string, input: Record<string, unknown>) {
  const payload = await getPayload({ config })
  const requestedLimit = typeof input.limit === 'number' ? Math.floor(input.limit) : 50
  const limit = Math.max(1, Math.min(requestedLimit, 100))

  const [result, owned] = await Promise.all([
    payload.find({
      collection: 'transactions',
      depth: 0,
      page: 1,
      limit,
      sort: '-date',
      where: transactionWhere(memberId, input),
    }),
    getOwnedRelationshipMaps(memberId),
  ])

  return result.docs.map((transaction: any) => {
    const accountId = relationshipId(transaction.account)
    const billId = relationshipId(transaction.bill)
    const loanId = relationshipId(transaction.loan)
    return {
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      source: transaction.source,
      reference: transaction.reference,
      notes: transaction.notes,
      account: accountId ? owned.accounts.get(accountId) ?? null : null,
      bill: billId ? owned.bills.get(billId) ?? null : null,
      loan: loanId ? owned.loans.get(loanId) ?? null : null,
    }
  })
}

async function getAccounts(memberId: string) {
  const payload = await getPayload({ config })
  const [accountResult, transactionResult] = await Promise.all([
    payload.find({ collection: 'accounts', pagination: false, depth: 0, where: { member: { equals: memberId } } }),
    payload.find({ collection: 'transactions', pagination: false, depth: 0, sort: '-date', where: { member: { equals: memberId } } }),
  ])

  const accounts = accountResult.docs as any[]
  const balances = new Map(accounts.map((account) => [String(account.id), Number(account.balance ?? 0)]))
  const activity = new Map(accounts.map((account) => [String(account.id), 0]))

  for (const transaction of transactionResult.docs as any[]) {
    const amount = Number(transaction.amount ?? 0)
    const sourceId = relationshipId(transaction.account)
    const destinationId = relationshipId(transaction.destinationAccount)

    if (transaction.type === 'transfer') {
      if (sourceId && balances.has(sourceId)) {
        balances.set(sourceId, (balances.get(sourceId) ?? 0) - amount)
        activity.set(sourceId, (activity.get(sourceId) ?? 0) + 1)
      }
      if (destinationId && balances.has(destinationId)) {
        balances.set(destinationId, (balances.get(destinationId) ?? 0) + amount)
        activity.set(destinationId, (activity.get(destinationId) ?? 0) + 1)
      }
      continue
    }

    if (!sourceId || !balances.has(sourceId)) continue
    activity.set(sourceId, (activity.get(sourceId) ?? 0) + 1)
    if (transaction.type === 'income') balances.set(sourceId, (balances.get(sourceId) ?? 0) + amount)
    if (transaction.type === 'expense' || transaction.type === 'payment') balances.set(sourceId, (balances.get(sourceId) ?? 0) - amount)
  }

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    source: account.source,
    type: account.type,
    accountNumber: account.accountNumber,
    openingBalance: Number(account.balance ?? 0),
    currentBalance: balances.get(String(account.id)) ?? Number(account.balance ?? 0),
    transactionCount: activity.get(String(account.id)) ?? 0,
    isDefault: Boolean(account.isDefault),
  }))
}

async function getBills(memberId: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'bills', pagination: false, depth: 0, sort: 'dueDate', where: { member: { equals: memberId } } })
  return (result.docs as any[]).map((bill) => ({
    id: bill.id,
    provider: bill.provider,
    customerAccountNumber: bill.customerAccountNumber,
    category: bill.category,
    type: bill.type,
    amount: bill.amount,
    billingPeriodStart: bill.billingPeriodStart,
    billingPeriodEnd: bill.billingPeriodEnd,
    dueDate: bill.dueDate,
  }))
}

async function getLoans(memberId: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'loans', pagination: false, depth: 0, sort: '-createdAt', where: { member: { equals: memberId } } })
  return (result.docs as any[]).map((loan) => ({
    id: loan.id,
    name: loan.name,
    lender: loan.lender,
    loanType: loan.loanType,
    accountNumber: loan.accountNumber,
    principalAmount: loan.principalAmount,
    outstandingBalance: loan.outstandingBalance,
    interestRate: loan.interestRate,
    interestType: loan.interestType,
    monthlyPayment: loan.monthlyPayment,
    paymentFrequency: loan.paymentFrequency,
    startDate: loan.startDate,
    endDate: loan.endDate,
    status: loan.status,
    terms: loan.terms,
    termsPaid: loan.termsPaid,
  }))
}

async function getSpendingSummary(memberId: string, input: Record<string, unknown>) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'transactions',
    pagination: false,
    depth: 0,
    where: transactionWhere(memberId, input, true),
  })

  const byCategory: Record<string, number> = {}
  let total = 0
  for (const transaction of result.docs as any[]) {
    const amount = Number(transaction.amount ?? 0)
    const category = transaction.category || 'other'
    total += amount
    byCategory[category] = (byCategory[category] ?? 0) + amount
  }

  return {
    total,
    transactionCount: result.docs.length,
    byCategory: Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  }
}

async function getFinancialOverview(memberId: string) {
  const payload = await getPayload({ config })
  const [accounts, transactions, bills, loans] = await Promise.all([
    getAccounts(memberId),
    payload.find({ collection: 'transactions', pagination: false, depth: 0, where: { member: { equals: memberId } } }),
    getBills(memberId),
    getLoans(memberId),
  ])

  let income = 0
  let expenses = 0
  for (const transaction of transactions.docs as any[]) {
    const amount = Number(transaction.amount ?? 0)
    if (transaction.type === 'income') income += amount
    if (transaction.type === 'expense' || transaction.type === 'payment') expenses += amount
  }

  return {
    accounts: {
      count: accounts.length,
      currentBalance: accounts.reduce((sum, account) => sum + Number(account.currentBalance ?? 0), 0),
    },
    transactions: {
      count: transactions.docs.length,
      totalIncome: income,
      totalExpensesAndPayments: expenses,
      netCashflow: income - expenses,
    },
    bills: {
      count: bills.length,
      recurringAmount: bills.reduce((sum: number, bill: any) => sum + Number(bill.amount ?? 0), 0),
    },
    loans: {
      count: loans.length,
      outstandingDebt: loans.reduce((sum, loan: any) => sum + Number(loan.outstandingBalance ?? loan.principalAmount ?? 0), 0),
    },
  }
}

async function executeTool(memberId: string, name: string, input: Record<string, unknown>) {
  switch (name) {
    case 'get_financial_overview': return getFinancialOverview(memberId)
    case 'get_transactions': return getTransactions(memberId, input)
    case 'get_spending_summary': return getSpendingSummary(memberId, input)
    case 'get_accounts': return getAccounts(memberId)
    case 'get_bills': return getBills(memberId)
    case 'get_loans': return getLoans(memberId)
    default: throw new Error('Unsupported Fintrax AI tool.')
  }
}

function cleanHistory(messages: FintraxChatMessage[]) {
  return messages
    .filter((message) => (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_MESSAGE_LENGTH) }))
}

async function callClaude(messages: unknown[]): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured.')

  const response = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 1400,
      system: `You are Fintrax AI, a read-only financial assistant inside Fintrax. You may answer general finance questions and questions about the authenticated user's Fintrax accounts, transactions, bills, loans, balances, spending and cash flow. For any claim about the user's Fintrax data, use the provided tools. Never invent amounts or records. Never ask for, guess, expose, or discuss another member's data. You do not have access to any member except the authenticated user represented by the tool results. If asked to modify or delete data, explain that AI actions are not enabled yet. Amounts are in Philippine pesos unless the data clearly says otherwise. Be concise and practical.`,
      tools,
      messages,
    }),
  })

  const data = (await response.json()) as ClaudeResponse
  if (!response.ok) throw new Error(data.error?.message || 'Claude request failed.')
  return data
}

export async function chatWithFintraxAI(memberId: string, history: FintraxChatMessage[]) {
  const messages: any[] = cleanHistory(history)
  if (!messages.length || messages[messages.length - 1]?.role !== 'user') throw new Error('A user message is required.')

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const response = await callClaude(messages)
    const content = response.content ?? []
    const toolCalls = content.filter((block): block is ClaudeToolUseBlock => block?.type === 'tool_use')

    if (!toolCalls.length) {
      const text = content.filter((block): block is ClaudeTextBlock => block?.type === 'text').map((block) => block.text).join('\n').trim()
      return text || 'I could not produce an answer from the available Fintrax data.'
    }

    messages.push({ role: 'assistant', content })
    const toolResults = await Promise.all(toolCalls.map(async (toolCall) => {
      try {
        const result = await executeTool(memberId, toolCall.name, toolCall.input ?? {})
        return { type: 'tool_result', tool_use_id: toolCall.id, content: JSON.stringify(result) }
      } catch (error) {
        return { type: 'tool_result', tool_use_id: toolCall.id, is_error: true, content: error instanceof Error ? error.message : 'Tool failed.' }
      }
    }))
    messages.push({ role: 'user', content: toolResults })
  }

  return 'I reached the Fintrax data lookup limit for this question. Please try a more specific request.'
}
