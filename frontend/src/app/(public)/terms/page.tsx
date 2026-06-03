'use client';

import PublicNavbar from '@/components/shared/PublicNavbar';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
            <span className="text-green-700">Terms</span> and <span className="text-red-600">Conditions</span>
          </h1>
          
          <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
              <p>
                Welcome to Apple Medical. These Terms and Conditions govern your use of our website and services. 
                By accessing or using our platform, you agree to be bound by these terms. If you do not agree 
                with any part of these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Medical Disclaimer</h2>
              <p>
                The information provided on Apple Medical is for educational purposes only and is not intended 
                as a substitute for professional medical advice, diagnosis, or treatment. Always seek the 
                advice of your physician or other qualified health provider with any questions you may have 
                regarding a medical condition.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Prescription Policy</h2>
              <p>
                Certain medications available on our platform require a valid prescription from a licensed 
                healthcare professional. You agree to provide accurate and up-to-date prescription information 
                where required. We reserve the right to verify prescriptions before processing orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, 
                and current at all times. Failure to do so constitutes a breach of the Terms, which may 
                result in immediate termination of your account on our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Privacy Policy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                visit to Apple Medical, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                What constitutes a material change will be determined at our sole discretion. By continuing 
                to access or use our Service after those revisions become effective, you agree to be bound 
                by the revised terms.
              </p>
            </section>

            <section className="pt-8 border-t">
              <p className="text-sm italic">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="mt-6">
                <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  &larr; Back to Signup
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
