import type { CollectionConfig } from 'payload'

export const Bills: CollectionConfig = {
  slug: 'bills',
  admin: {
    useAsTitle: 'provider',
    defaultColumns: ['provider', 'customerAccountNumber', 'amountDue', 'dueDate'],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
    },
    {
      name: 'customerAccountNumber',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Electricity',
          value: 'electricity',
        },
        {
          label: 'Water',
          value: 'water',
        },
        {
          label: 'Internet',
          value: 'internet',
        },
        {
          label: 'Mobile',
          value: 'mobile',
        },
        {
          label: 'Telephone',
          value: 'telephone',
        },
        {
          label: 'Insurance',
          value: 'insurance',
        },
        {
          label: 'Credit Card',
          value: 'credit-card',
        },
        {
          label: 'Loan',
          value: 'loan',
        },
        {
          label: 'Government',
          value: 'government',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      name: 'type',
      type: 'select',
      options: [
        {
          label: 'Subscription',
          value: 'subscription',
        },
        {
          label: 'Variable',
          value: 'variable',
        },
      ],
      defaultValue: 'subscription',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        condition: (_, siblingData) => siblingData?.billingType === 'subscription',
      },
    },
    {
      name: 'billingPeriodStart',
      type: 'number',
      min: 1,
      max: 31,
    },
    {
      name: 'billingPeriodEnd',
      type: 'number',
      min: 1,
      max: 31,
    },
    {
      name: 'dueDate',
      type: 'number',
      min: 1,
      max: 31,
    },
    {
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'transactions',
      type: 'relationship',
      relationTo: 'transactions',
      hasMany: true,
    },
  ],
}
