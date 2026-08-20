type DashboardCardProps = {
  label: string
  number: string
  className?: string
}

export default function DashboardCard({ label, number, className = '' }: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <h4 className={`mt-2 text-xl font-bold text-gray-800 dark:text-white/90 ${className}`}>{number}</h4>
    </div>
  )
}
