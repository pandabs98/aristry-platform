'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import axios from '@/lib/axios'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.any().optional(),
  coverImage: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

      const response = await axios.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })

      toast.success(response.data?.message || 'Registration successful')
      router.push('/login')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-xl mx-auto mt-10 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create your account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input placeholder="Full Name" {...register('fullName')} disabled={isSubmitting} />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <Input placeholder="Username" {...register('username')} disabled={isSubmitting} />
            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          </div>
          <div>
            <Input placeholder="Email" type="email" {...register('email')} disabled={isSubmitting} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <Input placeholder="Password" type="password" {...register('password')} disabled={isSubmitting} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-600">Avatar</label>
            <Input type="file" {...register('avatar')} disabled={isSubmitting} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Cover Image</label>
            <Input type="file" {...register('coverImage')} disabled={isSubmitting} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </DashboardLayout>
  )
}
