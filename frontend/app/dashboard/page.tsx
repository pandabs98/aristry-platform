'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type User = {
  fullName: string
  email: string
  username: string
  avatar?: { url: string }
}

type Post = {
  id: string
  title: string
  body: String
  content: string
  createdAt: string
  status: 'DRAFT' | 'PUBLISHED'
}

export default function dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
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

    const fetchPosts = async () => {
      try {
        const res = await api.get('/content')
        setPosts(Array.isArray(res.data.data) ? res.data.data : [])
      } catch {
        toast.error("Failed to fetch posts")
      }
    }

    fetchUser()
    fetchPosts()
  }, [router])

  if (!user) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="font-bold text-lg mb-4">Dashboard</h2>
        <ul className="space-y-2">
          <li><Button variant="ghost" onClick={() => router.push('/dashboard')}>Home</Button></li>
          <li><Button variant="ghost" onClick={() => router.push('/posts/create')}>Create Post</Button></li>
          <li><Button variant="ghost" onClick={() => router.push('/settings')}>Settings</Button></li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between p-4 border-b bg-white">
          <div className="w-1/3"></div>
          <div className="w-1/3 flex justify-center">
            <Input type="text" placeholder="Search..." className="w-full max-w-md" />
          </div>
          <div className="w-1/3 flex justify-end items-center gap-4">
            <Button onClick={() => router.push('/posts/create')}>Create</Button>
            {user.avatar?.url && (
              <img src={user.avatar.url} alt="avatar" className="w-8 h-8 rounded-full border" />
            )}
            <Button
              variant="outline"
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
        </nav>

        {/* Content */}
        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-6">Welcome, {user.fullName}</h1>
          {!posts || posts.length === 0 ? (
            <div className="text-center mt-10 text-gray-500">
              No posts yet. <Button onClick={() => router.push('/posts/create')}>Create a new post</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="p-4 border rounded-xl shadow bg-white hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {post.status}
                    </span>

                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{post.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{post.body}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleString()}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => router.push(`/posts/edit/${post.id}`)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const confirmDelete = window.confirm(`Are you sure you want to delete "${post.title}"?`)
                        if (!confirmDelete) return

                        try {
                          await api.delete(`/posts/${post.id}`)
                          setPosts(posts.filter(p => p.id !== post.id))
                          toast.success("Post deleted")
                        } catch {
                          toast.error("Failed to delete post")
                        }
                      }}
                    >
                      Delete
                    </Button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
