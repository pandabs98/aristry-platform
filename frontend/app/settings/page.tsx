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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    api.get('/users/me')
      .then(res => setUser(res.data.user))
      .catch(() => toast.error('Failed to load user'))
  }, [])

  const handleUpdateAccount = async () => {
    setLoading(true)
    try {
      await api.patch('/users/update-account', {
        fullName: user.fullName,
        email: user.email
      })
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return toast.error("No avatar selected")
    const formData = new FormData()
    formData.append('avatar', avatarFile)

    try {
      await api.post('/users/update-avatar', formData)
      toast.success('Avatar updated successfully')
    } catch {
      toast.error('Avatar update failed')
    }
  }

  const handleCoverUpload = async () => {
    if (!coverFile) return toast.error("No cover image selected")
    const formData = new FormData()
    formData.append('coverImage', coverFile)

    try {
      await api.post('/users/update-cover-image', formData)
      toast.success('Cover image updated successfully')
    } catch {
      toast.error('Cover image update failed')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return
    try {
      await api.post('/users/deleteUser') 
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
          placeholder="Username"
          value={user.username}
          onChange={e => setUser({ ...user, username: e.target.value })}
        />
        <Input
          placeholder="Email"
          type="email"
          value={user.email}
          onChange={e => setUser({ ...user, email: e.target.value })}
        />

        <Button onClick={handleUpdateAccount} disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Update Account'}
        </Button>

        <hr className="my-4" />

        <div>
          <p className="font-semibold mb-2">Upload Avatar</p>
          <Input type="file" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
          <Button onClick={handleAvatarUpload} className="mt-2">Upload Avatar</Button>
        </div>

        <div>
          <p className="font-semibold mt-4 mb-2">Upload Cover Image</p>
          <Input type="file" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
          <Button onClick={handleCoverUpload} className="mt-2">Upload Cover Image</Button>
        </div>

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
