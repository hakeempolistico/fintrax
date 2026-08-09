import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const requireMember = async () => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    return redirect('/signin')
  }
}
