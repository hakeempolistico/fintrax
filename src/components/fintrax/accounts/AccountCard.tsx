import { Account } from '@/payload-types'
import { Banknote, CreditCard, Landmark, WalletCards } from 'lucide-react'

interface InfoCardProps {
  account: Account
}

const accountTypeConfig: Record<
  NonNullable<Account['type']>,
  {
    label: string
    icon: React.ElementType
    iconClass: string
    bgClass: string
  }
> = {
  bank: {
    label: 'Bank Account',
    icon: Landmark,
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
  },
  cash: {
    label: 'Cash',
    icon: Banknote,
    iconClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-50 dark:bg-green-500/10',
  },
  'credit-card': {
    label: 'Credit Card',
    icon: CreditCard,
    iconClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
  },
  'e-wallet': {
    label: 'E-Wallet',
    icon: WalletCards,
    iconClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
  },
}

export default function AccountCard({ account }: InfoCardProps) {
  const config = accountTypeConfig[account.type]

  const Icon = config.icon

  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(account.balance)

  return (
    <div className="grid min-w-0 grid-cols-12 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="col-span-3 min-w-0">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${config.bgClass}`}>
          <Icon className={`h-9 w-9 ${config.iconClass}`} />
        </div>
      </div>
      <div className="col-span-1"></div>
      <div className="col-span-8 min-w-0 max-w-full">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{account.source}</p>
        <h3 className="text-md text-gray-900 dark:text-white">{account.name}</h3>
        <h3 className="text-md text-gray-900 dark:text-white">{account.accountNumber}</h3>
        <p className="text-xl font-bold tracking-tight text-success-600 dark:text-white">
          {formattedBalance}
        </p>
      </div>
    </div>
  )
}
