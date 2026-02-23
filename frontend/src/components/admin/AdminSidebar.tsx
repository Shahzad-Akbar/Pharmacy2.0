'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  FileText,
  LogOut
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Package, label: 'Products', href: '/admin/product' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: FileText, label: 'Inventory', href: '/admin/inventory' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' }
  ]

  const handleLogout = async () => {
    try {
      // 1. Clear all local storage
      localStorage.clear();
      
      // 2. Clear all session storage
      sessionStorage.clear();

      // 3. Call backend logout to clear cookies
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // 4. Force a hard reload and redirect to login
      // This ensures all state is wiped and replaces history entry
      window.location.replace('/login');
    }
  }

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-2xl font-bold text-green-300">
          PHARMACY
        </Link>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                isActive 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded text-red-400 hover:bg-gray-700 hover:text-red-300 w-full mt-4"
        >
          <LogOut size={20} />
          Logout
        </button>
      </nav>
    </aside>
  )
}