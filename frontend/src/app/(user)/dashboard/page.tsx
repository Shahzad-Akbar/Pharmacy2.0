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
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Order {
  _id: string
  id: string
  date: string
  amount: number
  status: string
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const carouselImages = [
    '/userdashboard/mo-i-1.png',
    '/userdashboard/mo-i-2.png',
    '/userdashboard/mo-i-3.jpg',
    '/userdashboard/mo-i-4.png'
  ]

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

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const quickActions = [
    { icon: ShoppingBag, label: 'New Order', href: '/product' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Package, label: 'Track Order', href: '/orders' },
    { icon: Pill, label: 'Prescriptions', href: '/prescriptions' },
  ]

  const stats = [
    { icon: Package, label: 'Total Orders', value: dashboardData.totalOrders },
    { icon: Clock, label: 'Pending Orders', value: dashboardData.pendingOrders },
    { icon: Calendar, label: 'Last Order', value: dashboardData.lastOrderDate ? new Date(dashboardData.lastOrderDate).toLocaleDateString() : 'No orders yet' },
    { icon: AlertCircle, label: 'Active Prescriptions', value: dashboardData.activePrescriptions }
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen bg-cyan-50">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyan-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-300 pt-2 ">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Welcome back, {dashboardData.userName || 'User'}!</h1>
          <p className="text-white/80 mt-1">We are here to provide you Quality Medicine</p>
        </div>
      </header>

      {/* Image Carousel */}
      <div className="relative w-full h-[400px] mb-8 bg-gray-100">
        <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
             style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {carouselImages.map((image, index) => (
            <div key={index} className="relative w-full h-full flex-shrink-0 flex items-center justify-center">
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                fill
                className="object-scale-down md:object-cover" // Responsive object-fit
                priority={index === 0}
                sizes="100vw"
                style={{ width: '100%', height: '100%' }} // Ensure full dimensions
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setCurrentImageIndex(prev => prev === 0 ? carouselImages.length - 1 : prev - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full z-10 hover:bg-white"
        >
          <ChevronLeft className="w-6 h-6 text-blue-600" />
        </button>
        <button
          onClick={() => setCurrentImageIndex(prev => prev === carouselImages.length - 1 ? 0 : prev + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full z-10 hover:bg-white"
        >
          <ChevronRight className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-5 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <action.icon size={32} className="text-blue-600" />
              <span className="text-gray-700 font-medium">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 flex flex-col items-center gap-3"
            >
              <stat.icon size={32} className="text-blue-600" />
              <span className="text-gray-600">{stat.label}</span>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Recent Orders - Full Width */}
        <div className="hidden md:block bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3 text-gray-800">
              <Package size={24} className="text-blue-600" />
              Recent Orders
            </h2>
            <Link href="/orders" className="text-blue-600 hover:underline font-medium">
              View All Orders
            </Link>
          </div>
          <div className="grid gap-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <span className="font-medium text-gray-800">Order #{order.id}</span>
                    <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-800">₹{order.amount}</span>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No recent orders</div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/profile" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">My Profile</Link>
            <Link href="/orders" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Order History</Link>
            <Link href="/prescriptions" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">My Prescriptions</Link>
            <Link href="/support" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Help & Support</Link>
          </div>
        </div>
      </div>

    </div>
  )
}