'use client'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../../../components/ui/table'
import { PaginatedDocs } from 'payload'
import FtPagination from './ft-pagination'
import { useRouter } from 'next/navigation'
import FtHeader from './ft-header'
import FtBody from './ft-body'

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

export type FtColumn = { key: string; value: string; width?: string }
export type FtRow = {
  [key: string]: {
    type: 'text' | 'two-row' | 'badge' | 'id' | 'icon-text'
    value: string
    subValue?: string
    style?: 'success' | 'warning' | 'error'
    icon?:
      | 'electricity'
      | 'water'
      | 'internet'
      | 'mobile'
      | 'telephone'
      | 'insurance'
      | 'credit-card'
      | 'loan'
      | 'government'
      | 'other'
  }
}
export type FtTableProps = {
  columns: FtColumn[]
  rows: FtRow[]
  pagination?: Omit<PaginatedDocs<unknown>, 'docs'>
}

export default function FtTable({ columns, rows, pagination }: FtTableProps) {
  const router = useRouter()
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <FtHeader columns={columns}></FtHeader>

            {/* Table Body */}
            <FtBody columns={columns} rows={rows}></FtBody>
          </Table>
        </div>
      </div>
      {pagination && (
        <div className="flex justify-end p-3">
          <FtPagination
            currentPage={pagination?.page ?? 1}
            totalPages={pagination?.totalPages}
            onPageChange={(page) => router.push(`?page=${page}&limit=10`)}
          ></FtPagination>
        </div>
      )}
    </div>
  )
}
