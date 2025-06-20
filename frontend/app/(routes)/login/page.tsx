'use client'

import axios from '@/lib/axios'
import * as z from 'zod'
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof formSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await axios.post('/users/login', data)
      toast.success('Login successful')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout >
    <div className="w-full max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            placeholder="Email"
            {...register('email')}
            disabled={loading}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Input
            placeholder="Password"
            type="password"
            {...register('password')}
            disabled={loading}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="text-sm text-center mt-4">
        Don’t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
    </DashboardLayout>
  )
}
