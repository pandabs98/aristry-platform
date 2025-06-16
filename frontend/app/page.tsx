'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { toast } from 'sonner'

export default function Home() {
  const [user, setUser] = useState<null | any>(undefined) // undefined = loading, null = not logged in
  const [posts, setPosts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/users/me')
        setUser(userRes.data.user)
      } catch {
        setUser(null) // user not logged in
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
              className="border border-gray-200 p-4 rounded-md shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
              <p className="text-gray-700 mb-2">
                {(post.content ? post.content.slice(0, 200) : 'No content available') + '...'}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                By: {post.writer?.name || 'Unknown'}
              </p>

              <div className="flex flex-wrap gap-3">
                {user ? (
                  <>
                    <Button onClick={() => handleLike(post.id)}>👍 Like</Button>
                    <Button
                      onClick={() => handleFollow(post.writer.id)}
                    >
                      ➕ Follow
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/login')}
                    >
                      Login to Like
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/login')}
                    >
                      Login to Follow
                    </Button>
                  </>
                )}
                <Button onClick={() => router.push(`/posts/${post.id}`)}>
                  💬 Comment
                </Button>
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
    } catch {
      toast.error('Failed to like post')
    }
  }

  async function handleFollow(writerId: string) {
    try {
      await api.post(`/users/${writerId}/follow`)
      toast.success('Followed the writer!')
    } catch {
      toast.error('Failed to follow user')
    }
  }
}
