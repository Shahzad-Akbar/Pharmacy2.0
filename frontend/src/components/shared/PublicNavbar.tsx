'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-md">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            {!logoError && (
              <Image
                src="/images/applepharma-logo.png"
                alt="Apple Medical"
                width={70}
                height={70}
                className=""
                onError={() => setLogoError(true)}
                priority
              />
            )}
            <span className="text-2xl font-extrabold tracking-wide group-hover:scale-[1.02] transition-transform">
              <span className="text-green-700">Apple</span>{' '}
              <span className="text-red-600">Medical</span>
            </span>
          </Link>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none rounded-md p-2 hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-green-700 transition-colors">Home</Link>
            <Link href="/about" className="text-gray-700 hover:text-green-700 transition-colors">About</Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-sm hover:shadow-md transition-shadow"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-full border border-green-600 text-green-700 hover:bg-green-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden mt-3`}>
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-green-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-green-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-sm inline-block"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-full border border-green-600 text-green-700 hover:bg-green-50 inline-block"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
