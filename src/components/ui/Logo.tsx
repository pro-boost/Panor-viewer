import React from "react";
import { useRouter } from "next/router";
import styles from "./Logo.module.css";

interface LogoProps {
  variant?: "default" | "large" | "small" | "enhanced";
  position?: "absolute" | "relative";
  className?: string;
}

const Logo: React.FC<LogoProps> = React.memo(
  ({ variant = "default", position = "absolute", className = "" }) => {
    const router = useRouter();
    const logoClass =
      `${styles.logoContainer} ${styles[variant]} ${styles[position]} ${className}`.trim();

    const handleLogoClick = () => {
      window.location.href = "/";
    };

    return (
      <div className={logoClass}>
        <img
          src="/assets/svg/primezone-logo.svg"
          alt="PrimeZone Logo"
          className={styles.logoImage}
          style={{ cursor: "pointer" }}
          onClick={handleLogoClick}
        />
      </div>
    );
  },
);

Logo.displayName = "Logo";

export default Logo;
