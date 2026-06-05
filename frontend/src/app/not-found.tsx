'use client'

import Link from 'next/link'

export default function NotFound() {
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">The page you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link 
          href="/"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}