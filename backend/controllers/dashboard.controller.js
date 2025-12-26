import User from '../models/user.model.js'
import Order from '../models/order.model.js'
import Product from '../models/product.model.js'
import Prescription from '../models/prescription.model.js'
import Notification from '../models/notification.model.js'

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id

    // Get user details
    const user = await User.findById(userId)

    // Get orders statistics
    const totalOrders = await Order.countDocuments({ user: userId })
    const pendingOrders = await Order.countDocuments({ 
      user: userId,
      status: { $in: ['processing', 'pending'] }
    })

    // Get last order date
    const lastOrder = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt')

    // Get active prescriptions count
    const activePrescriptions = await Prescription.countDocuments({
      user: userId,
      status: 'Active'
    })

    res.json({
      userName: user.fullName,
      totalOrders: totalOrders.toString(),
      pendingOrders: pendingOrders.toString(),
      activePrescriptions: activePrescriptions.toString(),
      lastOrderDate: lastOrder ? lastOrder.createdAt : null
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: 'Error fetching dashboard statistics' })
  }
}

export const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('message createdAt')

    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      message: notification.message,
      time: getTimeAgo(notification.createdAt)
    }))

    res.json(formattedNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ message: 'Error fetching notifications' })
  }
}

export const getRecentOrders = async (req, res) => {
  try {
    const userId = req.user._id
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('_id total status createdAt')

    const formattedOrders = orders.map(order => ({
      id: order._id,
      date: order.createdAt,
      status: order.status,
      amount: order.total.toString()
    }))

    res.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    res.status(500).json({ message: 'Error fetching recent orders' })
  }
}

// Helper function to format time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ]

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i]
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}

//Admin Dashboard Stats
export const getAdminDashboardStats = async (req, res) => {
  try {
    // Remove user filtering to get all orders for admin dashboard
    const totalOrders = await Order.countDocuments({})

    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'processing'] }
    })

    // Calculate total sales from delivered orders only
    const deliveredOrders = await Order.find({ status: 'delivered' })
    const totalSales = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0)

    // Get low stock products count (less than 10 items)
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lte: threshold } });
    const lowStockCount = products.length;

    res.json({
      totalSales: `₹${totalSales.toFixed(2)}`,
      totalOrders: totalOrders.toString(),
      pendingOrders: pendingOrders.toString(),
      lowStock: lowStockCount.toString()
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: 'Error fetching dashboard statistics' })
  }
}

//Admin Low Stock Products
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lte: threshold } });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No low stock products found' })
    }
    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString() ,
      expiryDate: product.expiryDate
    }))
    res.json(formattedProducts)
  }catch (error) {
    console.error('Error fetching low stock products:', error)
    res.status(500).json({ message: 'Error fetching low stock products' })
  }
}

//Admin Recent Orders
export const getRecentAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
     .sort({ createdAt: -1 })
     .limit(4)
     .select('_id total status createdAt')

    const formattedOrders = orders.map(order => ({
      id: order._id,
      date: order.createdAt,
      status: order.status,
      amount: order.total.toString()
    }))

    if (formattedOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found' })
    }

    res.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    res.status(500).json({ message: 'Error fetching recent orders' })}
}
