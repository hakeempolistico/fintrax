import type { CollectionConfig } from 'payload'

export const Accounts: CollectionConfig = {
  slug: 'accounts',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'accountNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'source',
      type: 'text',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Bank Account',
          value: 'bank',
        },
        {
          label: 'Cash',
          value: 'cash',
        },
        {
          label: 'Credit Card',
          value: 'credit-card',
        },
        {
          label: 'E-Wallet',
          value: 'e-wallet',
        },
      ],
    },
    {
      name: 'balance',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: 'Opening Balance',
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default Account',
      admin: {
        description: 'Use this account as the preferred account for future transactions.',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional account information.',
      },
    },
  ],
}
