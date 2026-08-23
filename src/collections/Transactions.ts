import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    defaultColumns: ['date', 'type', 'category', 'amount', 'account'],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      label: 'Amount',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Transaction Date',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Income', value: 'income' },
        { label: 'Payment', value: 'payment' },
        { label: 'Expense', value: 'expense' },
        { label: 'Transfer', value: 'transfer' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Account', value: 'account' },
        { label: 'Bill', value: 'bill' },
        { label: 'Loan', value: 'loan' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'accounts',
      label: 'Account Used',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.source === 'account' ||
          siblingData?.type === 'expense' ||
          siblingData?.type === 'payment' ||
          siblingData?.type === 'transfer',
        description: 'Optional account associated with this transaction. If selected, it is used in account balance calculations.',
      },
    },
    {
      name: 'destinationAccount',
      type: 'relationship',
      relationTo: 'accounts',
      label: 'Destination Account',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'transfer',
      },
    },
    {
      name: 'bill',
      type: 'relationship',
      relationTo: 'bills',
      label: 'Bill',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'bill',
      },
    },
    {
      name: 'billPaymentFor',
      type: 'date',
      label: 'Payment For',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'bill',
        date: {
          pickerAppearance: 'monthOnly',
        },
        description: 'The billing month this payment is for.',
      },
    },
    {
      name: 'loan',
      type: 'relationship',
      relationTo: 'loans',
      label: 'Loan',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'loan',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Salary', value: 'salary' },
        { label: 'Food', value: 'food' },
        { label: 'Transportation', value: 'transportation' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Utilities', value: 'utilities' },
        { label: 'Rent', value: 'rent' },
        { label: 'Insurance', value: 'insurance' },
        { label: 'Loan Payment', value: 'loan-payment' },
        { label: 'Bill Payment', value: 'bill-payment' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Education', value: 'education' },
        { label: 'Travel', value: 'travel' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Bank Transfer', value: 'bank-transfer' },
        { label: 'Credit Card', value: 'credit-card' },
        { label: 'Debit Card', value: 'debit-card' },
        { label: 'Direct Debit', value: 'direct-debit' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'reference',
      type: 'text',
      label: 'Reference',
      admin: {
        description: 'Transaction reference, receipt number, or confirmation ID.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        if (!data) return data

        if (data.type === 'transfer') {
          if (!data.account || !data.destinationAccount) {
            throw new Error('Transfers require both a source and destination account.')
          }

          const sourceId = typeof data.account === 'object' ? data.account.id : data.account
          const destinationId =
            typeof data.destinationAccount === 'object'
              ? data.destinationAccount.id
              : data.destinationAccount

          if (sourceId === destinationId) {
            throw new Error('Source and destination accounts must be different.')
          }
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data.source === 'loan' && data.loan) {
          const loanId = typeof data.loan === 'object' ? data.loan.id : data.loan
          if (loanId) {
            const loan = await req.payload.findByID({
              collection: 'loans',
              id: loanId,
            })
            await req.payload.update({
              collection: 'loans',
              id: loanId,
              data: {
                termsPaid: (loan.termsPaid ?? 0) + 1,
              },
            })
          }
        }
        return data
      },
    ],
  },
}
