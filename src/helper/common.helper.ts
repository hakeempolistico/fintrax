export const generateKey = () => {
  return crypto.randomUUID()
}

export const dateToReadable = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatAmount = (amount: number | string | null | undefined): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(amount ?? 0))
}

export const getDateByDate = (date: number) => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), date)
}
