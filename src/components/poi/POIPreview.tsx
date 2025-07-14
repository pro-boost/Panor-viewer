'use client';

import React, { useState, useEffect } from 'react';
import { POIPreviewProps } from '@/types/poi';
import { getFileCategory } from './utils';
import {
  FaTimes,
  FaFile,
  FaImage,
  FaVideo,
  FaFilePdf,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaEye,
} from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import styles from './POIPreview.module.css';
// Using iframe-based PDF viewer for better compatibility

const POIPreview: React.FC<POIPreviewProps> = ({ poi, projectId, onClose, onEdit, onDelete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(poi);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(poi.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handlePdfLoad = () => {
    setIsLoading(false);
    setPdfError(false);
  };

  const handlePdfError = () => {
    setPdfError(true);
    setIsLoading(false);
  };

  const getContentPath = (filename?: string) => {
    if (poi.type === 'iframe') {
      return poi.content;
    }
    // Use API route for file serving to handle CORS and static file issues
    const file = filename || poi.content;
    return `/api/files/${projectId}/data/poi/attachments/${file}`;
  };

  const renderFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <FaImage className="text-blue-500" size={24} />;
      case 'video':
        return <FaVideo className="text-green-500" size={24} />;
      case 'pdf':
        return <FaFilePdf className="text-red-500" size={24} />;
      default:
        return <FaFile className="text-gray-500" size={24} />;
    }
  };

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const convertYouTubeUrl = (url: string): string => {
    // Convert various YouTube URL formats to embed format
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      // Extract timestamp if present
      const timeMatch = url.match(/[?&]t=([0-9]+)/);
      const startTime = timeMatch ? `?start=${timeMatch[1]}` : '';
      return `https://www.youtube.com/embed/${videoId}${startTime}`;
    }
    
    return url;
  };

  const convertVimeoUrl = (url: string): string => {
    // Convert Vimeo URLs to embed format
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/;
    const match = url.match(vimeoRegex);
    
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    
    return url;
  };

  const getIframeContent = () => {
    const content = poi.content.trim();
    
    // If it's HTML iframe code, extract src or render directly
    if (content.toLowerCase().startsWith('<iframe')) {
      // Decode HTML entities first
      const decodedContent = decodeHtmlEntities(content);
      
      // Try to extract src attribute from decoded content
      const srcMatch = decodedContent.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        let src = srcMatch[1];
        // Convert YouTube/Vimeo URLs in iframe src to embed format
        src = convertYouTubeUrl(src);
        src = convertVimeoUrl(src);
        
        return {
          src: src,
          html: decodedContent.replace(/src=["']([^"']+)["']/i, `src="${src}"`),
          isHtml: true
        };
      }
      // If no src found, render as HTML
      return {
        src: null,
        html: decodedContent,
        isHtml: true
      };
    }
    
    // It's a direct URL - convert YouTube/Vimeo URLs to embed format
    let convertedUrl = convertYouTubeUrl(content);
    convertedUrl = convertVimeoUrl(convertedUrl);
    
    return {
      src: convertedUrl,
      html: null,
      isHtml: false
    };
  };

  const renderFileContent = (filename: string, index?: number) => {
    const contentPath = getContentPath(filename);
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    const mimeType = getMimeType(fileExtension);
    const category = getFileCategory(mimeType);
    const fileKey = index !== undefined ? `${filename}-${index}` : filename;

    if (category === 'image') {
      return (
        <div key={fileKey} className={styles.imageContainer}>
          {isLoading && (
            <div className={styles.imageLoadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          )}
          {imageError ? (
            <div className={styles.errorContainer}>
              <FaImage className={styles.errorIcon} size={48} />
              <p className={styles.errorText}>Failed to load image</p>
              <a
                href={contentPath}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.errorLink}
              >
                Open file directly
              </a>
            </div>
          ) : (
            <img
              src={contentPath}
              alt={filename}
              className={styles.previewImage}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      );
    }

    if (category === 'video') {
      return (
        <div key={fileKey} className={styles.videoContainer}>
          {isLoading && (
            <div className={styles.videoLoadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          )}
          <video
            src={contentPath}
            controls
            className={styles.previewVideo}
            onLoadedData={handleImageLoad}
            onError={handleImageError}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For PDFs, show PDF viewer
    if (category === 'pdf') {
      return (
        <div key={fileKey} className={styles.pdfContainer}>
          {isLoading && (
            <div className={styles.pdfLoadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading PDF...</p>
            </div>
          )}
          {pdfError ? (
            <div className={styles.errorContainer}>
              <FaFilePdf className={styles.errorIcon} size={48} />
              <p className={styles.errorText}>Failed to load PDF</p>
              <a
                href={contentPath}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.errorLink}
              >
                Open PDF directly
              </a>
            </div>
          ) : (
            <>
              <iframe
                src={contentPath}
                className={styles.pdfIframe}
                title={`PDF: ${filename}`}
                onLoad={handlePdfLoad}
                onError={handlePdfError}
              />
              <div className={styles.pdfActions}>
                <a
                  href={contentPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.openFileButton}
                >
                  Open in new tab
                </a>
              </div>
            </>
          )}
        </div>
      );
    }

    // For other files, show download link
    return (
      <div key={fileKey} className={styles.fileContainer}>
        <div className={styles.fileIcon}>{renderFileIcon(category)}</div>
        <p className={styles.fileName}>{filename}</p>
        <a
          href={contentPath}
          target='_blank'
          rel='noopener noreferrer'
          className={styles.openFileButton}
        >
          Open File
        </a>
      </div>
    );
  };

  const renderContent = () => {
    if (poi.type === 'iframe') {
      const iframeContent = getIframeContent();
      
      return (
        <div className={styles.iframeContainer}>
          {isLoading && (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
            </div>
          )}
          {iframeContent.isHtml && iframeContent.html ? (
            <div 
              dangerouslySetInnerHTML={{ __html: iframeContent.html }}
              className={styles.iframeWrapper}
            />
          ) : (
            <iframe
              src={iframeContent.src || poi.content}
              className={styles.iframe}
              title={poi.name}
              onLoad={handleImageLoad}
              onError={() => setIsLoading(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            />
          )}
          {iframeContent.src && (
            <a
              href={iframeContent.src}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLinkButton}
              title="Open in new tab"
            >
              <FaExternalLinkAlt size={12} />
            </a>
          )}
        </div>
      );
    }

    // Handle multiple files if they exist
    if (poi.files && poi.files.length > 0) {
      if (poi.files.length === 1) {
        // Single file - render directly
        return renderFileContent(poi.files[0], 0);
      }
      
      // Multiple files - show stacked layout with preview
      return (
        <div className={styles.stackedFilesContainer}>
          <div className={styles.filesHeader}>
            <p className={styles.filesCount}>{poi.files.length} files attached</p>
          </div>
          
          {/* Main preview area */}
          <div className={styles.mainPreviewArea}>
            {renderFileContent(poi.files[selectedFileIndex], selectedFileIndex)}
          </div>
          
          {/* File thumbnails/stack */}
          <div className={styles.fileStack}>
            {poi.files.map((filename, index) => {
              const category = getFileCategory(filename);
              const isSelected = index === selectedFileIndex;
              
              return (
                <div
                  key={`stack-${index}`}
                  className={`${styles.stackItem} ${isSelected ? styles.stackItemSelected : ''}`}
                  onClick={() => setSelectedFileIndex(index)}
                  style={{ zIndex: poi.files!.length - index }}
                >
                  <div className={styles.stackItemIcon}>
                    {renderFileIcon(category)}
                  </div>
                  <div className={styles.stackItemInfo}>
                    <span className={styles.stackItemName}>{filename}</span>
                    <span className={styles.stackItemType}>{category}</span>
                  </div>
                  {isSelected && (
                    <div className={styles.selectedIndicator}>
                      <FaEye size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Fallback to single file (backward compatibility)
    return renderFileContent(poi.content);
  };



  const getMimeType = (extension: string): string => {
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      mp4: 'video/mp4',
      webm: 'video/webm'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  return (
    <div className={styles.previewOverlay}>
      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.previewTitle}>{poi.name}</h2>
          </div>
          <div className={styles.headerActions}>
            {onEdit && (
              <button
                onClick={handleEdit}
                className={`${styles.actionButton} ${styles.editButton}`}
                title="Edit POI"
              >
                <FaEdit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Delete POI"
              >
                <FaTrash size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className={`${styles.actionButton} ${styles.closeButton}`}
              title="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        <div className={styles.previewContent}>
          {poi.description && (
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>
                Description
              </h3>
              <p className={styles.descriptionText}>
                {poi.description}
              </p>
            </div>
          )}

          <div className={styles.contentSection}>
            <h3 className={styles.sectionTitle}>Content</h3>
            {renderContent()}
          </div>

          <div className={styles.previewFooter}>
            <p className={styles.footerText}>Created: {new Date(poi.createdAt).toLocaleString()}</p>
            {poi.updatedAt !== poi.createdAt && (
              <p className={styles.footerText}>Updated: {new Date(poi.updatedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete POI"
        message={`Are you sure you want to delete "${poi.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </div>
  );
};

export default POIPreview;