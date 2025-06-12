'use client'

import { useEffect } from 'react' // ✅ You forgot this import
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import api from '@/lib/axios'

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  username: z.string().min(2, "Username is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be 6+ characters"),
  avatar: z.any().optional(),
  coverImage: z.any().optional()
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  const router = useRouter()

  // ✅ Correct usage of useEffect
  useEffect(() => {
    api.get('/users/test')
      .then(res => console.log("✅ Test success:", res.data))
      .catch(err => console.error("❌ Test fail:", err));
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('fullName', data.fullName)
      formData.append('username', data.username)
      formData.append('email', data.email)
      formData.append('password', data.password)

      if (data.avatar instanceof FileList && data.avatar.length > 0) {
        formData.append('avatar', data.avatar[0])
      }

      if (data.coverImage instanceof FileList && data.coverImage.length > 0) {
        formData.append('coverImage', data.coverImage[0])
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const res = await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })

      toast.success(res.data.message || "Registered successfully")
      router.push('/login')
    } catch (err: any) {
      console.error("Register error:", err)
      const message = err?.response?.data?.message || err?.message || "Registration failed"
      toast.error(message)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input placeholder="Full Name" {...register('fullName')} />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

        <Input placeholder="Username" {...register('username')} />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        <Input placeholder="Email" type="email" {...register('email')} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <Input placeholder="Password" type="password" {...register('password')} />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <div>
          <label className="text-sm text-gray-600">Avatar</label>
          <Input type="file" {...register('avatar')} />
        </div>

        <div>
          <label className="text-sm text-gray-600">Cover Image</label>
          <Input type="file" {...register('coverImage')} />
        </div>

        <Button type="submit">
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </div>
  )
}
