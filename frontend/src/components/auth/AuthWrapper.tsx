'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Handle BFCache (Back-Forward Cache)
    // This ensures that when a user clicks the back button, 
    // we check if they are still authenticated.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from BFCache, force a check
        const token = localStorage.getItem('token');
        const isProtectedRoute = [
          '/admin',
          '/dashboard',
          '/profile',
          '/cart',
          '/orders',
          '/checkout',
          '/prescriptions',
          '/wishlist',
          '/product',
          '/productdetails'
        ].some(prefix => pathname.startsWith(prefix));

        if (isProtectedRoute && !token) {
          window.location.replace('/login');
        }
      }
    };

    // 2. Listen for storage events (logout in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && !event.newValue) {
        // Token was removed (likely from another tab)
        window.location.replace('/login');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  return <>{children}</>;
}
