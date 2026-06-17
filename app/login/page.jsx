'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '../../store/useSidebarStore';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home and pop open the modal
    router.replace('/');
    setTimeout(() => {
      useSidebarStore.getState().openLoginModal();
    }, 100);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}