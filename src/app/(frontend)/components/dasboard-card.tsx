import Badge from '@/components/ui/badge/Badge'
import { ArrowUpIcon, GroupIcon } from '@/icons'

type FtDashboardCardProps = {
  label: string
  number: string
  className: string
}
const FtDashboardCard = ({ label, number, className }: FtDashboardCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
      </div> */}

      <div className="flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className={`mt-2 font-bold text-gray-800 text-2xl dark:text-white/90 ${className}`}>
            {number}
          </h4>
        </div>
        {/* <Badge color="success">
          <ArrowUpIcon />
          11.01%
        </Badge> */}
      </div>
    </div>
  )
}

export default FtDashboardCard
