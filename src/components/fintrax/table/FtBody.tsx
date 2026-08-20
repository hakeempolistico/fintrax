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
  UserRound,
  House,
  Car,
  GraduationCap,
  BriefcaseBusiness,
  ArrowDownLeft,
  Receipt,
  ArrowUpRight,
  ArrowLeftRight,
  HouseIcon,
  Pencil,
  CircleEllipsis,
} from 'lucide-react'
import { FtColumn, FtRow } from './ft-table'

export type FtBodyProps = {
  columns: FtColumn[]
  rows: FtRow[]
  onEdit?: (row: FtRow) => void
}

const customIcons: Record<string, string> = {
  meralco: '/images/logo/meralco.png',
  spotify: '/images/logo/spotify.png',
  converge: '/images/logo/converge.png',
}

const iconMap = {
  electricity: {
    icon: Zap,
    classColor: 'text-yellow-500',
  },
  water: {
    icon: Droplets,
    classColor: 'text-blue-500',
  },
  internet: {
    icon: Wifi,
    classColor: 'text-purple-500',
  },
  mobile: {
    icon: Smartphone,
    classColor: 'text-green-500',
  },
  telephone: {
    icon: Phone,
    classColor: 'text-indigo-500',
  },
  insurance: {
    icon: ShieldCheck,
    classColor: 'text-cyan-500',
  },
  'credit-card': {
    icon: CreditCard,
    classColor: 'text-orange-500',
  },
  loan: {
    icon: Landmark,
    classColor: 'text-red-500',
  },
  government: {
    icon: Building2,
    classColor: 'text-slate-500',
  },
  personal: {
    icon: UserRound,
    classColor: 'text-pink-500',
  },
  home: {
    icon: House,
    classColor: 'text-emerald-500',
  },
  car: {
    icon: Car,
    classColor: 'text-blue-600',
  },
  education: {
    icon: GraduationCap,
    classColor: 'text-violet-500',
  },
  business: {
    icon: BriefcaseBusiness,
    classColor: 'text-amber-600',
  },
  income: {
    icon: ArrowDownLeft,
    classColor: 'text-green-600',
  },
  payment: {
    icon: Receipt,
    classColor: 'text-orange-500',
  },
  expense: {
    icon: ArrowUpRight,
    classColor: 'text-red-500',
  },
  transfer: {
    icon: ArrowLeftRight,
    classColor: 'text-teal-500',
  },
  rent: {
    icon: HouseIcon,
    classColor: 'text-blue-500',
  },
  other: {
    icon: CircleEllipsis,
    classColor: 'text-orange-500',
  },
}
const FtBody = ({ columns, rows, onEdit }: FtBodyProps) => {
  return (
    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
      {rows.map((row) => {
        return (
          <TableRow key={row.id?.value ?? generateKey()}>
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
                      {customIcons[value.toLowerCase()] ? (
                        <img
                          src={customIcons[value.toLowerCase()]}
                          alt={`${value} logo`}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        (() => {
                          const { icon: Icon, classColor } = iconMap[icon as keyof typeof iconMap]
                          return Icon ? <Icon className={`h-5 w-5 ${classColor}`} /> : null
                        })()
                      )}
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
            {onEdit && (
              <TableCell className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  aria-label="Edit row"
                  title="Edit"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-brand-400"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </TableCell>
            )}
          </TableRow>
        )
      })}
    </TableBody>
  )
}

export default FtBody
