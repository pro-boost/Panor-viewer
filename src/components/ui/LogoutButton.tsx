import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./LogoutButton.module.css";

interface LogoutButtonProps {
  variant?: "default" | "minimal";
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "default",
  className = "",
}) => {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className={`${styles.container} ${styles[variant]} ${className}`}>
      {variant === "default" && (
        <div className={styles.userInfo}>
          <span className={styles.username}>{user.email}</span>
          <span className={styles.role}>({user.role})</span>
        </div>
      )}

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={styles.logoutButton}
        title="Log out"
      >
        {isLoggingOut ? (
          <div className={styles.spinner}></div>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        )}
        {variant === "default" && <span>Log out</span>}
        {variant === "minimal" && (
          <span className={styles.logoutText}>Log out</span>
        )}
      </button>
    </div>
  );
};

export default LogoutButton;
