'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    api.get('/users/me')
      .then(res => setUser(res.data.user))
      .catch(() => toast.error('Failed to load user'))
  }, [])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await api.put('/users/update', {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        password: user.password,
        avatar: user.avatar,
        coverImage: user.coverImage,
      })
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return
    try {
      await api.delete('/users/delete')
      toast.success('Account deleted')
      router.push('/login')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  if (!user) return <p className="p-4">Loading...</p>

  return (
    <DashboardLayout user={user}>
      <div className="max-w-xl mx-auto mt-10 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

        <Input
          placeholder="Full Name"
          value={user.fullName}
          onChange={e => setUser({ ...user, fullName: e.target.value })}
        />
        <Input
          placeholder="Email"
          type="email"
          value={user.email}
          onChange={e => setUser({ ...user, email: e.target.value })}
        />
        <Input
          placeholder="Username"
          value={user.username}
          onChange={e => setUser({ ...user, username: e.target.value })}
        />
        <Input
          placeholder="Password"
          type="password"
          value={user.password || ''}
          onChange={e => setUser({ ...user, password: e.target.value })}
        />
        <Input
          placeholder="Avatar Image URL"
          value={user.avatar}
          onChange={e => setUser({ ...user, avatar: e.target.value })}
        />
        <Input
          placeholder="Cover Image URL"
          value={user.coverImage}
          onChange={e => setUser({ ...user, coverImage: e.target.value })}
        />

        <Button onClick={handleUpdate} disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>

        {/* Delete button at bottom in red */}
        <div className="mt-12">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
