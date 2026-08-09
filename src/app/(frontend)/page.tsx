import './styles.css'
import { requireMember } from '@/services/app.service'

export default async function HomePage() {
  await requireMember()

  return <div></div>
}
