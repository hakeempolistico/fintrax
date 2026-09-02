import { authenticatedMemberOnly, forceMemberOwnership, memberOnlyOwnedAccess } from '@/access/memberOwnership'
import type { CollectionConfig } from 'payload'

export const AIConversations: CollectionConfig = {
  slug: 'ai-conversations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'member', 'updatedAt'],
    group: 'AI',
  },
  access: {
    create: authenticatedMemberOnly,
    read: memberOnlyOwnedAccess,
    update: memberOnlyOwnedAccess,
    delete: memberOnlyOwnedAccess,
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
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'messages',
      type: 'array',
      required: true,
      maxRows: 200,
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
          ],
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
          maxLength: 12000,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [forceMemberOwnership],
  },
}
