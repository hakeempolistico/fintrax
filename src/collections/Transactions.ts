import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',

  admin: {
    defaultColumns: ['date', 'type', 'category', 'amount', 'account'],
  },

  fields: [
    // Owner
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

    // Money movement
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Income',
          value: 'income',
        },
        {
          label: 'Payment',
          value: 'payment',
        },
        {
          label: 'Expense',
          value: 'expense',
        },
        {
          label: 'Transfer',
          value: 'transfer',
        },
      ],
    },

    // What the transaction is related to
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Account',
          value: 'account',
        },
        {
          label: 'Bill',
          value: 'bill',
        },
        {
          label: 'Loan',
          value: 'loan',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },

    // Account relationship
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'accounts',
      label: 'Account',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'account',
      },
    },

    // Bill relationship
    {
      name: 'bill',
      type: 'relationship',
      relationTo: 'bills',
      label: 'Bill',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'bill',
      },
    },

    // Loan relationship
    {
      name: 'loan',
      type: 'relationship',
      relationTo: 'loans',
      label: 'Loan',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'loan',
      },
    },

    // Category
    {
      name: 'category',
      type: 'select',
      options: [
        {
          label: 'Salary',
          value: 'salary',
        },
        {
          label: 'Food',
          value: 'food',
        },
        {
          label: 'Transportation',
          value: 'transportation',
        },
        {
          label: 'Shopping',
          value: 'shopping',
        },
        {
          label: 'Utilities',
          value: 'utilities',
        },
        {
          label: 'Rent',
          value: 'rent',
        },
        {
          label: 'Insurance',
          value: 'insurance',
        },
        {
          label: 'Loan Payment',
          value: 'loan-payment',
        },
        {
          label: 'Bill Payment',
          value: 'bill-payment',
        },
        {
          label: 'Entertainment',
          value: 'entertainment',
        },
        {
          label: 'Healthcare',
          value: 'healthcare',
        },
        {
          label: 'Education',
          value: 'education',
        },
        {
          label: 'Travel',
          value: 'travel',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },

    // Payment method
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        {
          label: 'Cash',
          value: 'cash',
        },
        {
          label: 'Bank Transfer',
          value: 'bank-transfer',
        },
        {
          label: 'Credit Card',
          value: 'credit-card',
        },
        {
          label: 'Debit Card',
          value: 'debit-card',
        },
        {
          label: 'Direct Debit',
          value: 'direct-debit',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },

    // Optional reference
    {
      name: 'reference',
      type: 'text',
      label: 'Reference',
      admin: {
        description: 'Transaction reference, receipt number, or confirmation ID.',
      },
    },

    // Notes
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
}
