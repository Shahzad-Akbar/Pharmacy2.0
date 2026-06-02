'use client'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import {LayoutDashboard, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'

export default function UserNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.replace('/login');
    }
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: 1 },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <Image src="/images/applepharma-logo.png" alt="Apple" width={50} height={50} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-green-800">
              Apple <span className="text-red-600">Medical</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-teal-600 font-medium flex items-center gap-2 relative transition-colors"
              >
                <link.icon size={18} />
                {link.label}
                {link.badge && (
                  <span className="absolute -top-2 -right-3 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md shadow-teal-100"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-teal-600 p-2 rounded-xl bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 text-gray-600 hover:text-teal-600 hover:bg-teal-50 px-4 py-4 rounded-2xl text-base font-bold transition-all"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100">
                  <link.icon size={20} />
                </div>
                {link.label}
                {link.badge && (
                  <span className="ml-auto bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 text-red-600 px-4 py-4 rounded-2xl text-base font-bold w-full transition-colors hover:bg-red-50"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <LogOut size={20} />
                </div>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}