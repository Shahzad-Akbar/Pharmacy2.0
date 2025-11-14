'use client'
import { useState, useEffect } from 'react'
import { Search, Filter, ShoppingCart, Heart, Package, Home } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  requiresPrescription: boolean
  stock: number
}

export default function ProductPage() {

  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [loadingCartItems, setLoadingCartItems] = useState<string[]>([])

  const categories = ['all', 'Pain Relief', 'Vitamins', 'Antibiotics', 'First Aid', 'Skincare', 'Diabetes', 'Personal Care', 'Other']

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products/get-products')
        setProducts(response.data)
        setLoading(false)
      }catch(err){
        setLoading(false)
        if(axios.isAxiosError(err)){
          setError('Failed to fetch products')
        }
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to add items to cart')
        return
      }

      setLoadingCartItems(prev => [...prev, productId])

      await axios.post('/api/cart/add', 
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success('Product added to cart successfully')
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Failed to add to cart:', error)
    } finally {
      setLoadingCartItems(prev => prev.filter(id => id !== productId))
    }
  }

  const toggleWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to add items to wishlist')
        setError('Please login to add items to wishlist')
        return
      }

      if (wishlistItems.includes(productId)) {
        // Fixed DELETE request configuration
        await axios.delete(`/api/users/wishlist/${productId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        setWishlistItems(wishlistItems.filter(id => id !== productId))
      } else {
        await axios.post(
          `/api/users/wishlist/${productId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setWishlistItems([...wishlistItems, productId])
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    alert(error)
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center md:justify-start">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5">
            <Home size={20} />
            Home
          </Link>
          <Link 
            href="/cart" 
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5">
            <ShoppingCart size={20} />
            View Cart
          </Link>
          <Link 
            href="/wishlist" 
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5">
            <Heart size={20} />
            Wishlist
          </Link>
          <Link 
            href="/orders" 
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5">
            <Package size={20} />
            My Orders
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-32 sm:h-40">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
                <p className="hidden md:block text-xs text-gray-500 line-clamp-2 mt-1 mb-2">{product.description}</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 font-bold text-sm">₹{product.price}</span>
                    {product.requiresPrescription && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        Rx
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0 || loadingCartItems.includes(product._id)}
                      className={`flex-1 py-1.5 rounded text-sm flex items-center justify-center ${
                        product.stock > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {loadingCartItems.includes(product._id) 
                        ? 'Adding...' 
                        : product.stock > 0 
                          ? 'Add' 
                          : 'Out of Stock'
                      }
                    </button>
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className={`p-1.5 rounded ${
                        wishlistItems.includes(product._id)
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={wishlistItems.includes(product._id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}

        {/* View Cart Button */}
        <div className="mt-8 mb-6 flex justify-end">
          <Link 
            href="/cart"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg
                     transition-all duration-300 ease-in-out w-full sm:w-auto"
          >
            <ShoppingCart size={20} />
            <span className="font-medium">View Cart</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
