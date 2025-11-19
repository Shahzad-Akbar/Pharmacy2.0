'use client'
import { useState, useEffect } from 'react'

import axios from 'axios'


import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Image as ImageIcon,
  X
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  isPublished: boolean
  requiresPrescription: boolean
  discount: number
  stock: number
  manufacturer: string
  expiryDate: string
}

interface ProductFormData {
  name: string
  category: string
  price: string
  description: string
  image: string
  discount: string
  stock: string
  requiresPrescription: boolean
  manufacturer: string
  expiryDate: string
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    discount: '',
    stock: '',
    requiresPrescription: false,
    manufacturer: '',
    expiryDate: ''
  })

  const categories = ['Pain Relief', 'Vitamins', 'Antibiotics', 'First Aid', 'Skincare', 'Diabetes', 'Personal Care', 'Other']

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      image: '',
      discount: '',
      stock: '',
      requiresPrescription: false,
      manufacturer: '',
      expiryDate: ''
    })
    setEditingProduct(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const togglePrecription = () => {
    setFormData(prev => ({
      ...prev,
      requiresPrescription: !prev.requiresPrescription
    }))
  }

  const [imageLoading, setImageLoading] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageLoading(true)
    // Convert image to base64 string
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({
        ...prev,
        image: base64String
      }))
      setImageLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
      discount: product.discount.toString(),
      stock: product.stock.toString(),
      requiresPrescription: product.requiresPrescription,
      manufacturer: product.manufacturer,
      expiryDate: product.expiryDate
    })
    setShowModal(true)
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = '/api/products/get-products?'
      if (filterCategory !== 'all') url += `category=${filterCategory}&`
      if (searchQuery) url += `search=${searchQuery}`

      const response = await axios.get(url)
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to fetch products')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imageLoading) {
      toast.error('Please wait for image to finish uploading')
      return
    }
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discount: parseInt(formData.discount)
      }
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('You are not logged in')
        return
      }

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.success('Product updated successfully')
      } else {
        await axios.post('/api/products/create-product', productData,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.success('Product added successfully')
      }

      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product')
      console.error('Error:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('You are not logged in')
      return
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.success('Product deleted successfully')
        fetchProducts()
      } catch (error) {
        toast.error('Failed to delete product')
        console.error('Error:', error)
      }
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        let url = '/api/products/get-products?'
        if (filterCategory !== 'all') url += `category=${filterCategory}&`
        if (searchQuery) url += `search=${searchQuery}`
  
        const response = await axios.get(url)
        setProducts(response.data)
      } catch (error) {
        toast.error('Failed to fetch products')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery, filterCategory])

  return (
    <div className="p-6 bg-blue-100 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={24} />
          Products Management
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add New Product
        </button>
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
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{product.name}</h3>
                  <span className="text-blue-600 font-bold">₹{product.price}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded-full ${product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-black mt-1 block w-full border rounded-lg p-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiresPrescription"
                      checked={formData.requiresPrescription}
                      onChange={togglePrecription}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Requires Prescription</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={imageLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {imageLoading ? 'Uploading Image...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}