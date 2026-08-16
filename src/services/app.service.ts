import { CollectionSlug, getPayload, PaginatedDocs } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Account, Bill, Member } from '@/payload-types'

export const requireMember = async () => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    return redirect('/signin')
  }
}

export const getCurrentUser = async (): Promise<Member | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: await headers(),
  })

  return user as Member
}

export const getMe = async (): Promise<Member> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'members') {
    return redirect('/signin')
  }

  return user as Member
}

export const myAccounts = async (): Promise<Account[]> => {
  const me = await getMe()
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'accounts',

    where: {
      member: {
        equals: me.id,
      },
    },
  })

  return docs
}

export const myPaginatedCollection = async <T>(
  collection: CollectionSlug,
  page = 1,
  limit = 10,
  relationships: RelationshipConfig[] = [],
): Promise<PaginatedDocs<T>> => {
  const me = await getMe()
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection,
    page,
    limit,
    where: {
      member: {
        equals: me.id,
      },
    },
  })

  if (relationships.length === 0) {
    return result as PaginatedDocs<T>
  }

  const docs = await attachRelationships(result.docs, relationships)

  return {
    ...result,
    docs,
  } as PaginatedDocs<T>
}

type RelationshipConfig = {
  name: string
  collection: CollectionSlug
  foreignKey: string
}

export const attachRelationships = async <T>(
  docs: T[],
  relationships: RelationshipConfig[],
): Promise<T[]> => {
  const payload = await getPayload({ config })

  return Promise.all(
    docs.map(async (doc) => {
      const updatedDoc = {
        ...(doc as object),
      } as Record<string, unknown>

      for (const relationship of relationships) {
        const related = await payload.find({
          collection: relationship.collection,
          where: {
            [relationship.foreignKey]: {
              equals: (doc as { id: string }).id,
            },
          },
          pagination: false,
        })
        updatedDoc[relationship.name] = related.docs
      }

      return updatedDoc as T
    }),
  )
}
