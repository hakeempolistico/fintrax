import PortalShell from '@/components/fintrax/layout/PortalShell'
import { getMe } from '@/services/app.service'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const member = await getMe()

  return (
    <PortalShell
      user={{
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
      }}
    >
      {children}
    </PortalShell>
  )
}
