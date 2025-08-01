import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import styles from '@/styles/Auth.module.css';

interface SetupStatus {
  configured: boolean;
  hasUsers: boolean;
}

export default function Setup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/auth/setup');
      const data = await response.json();
      setSetupStatus(data);
      
      // Don't auto-redirect if already configured - let user see the status
    } catch (error) {
      console.error('Error checking setup status:', error);
      setError('Failed to check setup status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Authentication configured successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 12
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { strength, label: 'Weak', color: '#ff4444' };
    if (strength <= 4) return { strength, label: 'Medium', color: '#ffaa00' };
    return { strength, label: 'Strong', color: '#44ff44' };
  };

  if (checkingStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}></div>
        <p>Checking setup status...</p>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength();

  // If authentication is already configured, show different UI
  if (setupStatus?.configured && setupStatus?.hasUsers) {
    return (
      <>
        <Head>
          <title>System Ready - Panorama Viewer</title>
          <meta name="description" content="Authentication system is configured and ready" />
        </Head>
        
        <div className={styles.container}>
          <Logo variant="default" position="absolute" />
          
          <div className={styles.card}>
            <div className={styles.header}>
              <h1>✅ System Ready</h1>
              <p>Your panorama viewer is fully configured and ready to use.</p>
            </div>

            <div className={styles.info}>
              <div className={styles.statusCard}>
                <h3>🔐 Authentication Status</h3>
                <p>✓ Admin accounts configured</p>
                <p>✓ Security settings active</p>
                <p>✓ User management available</p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/auth/login" className={styles.button}>
                Sign In to Continue
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Setup Authentication - Panorama Viewer</title>
        <meta name="description" content="Set up authentication for the panorama viewer" />
      </Head>
      
      <div className={styles.container}>
        <Logo variant="default" position="absolute" />
        
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Set Up Authentication</h1>
            <p>Create an admin account to secure your panorama viewer</p>
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
              <label htmlFor="email">Admin Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                required
                disabled={loading}
                autoComplete="email"
                placeholder="Enter admin email address"
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
                autoComplete="new-password"
                placeholder="Enter a strong password (min. 8 characters)"
                minLength={8}
              />
              {password && (
                <div className={styles.passwordStrength}>
                  <div 
                    className={styles.strengthBar}
                    style={{ 
                      width: `${(passwordStrength.strength / 6) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
              {confirmPassword && password !== confirmPassword && (
                <div className={styles.fieldError}>
                  Passwords do not match
                </div>
              )}
            </div>

            <div className={styles.requirements}>
              <h4>Password Requirements:</h4>
              <ul>
                <li className={password.length >= 8 ? styles.met : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? styles.met : ''}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? styles.met : ''}>
                  One lowercase letter
                </li>
                <li className={/\d/.test(password) ? styles.met : ''}>
                  One number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? styles.met : ''}>
                  One special character (recommended)
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Setting up...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Already configured?{' '}
              <Link href="/auth/login" className={styles.link}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}