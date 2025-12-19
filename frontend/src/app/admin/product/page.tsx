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
  mrp: number
  description: string
  image?: string
  images: string[]
  composition: string
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
  mrp: string
  description: string
  images: string[]
  composition: string
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
    mrp: '',
    description: '',
    images: [],
    composition: '',
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
      mrp: '',
      description: '',
      images: [],
      composition: '',
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
    const files = e.target.files
    if (!files || files.length === 0) return

    if (formData.images.length + files.length > 4) {
      toast.error('You can only upload up to 4 images')
      return
    }

    setImageLoading(true)
    const newImages: string[] = []

    // Process all selected files
    const promises = Array.from(files).map(file => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          newImages.push(base64String)
          resolve()
        }
        reader.readAsDataURL(file)
      })
    })

    await Promise.all(promises)

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
    setImageLoading(false)
  }

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      mrp: product.mrp.toString(),
      description: product.description,
      images: (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []),
      composition: product.composition || '',
      discount: product.discount.toString(),
      stock: product.stock.toString(),
      requiresPrescription: product.requiresPrescription,
      manufacturer: product.manufacturer,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ''
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
        mrp: parseFloat(formData.mrp),
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
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
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
      <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full cursor-pointer" onClick={() => window.location.href = `/admin/productdetails/${product._id}`}>
          <Image
            src={(product.images && product.images.length > 0) ? product.images[0] : (product.image ? product.image : '/placeholder.png')}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {product.discount}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
              {product.mrp > 0 && (
                <p className="text-sm text-gray-500">MRP <span className={product.mrp > product.price ? 'line-through' : ''}>₹{product.mrp}</span></p>
              )}
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              product.stock > 10 ? 'bg-green-100 text-green-700' : 
              product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Composition</label>
                  <textarea
                    name="composition"
                    rows={2}
                    value={formData.composition}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    required
                    min="0"
                    step="0.01"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresPrescription}
                      onChange={togglePrecription}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Requires Prescription</span>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 4)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload files</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            disabled={formData.images.length >= 4}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative h-24 w-24 border rounded-lg overflow-hidden group">
                          <Image
                            src={img}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || imageLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading || imageLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
