'use client';

import { useState, useEffect, useRef } from 'react';
import { POIWithFiles } from '@/types/scenes';
import { detectContentType, isEmbeddableUrl, generateEmbedUrl, getIframeSandboxAttributes, ContentTypeInfo } from '@/utils/contentTypeUtils';

interface POIPreviewProps {
  poi: POIWithFiles;
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  mode: 'hover' | 'click';
}

interface POIContent {
  url: string;
  type: ContentTypeInfo;
  title: string;
  isFile: boolean;
}

export default function POIPreview({ poi, isVisible, onClose, position, mode }: POIPreviewProps) {
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<POIContent[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && poi) {
      loadContents();
    }
  }, [isVisible, poi]);

  useEffect(() => {
    if (mode === 'hover' && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close hover preview after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, mode, onClose]);

  const loadContents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const contentList: POIContent[] = [];
      
      // Add files as content
      if (poi.files && poi.files.length > 0) {
        for (const file of poi.files) {
          const url = URL.createObjectURL(file);
          const type = detectContentType(file.name, file.type);
          contentList.push({
            url,
            type,
            title: file.name,
            isFile: true
          });
        }
      }
      
      // Add URL content if description contains URLs
      if (poi.description) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = poi.description.match(urlRegex);
        
        if (urls) {
          for (const url of urls) {
            const type = detectContentType(url);
            contentList.push({
              url,
              type,
              title: `External Content: ${new URL(url).hostname}`,
              isFile: false
            });
          }
        }
      }
      
      setContents(contentList);
      setCurrentContentIndex(0);
    } catch (err) {
      setError('Failed to load content');
      console.error('Error loading POI content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load content');
  };

  const nextContent = () => {
    setCurrentContentIndex((prev) => (prev + 1) % contents.length);
  };

  const prevContent = () => {
    setCurrentContentIndex((prev) => (prev - 1 + contents.length) % contents.length);
  };

  const renderContent = (content: POIContent) => {
    const { url, type } = content;

    if (type.category === 'image') {
      return (
        <img
          src={url}
          alt={content.title}
          className="preview-image"
          onLoad={() => setLoading(false)}
          onError={() => setError('Failed to load image')}
        />
      );
    }

    if (type.category === 'video') {
      return (
        <video
          src={url}
          controls
          className="preview-video"
          onLoadedData={() => setLoading(false)}
          onError={() => setError('Failed to load video')}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (type.category === 'audio') {
      return (
        <div className="preview-audio">
          <div className="audio-icon">🎵</div>
          <audio
            src={url}
            controls
            onLoadedData={() => setLoading(false)}
            onError={() => setError('Failed to load audio')}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (type.canEmbed && (type.category === 'pdf' || type.category === 'web' || isEmbeddableUrl(url))) {
      const embedUrl = generateEmbedUrl(url, type);
      return (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="preview-iframe"
          sandbox={getIframeSandboxAttributes()}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={content.title}
        />
      );
    }

    // Fallback for non-embeddable content
    return (
      <div className="preview-fallback">
        <div className="fallback-icon">{type.icon}</div>
        <div className="fallback-title">{content.title}</div>
        <div className="fallback-type">{type.category.toUpperCase()}</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="fallback-link"
          onClick={() => setLoading(false)}
        >
          Open in new tab
        </a>
      </div>
    );
  };

  if (!isVisible || contents.length === 0) {
    return null;
  }

  const currentContent = contents[currentContentIndex];
  const isHoverMode = mode === 'hover';
  const previewClass = isHoverMode ? 'poi-preview-hover' : 'poi-preview-modal';

  return (
    <div className={`poi-preview-overlay ${previewClass}`}>
      <div
        ref={previewRef}
        className="poi-preview"
        style={position && isHoverMode ? {
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -100%)'
        } : {}}
      >
        <div className="preview-header">
          <div className="preview-title">
            <span className="content-icon">{currentContent.type.icon}</span>
            <span className="title-text">{poi.title}</span>
          </div>
          <div className="preview-controls">
            {contents.length > 1 && (
              <>
                <button
                  className="nav-button"
                  onClick={prevContent}
                  disabled={loading}
                  title="Previous content"
                >
                  ‹
                </button>
                <span className="content-counter">
                  {currentContentIndex + 1} / {contents.length}
                </span>
                <button
                  className="nav-button"
                  onClick={nextContent}
                  disabled={loading}
                  title="Next content"
                >
                  ›
                </button>
              </>
            )}
            <button className="close-button" onClick={onClose} title="Close preview">
              ✕
            </button>
          </div>
        </div>

        <div className="preview-content">
          {loading && (
            <div className="preview-loading">
              <div className="loading-spinner"></div>
              <span>Loading content...</span>
            </div>
          )}
          
          {error && (
            <div className="preview-error">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}
          
          {!loading && !error && renderContent(currentContent)}
        </div>

        {currentContent.title && (
          <div className="preview-footer">
            <span className="content-title">{currentContent.title}</span>
            {!currentContent.isFile && (
              <a
                href={currentContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                🔗
              </a>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .poi-preview-overlay {
          z-index: 3000;
        }

        .poi-preview-hover {
          position: absolute;
          pointer-events: none;
        }

        .poi-preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .poi-preview {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          max-width: ${isHoverMode ? '400px' : '800px'};
          max-height: ${isHoverMode ? '300px' : '600px'};
          width: 100%;
          pointer-events: auto;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .preview-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .content-icon {
          font-size: 18px;
        }

        .title-text {
          font-size: 16px;
          truncate: true;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .preview-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-button,
        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .nav-button:hover,
        .close-button:hover {
          background-color: #e9ecef;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .content-counter {
          font-size: 12px;
          color: #666;
          padding: 0 4px;
        }

        .preview-content {
          position: relative;
          height: ${isHoverMode ? '200px' : '400px'};
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
        }

        .preview-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .preview-video {
          width: 100%;
          height: 100%;
        }

        .preview-audio {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .audio-icon {
          font-size: 48px;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .preview-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          text-align: center;
        }

        .fallback-icon {
          font-size: 48px;
        }

        .fallback-title {
          font-weight: 600;
          color: #333;
        }

        .fallback-type {
          font-size: 12px;
          color: #666;
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .fallback-link {
          color: #007bff;
          text-decoration: none;
          padding: 8px 16px;
          border: 1px solid #007bff;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .fallback-link:hover {
          background: #007bff;
          color: white;
        }

        .preview-loading,
        .preview-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #666;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-icon {
          font-size: 32px;
        }

        .preview-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-top: 1px solid #eee;
          font-size: 14px;
        }

        .content-title {
          color: #666;
          flex: 1;
          truncate: true;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .external-link {
          color: #007bff;
          text-decoration: none;
          margin-left: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .poi-preview {
            max-width: ${isHoverMode ? '300px' : '95vw'};
            max-height: ${isHoverMode ? '250px' : '80vh'};
          }

          .preview-content {
            height: ${isHoverMode ? '150px' : '300px'};
          }

          .preview-title {
            font-size: 14px;
          }

          .title-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}