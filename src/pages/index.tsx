'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ReactElement, useState, useEffect } from 'react';
import styles from '@/styles/Welcome.module.css';

// Dynamically import PanoramaViewer to avoid SSR issues with Marzipano
const PanoramaViewer = dynamic(() => import('@/components/PanoramaViewer'), {
  ssr: false,
  loading: (): ReactElement => (
    <div id="loading">
      <div className="loader"></div>
      <div>Loading panoramas...</div>
    </div>
  ),
});

interface ConfigData {
  scenes: Array<{ id: string; name: string; [key: string]: any }>;
}

export default function Home(): ReactElement {
  const [hasPanoramas, setHasPanoramas] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkForPanoramas = async () => {
      console.log('Checking for panoramas...');
      try {
        // First check if config.json exists and has scenes
        console.log('Fetching /config.json...');
        const configResponse = await fetch('/config.json');
        console.log('Config response:', configResponse.status, configResponse.ok);
        if (!configResponse.ok) {
          console.log('config.json not found or failed to load.');
          setHasPanoramas(false);
          return;
        }

        const config: ConfigData = await configResponse.json();
        console.log('Config loaded:', config);
        if (!config.scenes || config.scenes.length === 0) {
          console.log('No scenes in config.json.');
          setHasPanoramas(false);
          return;
        }

        // Check if actual image files exist by testing the first few scenes
        const testScenes = config.scenes.slice(0, Math.min(3, config.scenes.length));
        let imageExists = false;
        console.log('Testing for images:', testScenes.map(s => s.id));

        for (const scene of testScenes) {
          const imageUrl = `/images/${scene.id}-pano.jpg`;
          try {
            console.log(`Checking for image: ${imageUrl}`);
            const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
            console.log(`Image response for ${imageUrl}:`, imageResponse.status, imageResponse.ok);
            if (imageResponse.ok) {
              imageExists = true;
              console.log(`Image found: ${imageUrl}`);
              break;
            }
          } catch (e) {
            console.error(`Error checking for image ${imageUrl}:`, e);
            // Continue checking other images
          }
        }

        console.log('Final imageExists check:', imageExists);
        setHasPanoramas(imageExists);
      } catch (error) {
        console.error('Error in checkForPanoramas:', error);
        console.log('No config or images found, showing welcome screen');
        setHasPanoramas(false);
      } finally {
        setIsLoading(false);
        console.log('Finished checking for panoramas.');
      }
    };

    checkForPanoramas();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          Checking for panoramas...
        </div>
      </div>
    );
  }

  // Welcome screen when no panoramas exist
  if (!hasPanoramas) {
    return (
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <img 
            src="/assets/svg/primezone-logo.svg" 
            alt="PrimeZone Logo" 
            className={styles.logo}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.icon}>
            🏢
          </div>
          
          <h1 className={styles.title}>
            Welcome to PrimeZone
          </h1>
          
          <p className={styles.description}>
            Experience immersive 360° panoramic tours of your spaces.
            <br />
            Get started by uploading your panoramic images.
          </p>
          
          <Link href="/upload" className={styles.uploadButton}>
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

  // Show panorama viewer when panoramas exist
  return (
    <div>
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1100,
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '12px 16px',
        borderRadius: '14px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <img 
          src="/assets/svg/primezone-logo.svg" 
          alt="PrimeZone Logo" 
          style={{
            height: '60px',
            width: 'auto',
            display: 'block'
          }}
        />
      </div>

      <header style={{
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
        marginBottom: '10px'
      }}>
        <Link 
          href="/upload" 
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
            lineHeight: '1.2'
          }}
        >
          📁 Upload Panoramas
        </Link>
      </header>
      <PanoramaViewer />
    </div>
  );
}
