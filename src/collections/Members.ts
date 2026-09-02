import { isAdminUser, ownMemberAccess } from '@/access/memberOwnership'
import { Member } from '@/payload-types'
import { APIError, type CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'status'],
  },
  auth: true,
  access: {
    create: () => true,
    read: ownMemberAccess,
    update: ownMemberAccess,
    delete: ownMemberAccess,
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      required: true,
      access: {
        update: ({ req }) => isAdminUser(req.user),
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data && !isAdminUser(req.user)) data.status = 'active'
        return data
      },
    ],
    beforeLogin: [
      async ({ user }: { user: Member }) => {
        if (user.status !== 'active') {
          throw new APIError('Your account is not active.', 403)
        }
        return user
      },
    ],
  },
}
