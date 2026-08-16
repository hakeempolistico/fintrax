import type { CollectionConfig } from 'payload'

export const Loans: CollectionConfig = {
  slug: 'loans',

  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'lender',
      'loanType',
      'principalAmount',
      'outstandingBalance',
      'status',
    ],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Loan Name',
    },
    {
      name: 'lender',
      type: 'text',
      required: true,
      label: 'Lender',
    },
    {
      name: 'loanType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Personal Loan',
          value: 'personal',
        },
        {
          label: 'Home Loan',
          value: 'home',
        },
        {
          label: 'Car Loan',
          value: 'car',
        },
        {
          label: 'Education Loan',
          value: 'education',
        },
        {
          label: 'Business Loan',
          value: 'business',
        },
        {
          label: 'Credit Card',
          value: 'credit-card',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      name: 'accountNumber',
      type: 'text',
      label: 'Account Number',
    },
    {
      name: 'principalAmount',
      type: 'number',
      required: true,
      label: 'Principal Amount',
      min: 0,
    },
    {
      name: 'outstandingBalance',
      type: 'number',
      label: 'Outstanding Balance',
      min: 0,
    },
    {
      name: 'interestRate',
      type: 'number',
      label: 'Interest Rate (%)',
      min: 0,
    },
    {
      name: 'interestType',
      type: 'select',
      options: [
        {
          label: 'Fixed',
          value: 'fixed',
        },
        {
          label: 'Variable',
          value: 'variable',
        },
      ],
    },
    {
      name: 'monthlyPayment',
      type: 'number',
      label: 'Monthly Payment',
      min: 0,
    },
    {
      name: 'paymentFrequency',
      type: 'select',
      defaultValue: 'monthly',
      options: [
        {
          label: 'Weekly',
          value: 'weekly',
        },
        {
          label: 'Bi-weekly',
          value: 'bi-weekly',
        },
        {
          label: 'Monthly',
          value: 'monthly',
        },
        {
          label: 'Quarterly',
          value: 'quarterly',
        },
        {
          label: 'Yearly',
          value: 'yearly',
        },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Start Date',
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Paid Off',
          value: 'paid-off',
        },
        {
          label: 'Overdue',
          value: 'overdue',
        },
        {
          label: 'Defaulted',
          value: 'defaulted',
        },
      ],
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
    {
      name: 'transactions',
      type: 'relationship',
      relationTo: 'transactions',
      hasMany: true,
    },
  ],
}
