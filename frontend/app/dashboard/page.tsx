'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type User = {
  fullName: string
  email: string
  username: string
  avatar?: { url: string }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me')
        setUser(res.data.user)
      } catch (err) {
        toast.error("You must be logged in")
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  if (!user) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username}</p>
      {user.avatar?.url && (
        <img
          src={user.avatar.url}
          alt="avatar"
          className="w-32 h-32 rounded-full mt-4 object-cover border"
        />
      )}
      <Button
        className="mt-6"
        onClick={() => {
          api.post('/users/logout')
            .then(() => {
              toast.success("Logged out")
              router.push('/login')
            })
            .catch(() => toast.error("Logout failed"))
        }}
      >
        Logout
      </Button>
    </div>
  )
}
