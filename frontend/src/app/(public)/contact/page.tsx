'use client'
import { useState } from 'react'
// import Image from 'next/image'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState<{ [k: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: { [k: string]: string } = {}
    if (!formData.name.trim()) nextErrors.name = 'Please enter your name'
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) nextErrors.email = 'Enter a valid email'
    if (!formData.phone.match(/^\+?\d{7,15}$/)) nextErrors.phone = 'Enter a valid phone number'
    if (!formData.subject.trim()) nextErrors.subject = 'Please enter a subject'
    if (!formData.message.trim()) nextErrors.message = 'Please enter your message'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    setSuccess('')
    setTimeout(() => {
      setSubmitting(false)
      setSuccess('Thanks for contacting Apple Medical. We will reach you shortly.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 800)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-8 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold">Contact Apple Medical</h1>
          <p className="mt-2 opacity-90">Genuine medicines, helpful guidance, and fast delivery</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Fill out the form below and we will get back to you shortly.
            </p>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-blue-900">Contact Information</h3>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:+917870786858" className="text-blue-600 hover:text-blue-700">+91-7870786858</a>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:applemedicalofficial@gmail.com" className="text-blue-600 hover:text-blue-700">applemedicalofficial@gmail.com</a>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <a
                  href="https://maps.app.goo.gl/s3iXXqazNFfUKCJL9"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Apple Medical, Katari Hill Road,<br />
                  Gaya, Bihar 110033
                </a>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-semibold">Business Hours</p>
                <p className="text-gray-700">Mon–Sat: 9:00 AM – 9:00 PM</p>
                <p className="text-gray-700">Sun: 10:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-right">
              <span className="text-green-700">Apple</span> <span className="text-red-600">Medical</span>
            </h2>
            {success && <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="text-gray-800 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-gray-800 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-black">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="text-gray-800 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-black">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="text-gray-800 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700"
                  />
                  {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-black">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="text-gray-800 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-700 focus:border-blue-700"
                ></textarea>
                {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full ${submitting ? 'bg-blue-300' : 'bg-blue-700'} text-white py-2 px-4 rounded-md hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700`}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
              <div className="text-center text-sm text-gray-500">Prefer WhatsApp? <a className="text-blue-700 hover:underline" href="https://wa.me/7870786858" target="_blank" rel="noreferrer">Chat with us</a></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
