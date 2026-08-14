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
