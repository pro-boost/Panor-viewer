import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import styles from '@/styles/Auth.module.css';

interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  if (password.length >= 12) strength++;
  
  const strengthMap = {
    0: { label: 'Very Weak', color: '#ff4444' },
    1: { label: 'Weak', color: '#ff6600' },
    2: { label: 'Fair', color: '#ffaa00' },
    3: { label: 'Good', color: '#88cc00' },
    4: { label: 'Strong', color: '#44aa00' },
    5: { label: 'Very Strong', color: '#00aa44' },
    6: { label: 'Excellent', color: '#00aa44' }
  };
  
  return {
    strength,
    label: strengthMap[strength as keyof typeof strengthMap].label,
    color: strengthMap[strength as keyof typeof strengthMap].color
  };
}

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength.strength < 3) {
      setError('Please choose a stronger password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Your account is pending admin approval. You will be notified once approved.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?message=registration-success');
        }, 3000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account - Panorama Viewer</title>
        <meta name="description" content="Create a new account for the panorama viewer" />
      </Head>
      
      <div className={styles.container}>
        <Logo variant="default" position="absolute" />
        
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Create Account</h1>
            <p>Register for access to the panorama viewer</p>
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
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                required
                disabled={loading}
                autoComplete="email"
                placeholder="Enter your email address"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInputContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Enter a strong password (min. 8 characters)"
                  minLength={8}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
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
              <div className={styles.passwordInputContainer}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
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

            <div className={styles.info}>
              <p><strong>Note:</strong> Your account will require admin approval before you can access the system. You will be notified once your account is approved.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword || passwordStrength.strength < 3}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Already have an account?{' '}
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