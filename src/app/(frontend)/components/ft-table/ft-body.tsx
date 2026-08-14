import Badge from '@/components/ui/badge/Badge'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { generateKey } from '@/helper/common.helper'

import {
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  Phone,
  ShieldCheck,
  CreditCard,
  Landmark,
  Building2,
  CircleHelp,
  UserRound,
  House,
  Car,
  GraduationCap,
  BriefcaseBusiness,
  ArrowDownLeft,
  Receipt,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react'
import { FtColumn, FtRow } from './ft-table'

export type FtBodyProps = {
  columns: FtColumn[]
  rows: FtRow[]
}
const FtBody = ({ columns, rows }: FtBodyProps) => {
  return (
    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
      {rows.map((row) => {
        return (
          <TableRow key={generateKey()}>
            {columns.map((col) => {
              const { type, value, subValue, style, icon } = row[col.key]
              return (
                <TableCell
                  key={generateKey()}
                  className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  {type === 'text' && value}
                  {type === 'icon-text' && (
                    <div className="flex items-center gap-2">
                      {icon === 'electricity' && <Zap className="h-5 w-5" />}
                      {icon === 'water' && <Droplets className="h-5 w-5" />}
                      {icon === 'internet' && <Wifi className="h-5 w-5" />}
                      {icon === 'mobile' && <Smartphone className="h-5 w-5" />}
                      {icon === 'telephone' && <Phone className="h-5 w-5" />}
                      {icon === 'insurance' && <ShieldCheck className="h-5 w-5" />}
                      {icon === 'credit-card' && <CreditCard className="h-5 w-5" />}
                      {icon === 'loan' && <Landmark className="h-5 w-5" />}
                      {icon === 'government' && <Building2 className="h-5 w-5" />}
                      {icon === 'personal' && <UserRound className="h-5 w-5" />}
                      {icon === 'home' && <House className="h-5 w-5" />}
                      {icon === 'car' && <Car className="h-5 w-5" />}
                      {icon === 'education' && <GraduationCap className="h-5 w-5" />}
                      {icon === 'business' && <BriefcaseBusiness className="h-5 w-5" />}
                      {icon === 'income' && <ArrowDownLeft className="h-5 w-5" />}
                      {icon === 'payment' && <Receipt className="h-5 w-5" />}
                      {icon === 'expense' && <ArrowUpRight className="h-5 w-5" />}
                      {icon === 'transfer' && <ArrowLeftRight className="h-5 w-5" />}
                      {icon === 'other' && <CircleHelp className="h-5 w-5" />}
                      <div className="value">{value}</div>
                    </div>
                  )}
                  {type === 'two-row' && (
                    <div className="flex items-center">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {value}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {subValue?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  {type === 'badge' && (
                    <Badge size="sm" color={style}>
                      {value.toUpperCase()}
                    </Badge>
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        )
      })}
    </TableBody>
  )
}

export default FtBody
