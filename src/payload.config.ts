import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Members } from './collections/Members'
import { Accounts } from './collections/Accounts'
import AICaptureEndpoint from './endpoints/aicapture.endpoint'
import { Bills } from './collections/Bills'
import { Loans } from './collections/Loans'
import { Transactions } from './collections/Transactions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const synchronousImportExport = {
  export: {
    disableJobsQueue: true,
  },
  import: {
    disableJobsQueue: true,
  },
} as const

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Members, Accounts, Bills, Loans, Transactions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    importExportPlugin({
      collections: [
        { slug: 'members', ...synchronousImportExport },
        { slug: 'accounts', ...synchronousImportExport },
        { slug: 'bills', ...synchronousImportExport },
        { slug: 'loans', ...synchronousImportExport },
        { slug: 'transactions', ...synchronousImportExport },
      ],
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        admin: {
          ...collection.admin,
          group: 'Data Management',
        },
      }),
      overrideImportCollection: ({ collection }) => ({
        ...collection,
        admin: {
          ...collection.admin,
          group: 'Data Management',
        },
      }),
    }),
  ],
  endpoints: [AICaptureEndpoint],
})
