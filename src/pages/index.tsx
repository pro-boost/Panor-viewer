'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ReactElement, useState, useEffect, useCallback, useRef } from 'react';
import styles from '@/styles/Welcome.module.css';

// Dynamically import PanoramaViewer to avoid SSR issues with Marzipano
const PanoramaViewer = dynamic(() => import('@/components/PanoramaViewer'), {
  ssr: false,
  loading: (): ReactElement => (
    <div id='loading'>
      <div className='loader'></div>
      <div>Loading panoramas...</div>
    </div>
  ),
});

interface ConfigData {
  scenes: Array<{ id: string; name: string; [key: string]: any }>;
}

export default function Home(): ReactElement {
  // Default to false, assuming no panoramas until checked.
  const [hasPanoramas, setHasPanoramas] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [forceWelcome, setForceWelcome] = useState<boolean>(false);
  const [isCheckingFromVisibility, setIsCheckingFromVisibility] = useState<boolean>(false);
  const [lastFileCount, setLastFileCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastRefreshTime = useRef<number>(0);

  // Handle case where PanoramaViewer detects no config
  const handleNoConfig = () => {
    console.log('PanoramaViewer detected no config - showing welcome screen');
    setHasPanoramas(false);
    setForceWelcome(true);
  };

  const checkForPanoramas = useCallback(async () => {
    try {
      // Use the check-files API which handles Electron paths correctly
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/check-files?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.warn('Check-files API failed:', response.status, response.statusText);
        setHasPanoramas(false);
        return;
      }

      const result = await response.json();
      console.log('File check result:', result);
      
      // The API returns hasFiles: true if both CSV and images exist
      const hasFiles = result.hasFiles === true;
      const currentFileCount = result.imageCount || 0;
      console.log('Has panoramas:', hasFiles, 'CSV:', result.csvFile, 'Images:', currentFileCount);
      
      // Only trigger refresh if:
      // 1. We're checking from visibility change (user returned from upload), OR
      // 2. File count has actually changed (new files uploaded)
      // 3. Not currently refreshing and enough time has passed since last refresh
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime.current;
      const shouldRefresh = hasFiles && !isRefreshing && timeSinceLastRefresh > 2000 && (
        isCheckingFromVisibility || 
        (hasPanoramas && currentFileCount !== lastFileCount && currentFileCount > 0)
      );
      
      if (shouldRefresh) {
        console.log('File change detected, triggering panorama refresh...', {
          fromVisibility: isCheckingFromVisibility,
          fileCountChanged: currentFileCount !== lastFileCount,
          oldCount: lastFileCount,
          newCount: currentFileCount,
          timeSinceLastRefresh
        });
        setIsRefreshing(true);
        setRefreshTrigger(now);
        lastRefreshTime.current = now;
        
        // Reset refreshing state after a delay
        setTimeout(() => {
          setIsRefreshing(false);
        }, 3000);
      }
      
      // Update file count tracking
      if (hasFiles && currentFileCount > 0) {
        setLastFileCount(currentFileCount);
      }
      
      // Reset the visibility check flag
      if (isCheckingFromVisibility) {
        setIsCheckingFromVisibility(false);
      }
      
      setHasPanoramas(hasFiles);
      
      // Reset force welcome if we now have files
      if (hasFiles) {
        setForceWelcome(false);
      }
    } catch (error) {
      // In case of any error during the check, assume no panoramas.
      console.error('Error checking for panoramas:', error);
      setHasPanoramas(false);
    }
  }, [hasPanoramas, isCheckingFromVisibility, lastFileCount, isRefreshing]);

  useEffect(() => {
    checkForPanoramas();
    
    // Also check when the page becomes visible (user returns from upload)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, rechecking files...');
        setIsCheckingFromVisibility(true);
        setTimeout(checkForPanoramas, 500); // Small delay to ensure files are written
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForPanoramas]);

  // If panoramas exist and we're not forcing welcome screen, show the viewer.
  if (hasPanoramas && !forceWelcome) {
    return (
      <div>
        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1100,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '10px 10px',
            borderRadius: '14px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            marginBottom: '10px',
          }}
        >
          <img
            src='/assets/svg/primezone-logo.svg'
            alt='PrimeZone Logo'
            style={{
              height: '60px',
              width: 'auto',
              display: 'block',
            }}
          />
        </div>

        <header
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '220px',
            zIndex: 1100,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '16px 20px',
            borderRadius: '14px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            marginBottom: '10px',
          }}
        >
          <Link
            href='/upload'
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: '0.9',
              transition: 'opacity 0.2s ease',
              whiteSpace: 'nowrap',
              lineHeight: '1.2',
            }}
          >
            📁 Upload Panoramas
          </Link>
        </header>
        <PanoramaViewer refreshTrigger={refreshTrigger} onNoConfig={handleNoConfig} />
      </div>
    );
  }

  // Otherwise, show the welcome screen.
  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <img
          src='/assets/svg/primezone-logo.svg'
          alt='PrimeZone Logo'
          className={styles.logo}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.icon}>🏢</div>

        <h1 className={styles.title}>Welcome to PrimeZone</h1>

        <p className={styles.description}>
          Experience immersive 360° panoramic tours of your spaces.
          <br />
          Get started by uploading your panoramic images.
        </p>

        <Link href='/upload' className={styles.uploadButton}>
          <span className={styles.uploadIcon}>📁</span>
          Upload Panoramas
        </Link>

        <div className={styles.supportInfo}>
          Supported formats: JPG, PNG • CSV file with poses required
        </div>
      </div>
    </div>
  );
}
