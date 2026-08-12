'use client'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../../components/ui/table'

import Badge from '../../../components/ui/badge/Badge'
import Image from 'next/image'
import Pagination from '../tables/Pagination'

interface Order {
  id: number
  user: {
    image: string
    name: string
    role: string
  }
  projectName: string
  team: {
    images: string[]
  }
  status: string
  budget: string
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: '/images/user/user-17.jpg',
      name: 'Lindsey Curtis',
      role: 'Web Designer',
    },
    projectName: 'Agency Website',
    team: {
      images: ['/images/user/user-22.jpg', '/images/user/user-23.jpg', '/images/user/user-24.jpg'],
    },
    budget: '3.9K',
    status: 'Active',
  },
  {
    id: 2,
    user: {
      image: '/images/user/user-18.jpg',
      name: 'Kaiya George',
      role: 'Project Manager',
    },
    projectName: 'Technology',
    team: {
      images: ['/images/user/user-25.jpg', '/images/user/user-26.jpg'],
    },
    budget: '24.9K',
    status: 'Pending',
  },
  {
    id: 3,
    user: {
      image: '/images/user/user-17.jpg',
      name: 'Zain Geidt',
      role: 'Content Writing',
    },
    projectName: 'Blog Writing',
    team: {
      images: ['/images/user/user-27.jpg'],
    },
    budget: '12.7K',
    status: 'Active',
  },
  {
    id: 4,
    user: {
      image: '/images/user/user-20.jpg',
      name: 'Abram Schleifer',
      role: 'Digital Marketer',
    },
    projectName: 'Social Media',
    team: {
      images: ['/images/user/user-28.jpg', '/images/user/user-29.jpg', '/images/user/user-30.jpg'],
    },
    budget: '2.8K',
    status: 'Cancel',
  },
  {
    id: 5,
    user: {
      image: '/images/user/user-21.jpg',
      name: 'Carla George',
      role: 'Front-end Developer',
    },
    projectName: 'Website',
    team: {
      images: ['/images/user/user-31.jpg', '/images/user/user-32.jpg', '/images/user/user-33.jpg'],
    },
    budget: '4.5K',
    status: 'Active',
  },
]

export type FtTableProps = {
  columns: { key: string; value: string; width?: string }[]

  rows: {
    [key: string]: {
      type: 'text' | 'two-row' | 'badge' | 'id'
      value: string
      subValue?: string
      style?: 'success' | 'warning' | 'error'
    }
  }[]
}
export default function FtTable({ columns, rows }: FtTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
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

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rows.map((row) => {
                return (
                  <TableRow key={''}>
                    {columns.map((col) => {
                      const { type, value, subValue, style } = row[col.key]
                      return (
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {type === 'text' && value}
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
          </Table>
        </div>
      </div>
      <div className="flex justify-end p-3">
        <Pagination currentPage={1} totalPages={100} onPageChange={() => {}}></Pagination>
      </div>
    </div>
  )
}
