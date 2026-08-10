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
      name: 'billNumber',
      type: 'text',
      index: true,
    },
    {
      name: 'type',
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
    // Amount
    {
      name: 'amountDue',
      type: 'number',
      required: true,
      min: 0,
    },
    // Billing period
    {
      name: 'billingPeriodStart',
      type: 'date',
    },
    {
      name: 'billingPeriodEnd',
      type: 'date',
    },
    {
      name: 'dueDate',
      type: 'date',
    },
    {
      name: 'issueDate',
      type: 'date',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}
