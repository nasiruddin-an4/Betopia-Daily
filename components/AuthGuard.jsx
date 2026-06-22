'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '../store/useUserStore';

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const publicRoutes = ['/', '/login', '/shop', '/cart', '/hot-deals'];
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/product/');

    if (mounted && !isAuthenticated && !isPublicRoute) {
      router.push(`/login?redirect=${pathname}`);
    } else if (mounted && isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router, mounted]);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>;
  }

  // Allow rendering public pages if not authenticated, or any page if authenticated
  const publicRoutes = ['/', '/login', '/shop', '/cart', '/hot-deals'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/product/');

  if (!isAuthenticated && !isPublicRoute) {
    return null; // Will redirect
  }

  return children;
}

