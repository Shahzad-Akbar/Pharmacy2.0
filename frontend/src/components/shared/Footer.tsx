import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              Apple Pharma delivers genuine, verified medicines at fair prices. Enjoy secure payments, fast delivery, discreet packaging, and expert pharmacist support—so you can buy with confidence.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link href="/login" className="text-gray-300 hover:text-white">Products</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: pharmacyappleofficial@gmail.com</li>
              <li>Phone: 7870786858</li>
              <li>Address: Katari Hill Road, Gaya (Bihar), 823001</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-white">Facebook</Link>
              <Link href="#" className="text-gray-300 hover:text-white">Twitter</Link>
              <Link href="#" className="text-gray-300 hover:text-white">Instagram</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>© 2025 <span className="text-green-700">Apple</span>{' '}
            <span className="text-red-600">Pharma</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
