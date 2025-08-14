import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminIndex() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && router.isReady) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.replace('/auth/login');
        return;
      }

      // Redirect to admin users page
      router.replace('/admin/users');
    }
  }, [authLoading, isAuthenticated, user, router.isReady]);

  // Show loading while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Redirecting to admin panel...
    </div>
  );
}