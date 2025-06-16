'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import api from '@/lib/axios'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const contentTypes = ['NOBLE', 'POEM', 'STORY', 'SONG', 'FABLE', 'PROSE', 'EPIC', 'LEGEND', 'BALLAD']
const contentStatuses = ['DRAFT', 'PUBLISHED']

export default function PostCreatePage() {
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('NOBLE')
  const [status, setStatus] = useState('DRAFT')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me')
        setUser(res.data.user)
      } catch {
        toast.error("You must be logged in")
        router.push('/login')
      }
    }
    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/content', { title, body, type, status })
      toast.success('Post created!')
      router.push('/dashboard')
    } catch (err) {
      toast.error('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="text-center mt-10">Loading...</div>

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {contentStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
          <Textarea
            placeholder="Write your content..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            required
            disabled={loading}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Post'}
          </Button>
        </form>
      </main>
    </DashboardLayout>
  )
}
