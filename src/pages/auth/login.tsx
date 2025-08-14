import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import styles from "@/styles/Auth.module.css";

interface AuthStatus {
  authenticated: boolean;
  configured: boolean;
  requiresSetup: boolean;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [componentKey, setComponentKey] = useState(Date.now());

  useEffect(() => {
    checkAuthStatus();

    // Check for registration success message
    if (router.query.message === "registration-success") {
      setSuccess(
        "Registration successful! Your account is pending admin approval.",
      );
    }
  }, [router.query]);

  // Reset form state when component mounts or when returning to login page
  useEffect(() => {
    // Reset all form states to ensure inputs are not disabled
    setEmail("");
    setPassword("");
    setLoading(false);
    setError("");
    setShowPassword(false);
    setComponentKey(Date.now());

    // Immediately set checkingAuth to false for login page
    if (router.pathname === "/auth/login") {
      setCheckingAuth(false);
    }
  }, [router.pathname]);

  // Additional cleanup when component mounts
  useEffect(() => {
    // Force a complete state reset on component mount
    const resetState = () => {
      setEmail("");
      setPassword("");
      setLoading(false);
      setError("");
      setSuccess("");
      setShowPassword(false);
      setCheckingAuth(false); // Ensure inputs are enabled
      setComponentKey(Date.now());
    };

    resetState();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setAuthStatus(data);

      if (data.authenticated) {
        // User is already logged in, redirect to home
        const redirect = (router.query.redirect as string) || "/";
        router.push(redirect);
      } else if (data.requiresSetup) {
        // Authentication not configured, redirect to setup
        router.push("/auth/setup");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setError("Failed to check authentication status");
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, wait a moment for cookies to be set, then redirect
        setTimeout(() => {
          const redirect = (router.query.redirect as string) || "/";
          router.push(redirect);
        }, 100);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.authLoadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!authStatus?.configured) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.notConfiguredCard}`}>
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
        <meta
          name="description"
          content="Login to access the panorama viewer"
        />
      </Head>

      <div className={styles.container}>
        <Logo variant="default" position="absolute" />

        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Welcome Back</h1>
            <p>Please sign in to access the panorama viewer</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
            key={`form-${componentKey}-${router.asPath}`}
          >
            {error && <div className={styles.error}>{error}</div>}

            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || checkingAuth}
                autoComplete="email"
                placeholder="Enter your email"
                key={`email-${componentKey}-${router.asPath}`}
                style={{
                  pointerEvents: loading || checkingAuth ? "none" : "auto",
                }}
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
                  disabled={loading || checkingAuth}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  key={`password-${componentKey}-${router.asPath}`}
                  style={{
                    pointerEvents: loading || checkingAuth ? "none" : "auto",
                  }}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || checkingAuth}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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
                "Sign In"
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className={styles.link}>
                Create Account
              </Link>
            </p>
            <p>
              Need to set up authentication?{" "}
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
