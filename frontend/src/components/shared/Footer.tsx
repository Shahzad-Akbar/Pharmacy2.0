import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              Apple Pharma delivers genuine, verified medicines at fair prices.
              Enjoy secure payments, fast delivery, discreet packaging, and
              expert pharmacist support—so you can buy with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-blue-300 hover:text-blue-300 underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-blue-300 hover:text-blue-300 underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-blue-300 hover:text-blue-300 underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-blue-300 hover:text-blue-300 underline"
                >
                  Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>

            <ul className="space-y-2 text-gray-300">
             

              <li className="flex items-center gap-2">
                WhatsApp:
                <a
                  href="https://wa.me/917870786858"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-500 underline"
                >
                  <FaWhatsapp size={18} />
                  7870786858
                </a>
              </li>

               <li>Email: pharmacyappleofficial@gmail.com</li>

              <li>Address: Katari Hill Road, Gaya (Bihar), 823001</li>
            </ul>
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
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Find Us on Google Maps
                </a>
              </div>

         <div>
  <h3 className="text-lg font-semibold mb-4">Follow Us</h3>

  <div className="flex space-x-6">
    <Link
      href="https://www.facebook.com/apple_pharma_official/"
      target="_blank"
      className="flex items-center gap-2 text-blue-300 hover:text-blue-500 transition"
    >
      <Facebook size={18} />
      <span>Facebook</span>
    </Link>

    <Link
      href="https://www.twitter.com/apple_pharma_official/"
      target="_blank"
      className="flex items-center gap-2 text-blue-300 hover:text-sky-400 transition"
    >
      <Twitter size={18} />
      <span>Twitter</span>
    </Link>

    <Link
      href="https://www.instagram.com/apple_pharma_official/"
      target="_blank"
      className="flex items-center gap-2 text-blue-300 hover:text-pink-500 transition"
    >
      <Instagram size={18} />
      <span>Instagram</span>
    </Link>
  </div>
</div>

        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>
            © 2026 <span className="text-green-700">Apple</span>{" "}
            <span className="text-red-600">Pharma</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
