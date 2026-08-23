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
        description: 'Use this account as the preferred account for future transactions. Only one default account is allowed per member.',
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
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (!data.isDefault) {
          return data
        }

        const memberValue = data.member ?? originalDoc?.member
        const memberId =
          typeof memberValue === 'object' && memberValue !== null ? memberValue.id : memberValue

        if (!memberId) {
          return data
        }

        const currentAccountId = originalDoc?.id
        const existingDefaults = await req.payload.find({
          collection: 'accounts',
          depth: 0,
          pagination: false,
          where: {
            and: [
              {
                member: {
                  equals: memberId,
                },
              },
              {
                isDefault: {
                  equals: true,
                },
              },
              ...(currentAccountId
                ? [
                    {
                      id: {
                        not_equals: currentAccountId,
                      },
                    },
                  ]
                : []),
            ],
          },
        })

        await Promise.all(
          existingDefaults.docs.map((account) =>
            req.payload.update({
              collection: 'accounts',
              id: account.id,
              data: {
                isDefault: false,
              },
            }),
          ),
        )

        return data
      },
    ],
  },
}
