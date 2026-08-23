import { CollectionSlug, getPayload, PaginatedDocs } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Account, Bill, Member, Transaction } from '@/payload-types'

type TransactionWithDestination = Transaction & {
  destinationAccount?: string | Account | null
}

export type AccountWithBalance = Account & {
  isDefault?: boolean
  currentBalance: number
  totalIn: number
  totalOut: number
  transactionCount: number
  lastTransactionDate?: string
  recentTransactions: TransactionWithDestination[]
}

export const requireMember = async () => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return redirect('/signin')
}

export const getCurrentUser = async (): Promise<Member | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user as Member
}

export const getMe = async (): Promise<Member> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'members') return redirect('/signin')
  return user as Member
}

export const myAccounts = async (): Promise<Account[]> => {
  const me = await getMe()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'accounts',
    pagination: false,
    where: { member: { equals: me.id } },
  })
  return docs
}

export const myAccountsWithBalances = async (): Promise<AccountWithBalance[]> => {
  const accounts = await myAccounts()
  if (accounts.length === 0) return []

  const payload = await getPayload({ config })
  const accountIds = accounts.map((account) => account.id)

  const { docs } = await payload.find({
    collection: 'transactions',
    depth: 0,
    pagination: false,
    sort: '-date',
    where: {
      or: [
        { account: { in: accountIds } },
        { destinationAccount: { in: accountIds } },
      ],
    } as any,
  })

  const transactions = docs as TransactionWithDestination[]
  const summaries = new Map<string, AccountWithBalance>(
    accounts.map((account) => [
      account.id,
      {
        ...account,
        isDefault: (account as Account & { isDefault?: boolean }).isDefault ?? false,
        currentBalance: account.balance ?? 0,
        totalIn: 0,
        totalOut: 0,
        transactionCount: 0,
        recentTransactions: [],
      },
    ]),
  )

  transactions.forEach((transaction) => {
    const sourceAccountId = typeof transaction.account === 'string' ? transaction.account : transaction.account?.id
    const destinationAccountId = typeof transaction.destinationAccount === 'string' ? transaction.destinationAccount : transaction.destinationAccount?.id
    const amount = transaction.amount ?? 0

    const addRecent = (accountId?: string) => {
      if (!accountId) return
      const summary = summaries.get(accountId)
      if (summary && summary.recentTransactions.length < 5) summary.recentTransactions.push(transaction)
    }

    if (transaction.type === 'transfer') {
      if (sourceAccountId) {
        const source = summaries.get(sourceAccountId)
        if (source) {
          source.currentBalance -= amount
          source.transactionCount += 1
          source.lastTransactionDate ??= transaction.date
          addRecent(sourceAccountId)
        }
      }

      if (destinationAccountId) {
        const destination = summaries.get(destinationAccountId)
        if (destination) {
          destination.currentBalance += amount
          destination.transactionCount += 1
          destination.lastTransactionDate ??= transaction.date
          addRecent(destinationAccountId)
        }
      }
      return
    }

    if (!sourceAccountId) return
    const summary = summaries.get(sourceAccountId)
    if (!summary) return

    summary.transactionCount += 1
    summary.lastTransactionDate ??= transaction.date
    addRecent(sourceAccountId)

    if (transaction.type === 'income') {
      summary.totalIn += amount
      summary.currentBalance += amount
      return
    }

    if (transaction.type === 'expense' || transaction.type === 'payment') {
      summary.totalOut += amount
      summary.currentBalance -= amount
    }
  })

  return accounts.map((account) => summaries.get(account.id) as AccountWithBalance)
}

export const myPaginatedCollection = async <T>(
  collection: CollectionSlug,
  page = 1,
  limit = 10,
  relationships: RelationshipConfig[] = [],
  sort = '-createdAt',
): Promise<PaginatedDocs<T>> => {
  const me = await getMe()
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection,
    page,
    limit,
    sort,
    where: { member: { equals: me.id } },
  })

  if (relationships.length === 0) return result as PaginatedDocs<T>

  const docs = await attachRelationships(result.docs, relationships)
  return { ...result, docs } as PaginatedDocs<T>
}

type RelationshipConfig = {
  name: string
  collection: CollectionSlug
  foreignKey: string
  sort?: string
}

export const attachRelationships = async <T>(docs: T[], relationships: RelationshipConfig[]): Promise<T[]> => {
  const payload = await getPayload({ config })

  return Promise.all(
    docs.map(async (doc) => {
      const updatedDoc = { ...(doc as object) } as Record<string, unknown>
      for (const relationship of relationships) {
        const related = await payload.find({
          collection: relationship.collection,
          where: { [relationship.foreignKey]: { equals: (doc as { id: string }).id } },
          pagination: false,
        })
        updatedDoc[relationship.name] = related.docs
      }
      return updatedDoc as T
    }),
  )
}

export const getTransactionsThisMonth = async (memberId?: string) => {
  const payload = await getPayload({ config })
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const { docs } = await payload.find({
    collection: 'transactions',
    pagination: false,
    where: {
      and: [
        ...(memberId ? [{ member: { equals: memberId } }] : []),
        { date: { greater_than_equal: startOfMonth.toISOString() } },
        { date: { less_than: startOfNextMonth.toISOString() } },
      ],
    },
  })
  return docs
}

export const getTotalExpensesAndPayments = (transactions: Transaction[]) =>
  transactions
    .filter((transaction) => transaction.type === 'expense' || transaction.type === 'payment')
    .reduce((total, transaction) => total + (transaction.amount ?? 0), 0)

export const getAverageMonthlyExpenses = (transactions: Transaction[]) => {
  const monthlyTotals = new Map<string, number>()
  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense' && transaction.type !== 'payment') return
    const date = new Date(transaction.date)
    if (date.getFullYear() < 2026 || (date.getFullYear() === 2026 && date.getMonth() + 1 < 8)) return
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + (transaction.amount ?? 0))
  })

  if (monthlyTotals.size === 0) return 0
  const total = Array.from(monthlyTotals.values()).reduce((sum, amount) => sum + amount, 0)
  return total / monthlyTotals.size
}
