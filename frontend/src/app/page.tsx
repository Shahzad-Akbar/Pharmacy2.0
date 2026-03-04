import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/shared/PublicNavbar'
import Footer from '@/components/shared/Footer'
import LazyLoad from '@/components/shared/LazyLoad'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Your Health, <span className="text-emerald-600">Our Priority</span>
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl mb-6 sm:mb-8 leading-relaxed">
              Experience modern healthcare solutions with our comprehensive range of services. 
              Your wellness journey starts here with trusted pharmaceutical care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href="/signup" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg w-full sm:w-auto text-center"
              >
                Get Started
              </Link>
              <Link 
                href="/login" 
                className="bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg w-full sm:w-auto text-center"
              >
                Browse Products
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative px-4 sm:px-0">
            <div className="absolute -top-4 -left-4 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-100 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-48 sm:w-72 h-48 sm:h-72 bg-teal-100 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
            <Image
              src="/images/pharmist.png"
              alt="Professional Pharmacist"
              width={600}
              height={600}
              className="rounded-2xl shadow-2xl relative z-10 transform hover:scale-105 transition-transform duration-300 w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-16">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl sm:text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Secure Prescriptions</h3>
              <p className="text-gray-600">Your prescriptions are handled with the utmost security and privacy, ensuring safe and confidential healthcare.</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl sm:text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Fast Delivery</h3>
              <p className="text-gray-600">Get your medications delivered quickly and safely to your doorstep, with real-time tracking and updates.</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl sm:text-3xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Expert Care</h3>
              <p className="text-gray-600">Access to professional pharmacists 24/7 for personalized consultations and medication guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <LazyLoad placeholder={<div style={{ height: '600px' }} />}>
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Featured Products</h2>
            <Link 
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 group"
            >
              View All <span className="transform transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-48 sm:h-64 relative overflow-hidden">
                <Image
                  src="/landing/vitamins.png"
                  alt="Multivitamin Capsules"
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Multivitamin Capsules</h3>
                <p className="text-gray-600 mb-4">Supports immunity and overall daily health</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">₹210</span>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">Best Seller</span>
                </div>
                <Link 
                  href="/login"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-full inline-block transition-colors w-full text-center touch-manipulation"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-48 sm:h-64 relative overflow-hidden">
                <Image
                  src="/landing/antacid.png"
                  alt="Antacid Tablets"
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Antacid Tablets</h3>
                <p className="text-gray-600 mb-4">Quick relief from acidity, gas, and indigestion</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">₹85</span>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">New Arrival</span>
                </div>
                <Link 
                  href="/login"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-full inline-block transition-colors w-full text-center touch-manipulation"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="h-48 sm:h-64 relative overflow-hidden">
                <Image
                  src="/landing/paracetamol.png"
                  alt="Paracetamol Tablets"
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Paracetamol Tablets</h3>
                <p className="text-gray-600 mb-4">Fast relief from fever, headache, and body pain</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">₹35</span>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">Essential</span>
                </div>
                <Link 
                  href="/login"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-full inline-block transition-colors w-full text-center touch-manipulation"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Services Section */}
      <LazyLoad placeholder={<div style={{ height: '400px' }} />}>
        <section className="bg-gradient-to-b from-white to-emerald-50 py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-16">Our Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-4xl sm:text-5xl mb-6">⚕️</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Prescription Services</h3>
                <p className="text-gray-600 mb-6">Quick and accurate prescription filling with expert verification</p>
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 group touch-manipulation"
                >
                  Learn More <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-4xl sm:text-5xl mb-6">🚚</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Home Delivery</h3>
                <p className="text-gray-600 mb-6">Convenient doorstep delivery with temperature-controlled packaging</p>
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 group touch-manipulation"
                >
                  Learn More <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-4xl sm:text-5xl mb-6">�</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">24/7 Support</h3>
                <p className="text-gray-600 mb-6">Our dedicated support team is always available to assist you</p>
                <Link
                  href="/contact"
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 group touch-manipulation"
                >
                  Contact Us <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-4xl sm:text-5xl mb-6">�</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Easy Returns</h3>
                <p className="text-gray-600 mb-6">Hassle-free returns and exchanges on all eligible products</p>
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 group touch-manipulation"
                >
                  Learn More <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </LazyLoad>

      {/* Health Tips Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-16">Health Tips & Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Medication Safety</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Store medications at proper temperature
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Keep track of expiration dates
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Never share prescriptions
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Wellness Basics</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Stay hydrated throughout the day
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Maintain a balanced diet
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Get regular exercise
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">When to Seek Help</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Unusual medication reactions
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Persistent side effects
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-emerald-600">✓</span>
                Questions about interactions
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-emerald-600 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">Ready to Get Started?</h2>
          <p className="text-emerald-100 text-lg sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their health needs.
          </p>
          <Link
            href="/login"
            className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-medium inline-block hover:bg-emerald-50 transition-colors transform hover:scale-105 w-full sm:w-auto touch-manipulation"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}