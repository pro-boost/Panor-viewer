import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";
import styles from "./Navbar.module.css";

interface NavbarProps {
  showAdminButton?: boolean;
  showLogoutButton?: boolean;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  showAdminButton = true, 
  showLogoutButton = true, 
  className = "" 
}) => {
  const { user } = useAuth();

  // Don't render user menu if both buttons are hidden
  const shouldShowUserMenu = (showAdminButton && user?.role === "admin") || showLogoutButton;

  return (
    <nav className={`${styles.navbar} ${className}`}>
      {/* Logo on the left */}
      <div className={styles.logoSection}>
        <Logo variant="default" position="relative" />
      </div>

      {/* User menu on the right */}
      {shouldShowUserMenu && (
        <div className={styles.userMenu}>
          {showAdminButton && user?.role === "admin" && (
            <Link href="/admin/users" className={styles.adminLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 11L19 13L23 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.adminText}>Admin</span>
              <span className={styles.adminTextHover}>Manage Users</span>
            </Link>
          )}
          {showLogoutButton && <LogoutButton variant="minimal" />}
        </div>
      )}
    </nav>
  );
};

export default Navbar;