'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import api from '@/lib/axios'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function EditPostPage() {
    const { id } = useParams()
    const router = useRouter()

    const [user, setUser] = useState(null)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')

    useEffect(() => {
        const fetchUserAndPost = async () => {
            try {
                const userRes = await api.get('/users/me')
                setUser(userRes.data.user)

                const postRes = await api.get(`/content/${id}`)
                const post = postRes.data.data
                setTitle(post.title)
                setBody(post.body)
                setStatus(post.status)
            } catch {
                toast.error("Failed to load post or user")
                router.push('/dashboard')
            }
        }

        fetchUserAndPost()
    }, [id, router])

    const handleUpdate = async () => {
        try {
            await api.put(`/content/${id}`, { title, body, status })
            toast.success("Post updated")
            router.push('/dashboard')
        } catch {
            toast.error("Failed to update post")
        }
    }

    if (!user) return <div className="text-center mt-10">Loading...</div>

    return (

        <DashboardLayout user={user}>
            <h1 className="text-2xl font-bold mb-4 text-center mt-4">Edit Post</h1>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')} className="border rounded px-3 py-2 my-2">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
            </select>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className='mt-2 mb-2'/>
            <Textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
            
            <Button onClick={handleUpdate} className='mr-2 ml-2 mt-4'>Update Post</Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className='mr-2 ml-2 mt-4'>
                Cancel
            </Button>

        </DashboardLayout>

    )
}
