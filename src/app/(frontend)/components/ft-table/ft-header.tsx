import { TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { FtColumn } from './ft-table'

type FtHeaderProps = {
  columns: FtColumn[]
}
const FtHeader = ({ columns }: FtHeaderProps) => {
  return (
    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
      <TableRow>
        {columns.map((col) => {
          return (
            <TableCell
              key={col.key}
              isHeader
              className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${col.width ? `w-[${col.width}]` : ''}`}
            >
              {col.value}
            </TableCell>
          )
        })}
      </TableRow>
    </TableHeader>
  )
}

export default FtHeader
