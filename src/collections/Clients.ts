import { authenticatedMemberOrAdmin, forceMemberOwnership, memberOwnedAccess } from '@/access/memberOwnership'
import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    group: 'Business Finance',
  },
  access: {
    create: authenticatedMemberOrAdmin,
    read: memberOwnedAccess,
    update: memberOwnedAccess,
    delete: memberOwnedAccess,
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
      name: 'name',
      label: 'Client / Business Name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'contactName',
      label: 'Contact Person',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [forceMemberOwnership],
  },
}
