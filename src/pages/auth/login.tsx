import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import styles from '@/styles/Auth.module.css';

interface AuthStatus {
  authenticated: boolean;
  configured: boolean;
  requiresSetup: boolean;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Check for registration success message
    if (router.query.message === 'registration-success') {
      setSuccess('Registration successful! Your account is pending admin approval.');
    }
  }, [router.query]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setAuthStatus(data);
      
      if (data.authenticated) {
        // User is already logged in, redirect to home
        const redirect = router.query.redirect as string || '/';
        router.push(redirect);
      } else if (data.requiresSetup) {
        // Authentication not configured, redirect to setup
        router.push('/auth/setup');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, wait a moment for cookies to be set, then redirect
        setTimeout(() => {
          const redirect = router.query.redirect as string || '/';
          router.push(redirect);
        }, 100);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!authStatus?.configured) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Authentication Not Configured</h1>
          <p>Please set up authentication first.</p>
          <Link href="/auth/setup" className={styles.button}>
            Set Up Authentication
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login - Panorama Viewer</title>
        <meta name="description" content="Login to access the panorama viewer" />
      </Head>
      
      <div className={styles.container}>
        <Logo variant="default" position="absolute" />
        
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Welcome Back</h1>
            <p>Please sign in to access the panorama viewer</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}
            
            {success && (
              <div className={styles.success}>
                {success}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className={styles.link}>
                Create Account
              </Link>
            </p>
            <p>
              Need to set up authentication?{' '}
              <Link href="/auth/setup" className={styles.link}>
                Configure Authentication
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}