'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  ShieldCheck, 
  CreditCard, 
  RefreshCcw, 
  MapPin, 
  Edit,
  ArrowLeft
} from 'lucide-react'

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

export default function AdminProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`)
        setProduct(response.data)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 gap-4">
        <p className="text-xl text-gray-600">Product not found</p>
        <button 
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : ['/placeholder.png'])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/admin/product')}
        className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Products
      </button>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full border border-gray-100 rounded-xl overflow-hidden bg-white p-4 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                  <button 
                    onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={24} className="text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden bg-white ${
                      selectedImageIndex === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-sm text-gray-500 font-medium">
                  {product.manufacturer}
                </p>
              </div>
              <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
                <Share2 size={24} />
              </button>
            </div>

            {/* Admin Preview Status */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
                {product.isPublished ? 'Published' : 'Unpublished'}
              </span>
              <span className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium">
                {product.requiresPrescription ? 'Prescription Required' : 'OTC'}
              </span>
              <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                Stock: {product.stock}
              </span>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              {product.mrp > 0 && (
                <p className="text-gray-500 text-sm">
                  MRP <span className={product.mrp > product.price ? "line-through" : ""}>₹{product.mrp}</span>
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.discount > 0 && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold">
                    {product.discount}% off
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">*MRP inclusive of all taxes</p>
            </div>

            {/* Admin Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.push('/admin/product')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Edit Product
              </button>
            </div>

            {/* Product Meta */}
            <div className="border rounded-xl p-4 flex items-center justify-between hover:border-gray-400 transition-colors">
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">Product Meta</div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> ID: {product._id}</div>
                <div>Category: {product.category}</div>
                <div>Expiry: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <button
                onClick={() => router.push('/admin/product')}
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                <Edit size={16} /> Manage
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-xs text-gray-600 font-medium">100% genuine medicines</p>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  <CreditCard size={24} />
                </div>
                <p className="text-xs text-gray-600 font-medium">Safe & secure payments</p>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  <RefreshCcw size={24} />
                </div>
                <p className="text-xs text-gray-600 font-medium">15 days Easy returns</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section - Composition & Description */}
        <div className="p-8 border-t border-gray-100">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
             <div className="flex items-start gap-4">
                <div className="p-2 bg-teal-50 rounded-lg">
                  {/* Molecule Icon */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-teal-600"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <circle cx="5" cy="8" r="2"></circle>
                    <circle cx="19" cy="8" r="2"></circle>
                    <circle cx="12" cy="20" r="2"></circle>
                    <line x1="7" y1="9.5" x2="10" y2="11"></line>
                    <line x1="17" y1="9.5" x2="14" y2="11"></line>
                    <line x1="12" y1="15" x2="12" y2="18"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Composition</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.composition || 'Composition details not available.'}
                  </p>
                </div>
             </div>
          </div>

          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
             <p className="text-gray-600 leading-relaxed whitespace-pre-line">
               {product.description}
             </p>
          </div>
        </div>

      </div>
    </div>
  )
}
