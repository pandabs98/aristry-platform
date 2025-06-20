'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import Image from 'next/image';

type User = {
  fullName: string
  avatar?: { url: string }
}

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me')
        setUser(res.data.user)
      } catch {
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white">
      <div className="w-1/3"></div>
      <div className="w-1/3 flex justify-center">
        <Input type="text" placeholder="Search..." className="w-full max-w-md" />
      </div>
      <div className="w-1/3 flex justify-end items-center gap-4">
        <Button onClick={() => router.push('/posts/create')}>Create</Button>
        {user?.avatar?.url && (
          <Image src={user.avatar.url} alt="avatar" className="w-8 h-8 rounded-full border" />
        )}
        <Button
          variant="danger"
          onClick={() => {
            api.post('/users/logout')
              .then(() => {
                router.push('/login')
              })
          }}
        >
          Logout
        </Button>
      </div>
    </nav>
  )
}
