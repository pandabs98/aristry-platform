'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()

  const [user, setUser] = useState<null | any>(undefined)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/users/me')
        setUser(userRes.data.user)
      } catch {
        setUser(null)
      }

      try {
        const postRes = await api.get(`/content/${id}`)
        setPost(postRes.data.data)
      } catch {
        toast.error('Failed to load post')
      }

      try {
        const commentRes = await api.get(`/content/comment/${id}`)
        setComments(commentRes.data.data)
      } catch {
        toast.error('Failed to load comments')
      }
    }

    fetchData()
  }, [id])

  if (!post) return <div className="text-center p-6">Loading...</div>

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-gray-700">{post.body}</p>
        <p className="text-sm text-gray-500">By: {post.author?.name || 'Unknown'}</p>


        {user && (
          <Button onClick={handleLike}>
            👍 {post.likes?.length || 0} Like
          </Button>
        )}

        <hr className="my-4" />

        <h2 className="text-xl font-semibold">Comments</h2>

        {user ? (
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <Button onClick={handleComment}>Submit</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Login to comment</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-2 border border-gray-200 rounded-md bg-gray-50"
          >
            <p className="text-gray-800">{comment.text}</p>
            <p className="text-sm text-gray-500">By: {comment.user?.name || comment.userId}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )

  async function handleLike() {
    try {
      await api.post(`/content/${id}/like`)
      toast.success('Liked!')

      setPost((prev: any) => ({
        ...prev,
        likes: prev.likes.includes(user.id)
          ? prev.likes.filter((uid: string) => uid !== user.id)
          : [...prev.likes, user.id]
      }))
    } catch {
      toast.error('Failed to like')
    }
  }

  async function handleComment() {
    if (!newComment.trim()) return toast.error("Comment can't be empty")

    try {
      const res = await api.post(`/content/comment/${id}`, { text: newComment })
      setComments((prev) => [res.data.data, ...prev])
      setNewComment('')
      toast.success('Comment added')
    } catch {
      toast.error('Failed to comment')
    }
  }
}
