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
    <div className="p-6 bg-blue-100 min-h-screen">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <button
          onClick={() => router.push('/admin/sales')}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left group cursor-pointer"
          aria-label="View Sales Analytics"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm group-hover:text-blue-600">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700">{stats.totalSales}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/orders/analytics')}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left group cursor-pointer"
          aria-label="View Orders Analytics"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm group-hover:text-blue-600">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700">{stats.totalOrders}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </button>

        <button onClick={() => router.push('/admin/orders')}
          className='hover:shadow-md transition-shadow text-left group cursor-pointer'>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Bell className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        </button>

        <button onClick={() => router.push('/admin/inventory')}
          className='hover:shadow-md transition-shadow text-left group cursor-pointer'>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.lowStock}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
            {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-800">{order.id}</span>
                      <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-800">₹{order.amount}</span>
                      <p className="text-sm text-gray-500">{order.status}</p>
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
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Low Stock Alert</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
            {lowStockItems.length > 0 ? (
                lowStockItems.map((items) => (
                  <div key={items.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-800">{items.name}</span>
                      <p className="text-sm text-gray-500">{new Date(items.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-800">₹{items.price}</span>
                      <p className="text-sm text-gray-500">{items.category}</p>
                    </div>
                    <div className="text-right">
                    <span className="font-medium text-gray-800">Stock</span>
                    <p className="text-sm text-gray-500">{items.stock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No sotck orders</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button 
        onClick={() => {window.location.href = '/admin/inventory';}}
        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow">
          <Package className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-sm text-center text-gray-800">Inventory</p>
        </button>
        <button 
        onClick={() =>{window.location.href = '/admin/users'}}
        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow">
          <Users className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-sm text-center text-gray-800">Customers</p>
        </button>
        <button 
        onClick={()=>{window.location.href='/admin/orders';}}
        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow">
          <PackageCheck className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-sm text-center text-gray-800">Orders</p>
        </button>
        <button 
        onClick={() => {window.location.href = '/admin/product';}}
        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow">
          <Boxes className="mx-auto mb-2 text-cyan-600" size={24} />
          <p className="text-sm text-center text-gray-800">Products</p>
        </button>
        <button 
        onClick={() => {window.location.href = '/admin/prescriptions';}}
        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow">
          <PillBottle className="mx-auto mb-2 text-cyan-600" size={24} />
          <p className="text-sm text-center text-gray-800">User&apos;s Prescriptions</p>
        </button>
        <button 
        onClick={() => {window.location.href = '/admin/settings';}}
        className="p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow">
          <Settings className="mx-auto mb-2 text-gray-600" size={24} />
          <p className="text-sm text-center text-gray-800">Settings</p>
        </button>
       
      </div>
    </div>
  )
}
