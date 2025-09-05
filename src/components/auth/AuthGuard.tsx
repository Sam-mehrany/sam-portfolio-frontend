"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // ✅ CORRECTED: Build the full URL for the API request
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/verify`, { credentials: 'include' });

        if (response.ok) {
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Verification request failed:', error);
        setStatus('unauthenticated');
        router.push('/admin/login');
      }
    };

    verifyToken();
  }, [router]);

  if (status === 'loading') {
    return <div className="text-center py-24">Verifying authentication...</div>;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }
  
  return null; 
}
