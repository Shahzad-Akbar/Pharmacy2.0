'use client'
import Link from 'next/link'
import { useState } from 'react'
import PublicNavbar from '@/components/shared/PublicNavbar'
import axios from 'axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [lastEmail, setLastEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    try {
      setIsLoading(true)
      setLastEmail(email)
      await axios.post('/api/auth/forgot-password', { email })
      setIsSubmitted(true)
      setEmail('')
    } catch (err) {
      // Type guard for AxiosError
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
      } else {
        alert('Something went wrong');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resend = async () => {
    setError('')
    if (!lastEmail) return
    try {
      setIsLoading(true)
      await axios.post('/api/auth/forgot-password', { email: lastEmail })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to resend. Please try again.')
      } else {
        alert('Something went wrong');
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full space-y-3 bg-white p-8 rounded-lg shadow-lg">
          {/* Header */}
          <div className="">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-green-700">Apple</span> <span className="text-red-600">Pharma</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 text-center">Reset Password</h2>
            <p className="mt-2 text-center text-gray-600">
              Enter your email address and we will send you instructions to reset your password. The reset link expires in 10 minutes.
            </p>
          </div>

          {/* Form */}
          {!isSubmitted ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

            <div className="text-center text-sm">
              <Link href="/login" className="font-medium text-blue-700 hover:text-sky-600">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="text-green-500 text-xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-600 mb-2">
              We have sent password reset instructions to your email address.
            </p>
            <p className="text-gray-500 mb-6">Didn&apos;t receive it? Check spam or resend below.</p>
            <button
              onClick={resend}
              disabled={isLoading}
              className="mb-4 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Resending...' : 'Resend Reset Link'}
            </button>
            <Link 
              href="/login" 
              className="text-blue-700 hover:text-sky-600 font-medium"
            >
              Return to Login
            </Link>
            <div className="mt-3 text-sm text-gray-500">
              Need help? <Link href="/contact" className="text-blue-700 hover:text-sky-600">Contact support</Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
