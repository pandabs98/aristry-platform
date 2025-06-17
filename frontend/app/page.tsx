'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { toast } from 'sonner'

export default function Home() {
  const [user, setUser] = useState<null | any>(undefined)
  const [posts, setPosts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/users/me')
        setUser(userRes.data.user)
      } catch {
        setUser(null)
      }

      try {
        const postRes = await api.get('/content')
        setPosts(postRes.data.data || [])
      } catch {
        toast.error('Failed to load posts')
      }
    }

    fetchData()
  }, [])

  if (user === undefined) {
    return <div className="text-center p-6">Loading...</div>
  }

  return (
    <DashboardLayout user={user}>
      <main className="p-6 space-y-6">
        {user === null && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded">
            Please{" "}
            <span
              className="underline cursor-pointer text-blue-600"
              onClick={() => router.push('/login')}
            >
              login
            </span>{" "}
            to like or follow authors.
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts available</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 p-4 rounded-md shadow-sm bg-white cursor-pointer"
              onClick={() => router.push(`/posts/${post.id}`)} // ✅ navigate to full content page
            >
              <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
              <p className="text-gray-700 mb-2">{post.body}</p> {/* ✅ show full body */}
              <p className="text-sm text-gray-500">By: {post.author?.name || 'Unknown'}</p>


              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Button onClick={(e) => { e.stopPropagation(); handleLike(post.id) }}>
                    👍 {post.likes?.length || 0} Like
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); router.push('/login') }}
                  >
                    Login to Like
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </DashboardLayout>
  )

  async function handleLike(postId: string) {
    try {
      await api.post(`/content/${postId}/like`)
      toast.success('Liked the post!')

      // Update like count locally
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: post.likes?.includes(user.id) ? post.likes.filter((uid: string) => uid !== user.id) : [...(post.likes || []), user.id] }
            : post
        )
      )
    } catch {
      toast.error('Failed to like post')
    }
  }
}
