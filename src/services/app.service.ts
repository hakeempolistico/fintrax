import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Account, Member } from '@/payload-types'

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
