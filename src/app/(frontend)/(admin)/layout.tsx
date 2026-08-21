import { Outfit } from 'next/font/google'
import '../globals.css'
import 'flatpickr/dist/flatpickr.css'
import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider } from '@/context/ThemeContext'
import type { Metadata } from 'next'

const outfit = Outfit({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  icons: {
    icon: '/images/logo/logo-fintrax.png',
    shortcut: '/images/logo/logo-fintrax.png',
    apple: '/images/logo/logo-fintrax.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
