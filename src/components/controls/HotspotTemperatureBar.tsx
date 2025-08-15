"use client";

import React, { useState } from "react";
import styles from "./HotspotTemperatureBar.module.css";

interface HotspotTemperatureBarProps {
  maxHotspots: number;
  className?: string;
  onMaxHotspotsChange: (value: number) => void;
}

export default function HotspotTemperatureBar({
  maxHotspots,
  className = "",
  onMaxHotspotsChange,
}: HotspotTemperatureBarProps) {
  const [isDragging, setIsDragging] = useState(false);

  const percentage = (maxHotspots / 40) * 100;

  const handleBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const barHeight = rect.height - 40; // Account for padding
    const clickPercentage = Math.max(0, Math.min(100, ((barHeight - clickY + 20) / barHeight) * 100));
    const newValue = Math.round((clickPercentage / 100) * 40);
    const clampedValue = Math.max(1, Math.min(40, newValue));
    onMaxHotspotsChange(clampedValue);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleBarClick(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleBarClick(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getTemperatureColor = (percentage: number): string => {
    if (percentage <= 25) return "#4A90E2"; // Cool blue
    if (percentage <= 50) return "#7ED321"; // Green
    if (percentage <= 75) return "#F5A623"; // Orange
    return "#D0021B"; // Hot red
  };

  const currentColor = getTemperatureColor(percentage);

  return (
    <div className={`${styles.temperatureContainer} ${className}`}>
      <div
        className={styles.temperatureBar}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={styles.barBackground} />
        <div
          className={styles.barFill}
          style={{
            height: `${percentage}%`,
            backgroundColor: currentColor,
          }}
        />
      </div>
    </div>
  );
}