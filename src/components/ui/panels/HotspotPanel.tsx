"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../ControlPanel.module.css";
import temperatureStyles from "../../controls/HotspotTemperatureBar.module.css";

interface HotspotPanelProps {
  maxHotspots: number;
  onMaxHotspotsChange: (value: number) => void;
  onPanelClose: () => void;
  hotspotsVisible: boolean;
  setHotspotsVisible: (visible: boolean) => void;
  hotspotTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function HotspotPanel({
  maxHotspots,
  onMaxHotspotsChange,
  onPanelClose,
  hotspotsVisible,
  setHotspotsVisible,
  hotspotTimeoutRef,
}: HotspotPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const percentage = (maxHotspots / 40) * 100;

  const calculateValue = (clientX: number) => {
    if (!barRef.current) return maxHotspots;
    
    const rect = barRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const barWidth = rect.width;
    const clickPercentage = Math.max(0, Math.min(100, (clickX / barWidth) * 100));
    const newValue = Math.round((clickPercentage / 100) * 39) + 1; // 1-40 range
    return Math.max(1, Math.min(40, newValue));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    
    // Force hotspots to be visible during drag and clear any auto-hide timeout
    setHotspotsVisible(true);
    if (hotspotTimeoutRef.current) {
      clearTimeout(hotspotTimeoutRef.current);
      hotspotTimeoutRef.current = null;
    }
    
    const newValue = calculateValue(event.clientX);
    onMaxHotspotsChange(newValue);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      // Keep hotspots visible during drag
      if (!hotspotsVisible) {
        setHotspotsVisible(true);
      }
      
      const newValue = calculateValue(event.clientX);
      onMaxHotspotsChange(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Restore normal hotspot auto-hide behavior after drag ends
    if (hotspotTimeoutRef.current) {
      clearTimeout(hotspotTimeoutRef.current);
    }
    hotspotTimeoutRef.current = setTimeout(() => {
      setHotspotsVisible(false);
    }, 5000); // Auto-hide after 5 seconds
  };

  // Add document-level event listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection
      document.body.style.cursor = 'grabbing';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, maxHotspots]);

  const getTemperatureColor = (percentage: number): string => {
    if (percentage <= 25) return "#4CAF50"; // Green (excellent)
    if (percentage <= 50) return "#8BC34A"; // Light green (good)
    if (percentage <= 75) return "#FF9800"; // Orange (fair)
    return "#F44336"; // Red (poor)
  };

  const currentColor = getTemperatureColor(percentage);

  const handlePresetClick = (value: number) => {
    onMaxHotspotsChange(value);
  };

  return (
    <div className={styles.expandedPanel}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M12 2V6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 18V22"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M22 12H18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 12H2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className={styles.text}>Hotspot Density</span>
      </div>
      <div className={styles.content}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <label>Current Limit</label>
            <span>{maxHotspots} / 40</span>
          </div>
        </div>
        
        {/* Modern Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div
            ref={barRef}
            onMouseDown={handleMouseDown}
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              position: 'relative',
              cursor: isDragging ? 'grabbing' : 'grab',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
              transition: isDragging ? 'none' : 'all 0.1s ease'
            }}
          >
            {/* Slider Fill */}
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, #4CAF50 0%, #8BC34A 33%, #FF9800 66%, #F44336 100%)`,
                borderRadius: '4px',
                position: 'relative',
                transition: isDragging ? 'none' : 'width 0.2s ease'
              }}
            >
              {/* Slider Handle */}
              <div
                style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: currentColor,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  transition: isDragging ? 'none' : 'all 0.2s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'space-between',
          marginTop: '12px'
        }}>
          <button
            onClick={() => handlePresetClick(5)}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: maxHotspots === 5 ? 'white' : 'rgba(255, 255, 255, 0.1)',
              color: maxHotspots === 5 ? 'black' : 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (maxHotspots !== 5) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (maxHotspots !== 5) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            Min
          </button>
          
          <button
            onClick={() => handlePresetClick(20)}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: maxHotspots === 20 ? 'white' : 'rgba(255, 255, 255, 0.1)',
              color: maxHotspots === 20 ? 'black' : 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (maxHotspots !== 20) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (maxHotspots !== 20) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            Medium
          </button>
          
          <button
            onClick={() => handlePresetClick(40)}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: maxHotspots === 40 ? 'white' : 'rgba(255, 255, 255, 0.1)',
              color: maxHotspots === 40 ? 'black' : 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (maxHotspots !== 40) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (maxHotspots !== 40) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            Max
          </button>
        </div>
      </div>
    </div>
  );
}