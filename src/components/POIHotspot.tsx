'use client';

import { useEffect, useRef, useState } from 'react';
import { POIWithFiles } from '@/types/scenes';
import { detectContentType, ContentTypeInfo } from '@/utils/contentTypeUtils';

interface POIHotspotProps {
  element: HTMLElement;
  poi: POIWithFiles;
  visible: boolean;
  onClick: (poi: POIWithFiles) => void;
  onHover?: (poi: POIWithFiles, position: { x: number; y: number }) => void;
  onHoverEnd?: () => void;
}

export default function POIHotspot({
  element,
  poi,
  visible,
  onClick,
  onHover,
  onHoverEnd,
}: POIHotspotProps) {
  const [dynamicIcon, setDynamicIcon] = useState<string>('📍');
  const hasImages = poi.imageUrls && poi.imageUrls.length > 0;
  const hasFiles = poi.files && poi.files.length > 0;
  const fileCount = poi.files ? poi.files.length : 0;
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine the appropriate icon based on content
  useEffect(() => {
    let primaryIcon = '📍'; // Default icon
    
    // Check files for content type
    if (poi.files && poi.files.length > 0) {
      const firstFile = poi.files[0];
      const contentType = detectContentType(firstFile.name, firstFile.type);
      primaryIcon = contentType.icon;
    } else if (poi.description) {
      // Check description for URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = poi.description.match(urlRegex);
      
      if (urls && urls.length > 0) {
        const contentType = detectContentType(urls[0]);
        primaryIcon = contentType.icon;
      }
    }
    
    setDynamicIcon(primaryIcon);
  }, [poi]);

  useEffect(() => {
    if (!element) return;

    // Set up click handler
    const handleClick = (e: Event) => {
      e.stopPropagation();
      onClick(poi);
    };

    // Set up hover handlers for preview
    const handleMouseEnter = (e: MouseEvent) => {
      if (onHover && hoverTimeoutRef.current === null) {
        hoverTimeoutRef.current = setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const position = {
            x: rect.left + rect.width / 2,
            y: rect.top
          };
          onHover(poi, position);
        }, 500); // 500ms delay before showing preview
      }
    };

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (onHoverEnd) {
        onHoverEnd();
      }
    };

    // Generate the HTML content with dynamic icon
    const htmlContent = `
      <div class="poi-marker">
        <div class="poi-icon">${dynamicIcon}</div>
        ${hasFiles ? `<div class="file-count-badge">${fileCount}</div>` : ''}
        ${hasImages ? '<div class="image-indicator">🖼️</div>' : ''}
        <div class="poi-tooltip">
          <div class="poi-title">${poi.title}</div>
          ${poi.description ? `<div class="poi-description">${poi.description}</div>` : ''}
          ${hasFiles ? `<div class="poi-file-info">${fileCount} file${fileCount !== 1 ? 's' : ''} attached</div>` : ''}
        </div>
      </div>
      <style>
        .poi-marker {
          position: relative;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          border: 3px solid white;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          z-index: 100;
          animation: poiAppear 0.5s ease-out;
        }
        .poi-marker:hover {
          transform: scale(1.25);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
          background: linear-gradient(135deg, #66BB6A, #4CAF50);
        }
        .poi-marker:hover .poi-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-10px);
        }
        .poi-icon {
          font-size: 18px;
          line-height: 1;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
          user-select: none;
        }
        .file-count-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff5722;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        .image-indicator {
          position: absolute;
          bottom: -6px;
          right: -6px;
          background: #2196F3;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        .poi-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-5px);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          white-space: nowrap;
          max-width: 250px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .poi-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
        }
        .poi-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: white;
        }
        .poi-description {
          font-size: 12px;
          color: #ccc;
          margin-bottom: 4px;
          white-space: normal;
          max-width: 200px;
          line-height: 1.3;
        }
        .poi-file-info {
          font-size: 11px;
          color: #4CAF50;
          font-weight: 500;
        }
        @keyframes poiAppear {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 768px) {
          .poi-marker { width: 28px; height: 28px; }
          .poi-icon { font-size: 14px; }
          .file-count-badge { width: 16px; height: 16px; font-size: 9px; top: -6px; right: -6px; }
          .image-indicator { width: 14px; height: 14px; font-size: 7px; bottom: -5px; right: -5px; }
          .poi-tooltip { font-size: 12px; padding: 8px 12px; max-width: 200px; }
          .poi-description { font-size: 11px; max-width: 150px; }
          .poi-file-info { font-size: 10px; }
        }
      </style>
    `;

    // Set the HTML content directly - no appendChild/removeChild needed
    element.innerHTML = htmlContent;
    element.addEventListener('click', handleClick);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      // Clear any pending hover timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      
      // No need to manually remove DOM elements - Marzipano handles this
    };
  }, [element, poi, onClick, onHover, onHoverEnd, hasImages, hasFiles, fileCount, dynamicIcon]);

  useEffect(() => {
    if (element) {
      element.style.opacity = visible ? '1' : '0';
      element.style.pointerEvents = visible ? 'auto' : 'none';
    }
  }, [visible, element]);

  // This component doesn't render anything directly - it manipulates the DOM element
  return null;
}