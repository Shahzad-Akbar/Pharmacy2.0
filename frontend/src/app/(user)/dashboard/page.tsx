'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import {
  ShoppingBag,
  Package,
  Clock,
  Heart,
  Pill,
  Calendar,
  LayoutDashboard,
  User,
  ChevronRight
} from 'lucide-react'

interface Order {
  _id: string
  id: string
  date: string
  amount: number
  status: string
  trackingStatus?: string
}

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: '0',
    pendingOrders: '0',
    activePrescriptions: '0',
    lastOrderDate: null,
    userName: ''
  })

  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const statsResponse = await axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const ordersResponse = await axios.get('/api/dashboard/orders/recent', {
          headers: { Authorization: `Bearer ${token}` }
        })

        setDashboardData(statsResponse.data)
        setRecentOrders(ordersResponse.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickActions = [
    { icon: ShoppingBag, label: 'New Order', desc: 'Place a new order for medicines', href: '/product' },
    { icon: Heart, label: 'Wishlist', desc: 'View and manage your saved items', href: '/wishlist' },
    { icon: Package, label: 'Track Order', desc: 'Track your orders in real-time', href: '/orders' },
    { icon: Pill, label: 'Prescriptions', desc: 'Upload and manage your prescriptions', href: '/prescriptions' },
  ]

  const stats = [
    { icon: LayoutDashboard, label: 'Total Orders', value: dashboardData.totalOrders, sub: 'All time orders placed' },
    { icon: Clock, label: 'Pending Orders', value: dashboardData.pendingOrders, sub: 'Awaiting confirmation' },
    { icon: Calendar, label: 'Last Order', value: dashboardData.lastOrderDate ? new Date(dashboardData.lastOrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No orders yet', sub: 'In-transit', isDate: true },
    { icon: Pill, label: 'Active Prescriptions', value: dashboardData.activePrescriptions, sub: 'No active prescriptions' }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'in-transit':
      case 'in transit': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fcfc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f9f9] text-gray-800 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-50">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-10 lg:p-16 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <User className="text-teal-600" size={32} />
                </div>
                <div>
                  <h2 className="text-lg text-gray-500 font-medium">Welcome back,</h2>
                  <h1 className="text-3xl font-bold text-slate-900">{dashboardData.userName || 'User'}!</h1>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-extrabold text-slate-900 leading-tight">
                  Quality Medicine,<br />
                  <span className="text-teal-600 font-medium ">Personalized Care.</span>
                </h3>
                <p className="text-gray-500 text-lg max-w-md leading-relaxed">
                  Apple Medical is a trusted provider of genuine medicines with pharmacy and medical-grade care you can rely on.
                </p>
                <Link 
                  href="/product"
                  className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-teal-100"
                >
                  Shop Medicines
                </Link>
              </div>
            </div>
            <div className="relative h-full min-h-[400px] hidden md:block">
              <Image
                src="/userdashboard/mo-i-1.png"
                alt="Healthcare Products"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group bg-white p-8 rounded-[24px] border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-teal-50/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-teal-600" size={20} />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                  <action.icon size={28} className="text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{action.label}</h4>
                  <p className="text-gray-400 text-sm mt-1">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-8 rounded-[24px] border border-gray-50 shadow-sm flex items-start gap-5"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                <stat.icon size={24} className="text-teal-600" />
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
                <h5 className={`text-2xl font-bold text-slate-900 ${stat.isDate ? 'text-lg' : ''}`}>{stat.value}</h5>
                <p className={`text-xs font-medium ${stat.isDate ? 'text-teal-600' : 'text-gray-400'}`}>{stat.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Recent Orders Table */}
        <section className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Recent Orders
            </h2>
            <Link href="/orders" className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1">
              View All Orders <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Order Date</th>

                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="px-8 py-6 font-medium text-slate-700 text-sm">#{order.id}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 text-center">
                        {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="px-8 py-6 text-right font-bold text-slate-900">₹{order.amount}</td>
                      <td className="px-8 py-6 text-center">
                        <Link 
                          href={`/orders`}
                          className="text-teal-600 hover:text-teal-700 font-bold text-sm bg-teal-50 px-4 py-2 rounded-lg transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-medium">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

    </div>
  )
}