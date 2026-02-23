'use client'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import PublicNavbar from '@/components/shared/PublicNavbar'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const registered = searchParams.get('registered');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data) {
        // Clear any existing session data before setting new one
        localStorage.clear();
        sessionStorage.clear();
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        
        // Use window.location.replace to ensure the cookie is processed by middleware
        // on the next request and to clear history
        let targetUrl = response.data.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        
        // If there was a callbackUrl, use it (unless it was login/signup)
        if (callbackUrl && !callbackUrl.includes('/login') && !callbackUrl.includes('/signup')) {
          targetUrl = callbackUrl;
        }

        window.location.replace(targetUrl);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <Link href="/" className="text-2xl font-bold text-green-300">
           <span className="text-xl font-extrabold tracking-wide group-hover:scale-[1.02] transition-transform">
            <span className="text-green-700">Apple</span>{' '}
            <span className="text-red-600">Pharma</span>
          </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 text-center">Sign in to your account</h2>
        </div>

        {registered && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center animate-pulse" role="alert">
            <span className="block sm:inline font-medium">Account created successfully!</span>
            <p className="text-sm">You can now sign in with your credentials.</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-sm text-right">
              <Link href="/forgot-password" className="font-medium text-blue-700 hover:text-sky-600">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/signup" className="font-medium text-blue-700 hover:text-sky-600">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div>
      <PublicNavbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}