'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/axios'
import { toast } from 'sonner'
import clsx from 'clsx'

type DashboardLayoutProps = {
  children: ReactNode
  user: {
    fullName: string
    avatar?: { url: string }
  }
}

// Utility function to get page title from route
const getPageTitle = (pathname: string) => {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname === '/') return 'Home Page'
  if (pathname.startsWith('/posts/create')) return 'Create Post'
  if (pathname.startsWith('/posts/edit')) return 'Edit Page'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Dashboard'
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="font-bold text-lg mb-4">{pageTitle}</h2>
        <ul className="space-y-2">
          <li>
            <Button
              variant={pathname === '/dashboard' ? 'default' : 'ghost'}
              className={clsx('w-full justify-start')}
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              className={clsx('w-full justify-start')}
              onClick={() => router.push('/')}
            >
              Home
            </Button>
          </li>
          <li>
            <Button
              variant={pathname === '/posts/create' ? 'default' : 'ghost'}
              className={clsx('w-full justify-start')}
              onClick={() => router.push('/posts/create')}
            >
              Create Post
            </Button>
          </li>
          <li>
            <Button
              variant={pathname === '/settings' ? 'default' : 'ghost'}
              className={clsx('w-full justify-start')}
              onClick={() => router.push('/settings')}
            >
              Settings
            </Button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between p-4 border-b bg-white">
          <div className="w-1/3" />
          <div className="w-1/3 flex justify-center">
            <Input type="text" placeholder="Search..." className="w-full max-w-md" />
          </div>
          <div className="w-1/3 flex justify-end items-center gap-4">
            {user ? (
              <>
                <Button onClick={() => router.push('/posts/create')}>Create</Button>
                {user.avatar?.url && (
                  <img src={user.avatar.url} alt="avatar" className="w-8 h-8 rounded-full border" />
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    api.post('/users/logout')
                      .then(() => {
                        toast.success('Logged out')
                        router.push('/login')
                      })
                      .catch(() => toast.error('Logout failed'))
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push('/login')}>Login</Button>
            )}
          </div>

        </nav>

        {/* Page Content */}
        <main className="p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
