'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Bell,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
  Package,
  Users,
  PackageCheck,
  Boxes,
  Settings,
  PillBottle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DashboardStats {
  totalSales: string
  totalOrders: string
  pendingOrders: string
  lowStock: string
}

interface RecentOrder {
  id: string
  customer: string
  status: string
  amount: string
  date: string
}

interface LowStockItem {
  id: string
  name: string
  price: string
  category: string
  stock: string
  expiryDate: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: '₹0',
    totalOrders: '0',
    pendingOrders: '0',
    lowStock: '0'
  })

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await axios.get('/api/dashboard/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(statsResponse.data)
  
      try {
        // Fetch recent orders - handle empty state gracefully
        const ordersResponse = await axios.get('/api/dashboard/admin/recent-order', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRecentOrders(ordersResponse.data)
      } catch (orderError) {
       console.log('Error fetching recent orders:', orderError)
        setRecentOrders([])
      }
  
      // Fetch notifications
      const notificationsResponse = await axios.get('/api/dashboard/admin/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setLowStockItems(notificationsResponse.data)  
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="p-4 sm:p-6 bg-blue-100 min-h-screen">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <button
          onClick={() => router.push('/admin/sales')}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left group cursor-pointer"
          aria-label="View Sales Analytics"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm group-hover:text-blue-600">Total Sales</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-blue-700">{stats.totalSales}</h3>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full group-hover:bg-blue-200">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/orders/analytics')}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left group cursor-pointer"
          aria-label="View Orders Analytics"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm group-hover:text-blue-600">Total Orders</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-blue-700">{stats.totalOrders}</h3>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full group-hover:bg-green-200">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/orders')}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm group-hover:text-yellow-600">Pending Orders</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-yellow-700">{stats.pendingOrders}</h3>
            </div>
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-full group-hover:bg-yellow-200">
              <Bell className="text-yellow-600" size={24} />
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/inventory')}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm group-hover:text-red-600">Low Stock Items</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-red-700">{stats.lowStock}</h3>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full group-hover:bg-red-200">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
            {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded gap-2">
                    <div>
                      <span className="font-medium text-gray-800 block sm:inline">{order.id}</span>
                      <p className="text-xs sm:text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex justify-between sm:block sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="font-medium text-gray-800 block">₹{order.amount}</span>
                      <p className="text-xs sm:text-sm text-gray-500">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No recent orders</div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Low Stock Alert</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
            {lowStockItems.length > 0 ? (
                lowStockItems.map((items) => (
                  <div key={items.id} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded">
                    <div className="col-span-2 sm:col-span-1">
                      <span className="font-medium text-gray-800 block truncate">{items.name}</span>
                      <p className="text-xs sm:text-sm text-gray-500">Expiry: {new Date(items.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-medium text-gray-800 block">₹{items.price}</span>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{items.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-800 block text-xs uppercase tracking-wider text-gray-400">Stock</span>
                      <p className={`text-sm font-bold ${Number(items.stock) <= 10 ? 'text-red-600' : 'text-orange-600'}`}>{items.stock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No stock alerts</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
        <button 
        onClick={() => {window.location.href = '/admin/inventory';}}
        className="p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center justify-center">
          <Package className="mb-2 text-blue-600" size={24} />
          <p className="text-xs sm:text-sm text-center font-medium text-gray-800">Inventory</p>
        </button>
        <button 
        onClick={() =>{window.location.href = '/admin/users'}}
        className="p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center justify-center">
          <Users className="mb-2 text-green-600" size={24} />
          <p className="text-xs sm:text-sm text-center font-medium text-gray-800">Customers</p>
        </button>
        <button 
        onClick={()=>{window.location.href='/admin/orders';}}
        className="p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center justify-center">
          <PackageCheck className="mb-2 text-green-600" size={24} />
          <p className="text-xs sm:text-sm text-center font-medium text-gray-800">Orders</p>
        </button>
        <button 
        onClick={() => {window.location.href = '/admin/product';}}
        className="p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center justify-center">
          <Boxes className="mb-2 text-cyan-600" size={24} />
          <p className="text-xs sm:text-sm text-center font-medium text-gray-800">Products</p>
        </button>
        <button 
        onClick={() => {window.location.href = '/admin/prescriptions';}}
        className="p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center justify-center">
          <PillBottle className="mb-2 text-cyan-600" size={24} />
          <p className="text-xs sm:text-sm text-center font-medium text-gray-800 leading-tight">User Prescriptions</p>
        </button>
        <button 
        onClick={() => {window.location.href = '/admin/settings';}}
        className="p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center justify-center">
          <Settings className="mb-2 text-gray-600" size={24} />
          <p className="text-xs sm:text-sm text-center font-medium text-gray-800">Settings</p>
        </button>
      </div>
    </div>
  )
}
