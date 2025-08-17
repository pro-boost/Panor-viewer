import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PendingUsersResponse {
  users: Array<{
    id: string;
    email: string;
    role: string;
    approved: boolean;
  }>;
}

export const usePendingUsersCount = () => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchPendingCount = async () => {
    // Only fetch if user is authenticated and is an admin
    if (!isAuthenticated || user?.role !== 'admin') {
      setPendingCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users?type=pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }
      
      const data: PendingUsersResponse = await response.json();
      setPendingCount(data.users?.length || 0);
    } catch (err) {
      console.error('Error fetching pending users count:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, [isAuthenticated, user?.role]);

  // Refresh function that can be called manually
  const refresh = () => {
    fetchPendingCount();
  };

  return {
    pendingCount,
    loading,
    error,
    refresh,
  };
};