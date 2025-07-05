'use client';

import { useState, useEffect } from 'react';
import { POIWithFiles, POIFile } from '@/types/scenes';
import { poiDB } from '@/lib/poiDatabase';
import { detectContentType, isEmbeddableUrl, generateEmbedUrl } from '@/utils/contentTypeUtils';

interface POIDetailsModalProps {
  poi: POIWithFiles | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (poi: POIWithFiles) => void;
  onDelete: (poiId: string) => void;
}

export default function POIDetailsModal({
  poi,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: POIDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [files, setFiles] = useState<POIFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (poi && isOpen) {
      loadFiles();
    }
  }, [poi, isOpen]);

  const loadFiles = async () => {
    if (!poi) return;
    
    setLoading(true);
    try {
      const poiFiles = await poiDB.getFilesForPOI(poi.id);
      setFiles(poiFiles);
    } catch (error) {
      console.error('Error loading POI files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!poi) return;
    
    if (confirm('Are you sure you want to delete this POI? This action cannot be undone.')) {
      onDelete(poi.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (!poi) return;
    onEdit(poi);
  };

  const downloadFile = async (file: POIFile) => {
    try {
      const blob = file.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await poiDB.deleteFile(fileId);
        await loadFiles(); // Reload files
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    return '📎';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  const documentFiles = files.filter(file => !file.type.startsWith('image/'));

  if (!isOpen || !poi) return null;

  return (
    <div className="poi-details-overlay">
      <div className="poi-details-modal">
        <div className="poi-details-header">
          <h2>{poi.title}</h2>
          <div className="header-actions">
            <button className="edit-button" onClick={handleEdit} title="Edit POI">
              ✏️
            </button>
            <button className="delete-button" onClick={handleDelete} title="Delete POI">
              🗑️
            </button>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="poi-details-content">
          {poi.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{poi.description}</p>
            </div>
          )}

          <div className="metadata-section">
            <div className="metadata-item">
              <strong>Created:</strong> {formatDate(poi.createdAt)}
            </div>
            {poi.updatedAt && (
              <div className="metadata-item">
                <strong>Updated:</strong> {formatDate(poi.updatedAt)}
              </div>
            )}
            <div className="metadata-item">
              <strong>Coordinates:</strong> Yaw: {poi.yaw.toFixed(3)}, Pitch: {poi.pitch.toFixed(3)}
            </div>
          </div>

          {loading && (
            <div className="loading-section">
              <p>Loading files...</p>
            </div>
          )}

          {!loading && imageFiles.length > 0 && (
            <div className="images-section">
              <h3>Images ({imageFiles.length})</h3>
              <div className="image-gallery">
                <div className="main-image">
                  <img
                    src={URL.createObjectURL(imageFiles[currentImageIndex].data)}
                    alt={imageFiles[currentImageIndex].name}
                    onLoad={(e) => {
                      // Clean up blob URL after a delay
                      setTimeout(() => {
                        URL.revokeObjectURL((e.target as HTMLImageElement).src);
                      }, 5000);
                    }}
                  />
                  <div className="image-controls">
                    <button
                      className="download-button"
                      onClick={() => downloadFile(imageFiles[currentImageIndex])}
                      title="Download image"
                    >
                      💾
                    </button>
                    <button
                      className="delete-file-button"
                      onClick={() => deleteFile(imageFiles[currentImageIndex].id)}
                      title="Delete image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {imageFiles.length > 1 && (
                  <div className="image-thumbnails">
                    {imageFiles.map((file, index) => (
                      <div
                        key={file.id}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={URL.createObjectURL(file.data)}
                          alt={file.name}
                          onLoad={(e) => {
                            setTimeout(() => {
                              URL.revokeObjectURL((e.target as HTMLImageElement).src);
                            }, 5000);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && documentFiles.length > 0 && (
            <div className="documents-section">
              <h3>Documents ({documentFiles.length})</h3>
              <div className="documents-list">
                {documentFiles.map((file) => (
                  <div key={file.id} className="document-item">
                    <div className="document-info">
                      <span className="file-icon">{getFileIcon(file.type)}</span>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="document-actions">
                      <button
                        className="download-button"
                        onClick={() => downloadFile(file)}
                        title="Download file"
                      >
                        💾
                      </button>
                      <button
                        className="delete-file-button"
                        onClick={() => deleteFile(file.id)}
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {poi.contentUrls && poi.contentUrls.length > 0 && (
            <div className="content-urls-section">
              <h3>Web Content ({poi.contentUrls.length})</h3>
              <div className="content-urls-list">
                {poi.contentUrls.map((url, index) => {
                  const contentType = detectContentType(url);
                  const isEmbeddable = isEmbeddableUrl(url);
                  const embedUrl = isEmbeddable ? generateEmbedUrl(url) : null;
                  
                  return (
                    <div key={index} className="content-url-item">
                      <div className="url-info">
                        <span className="url-icon">{contentType.icon}</span>
                        <div className="url-details">
                          <div className="url-text">{url}</div>
                          <div className="url-meta">
                            <span className={isEmbeddable ? 'embeddable-badge' : 'non-embeddable-badge'}>
                              {isEmbeddable ? 'Embeddable' : 'Link only'}
                            </span>
                            <span className="content-type">{contentType.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="url-actions">
                        <button
                          className="open-url-button"
                          onClick={() => window.open(url, '_blank')}
                          title="Open in new tab"
                        >
                          🔗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Embedded content preview */}
              {poi.contentUrls.some(url => isEmbeddableUrl(url)) && (
                <div className="embedded-content">
                  <h4>Preview</h4>
                  {poi.contentUrls
                    .filter(url => isEmbeddableUrl(url))
                    .slice(0, 1) // Show only first embeddable content
                    .map((url, index) => {
                      const embedUrl = generateEmbedUrl(url);
                      return (
                        <div key={index} className="iframe-container">
                          <iframe
                            src={embedUrl}
                            title={`Embedded content from ${url}`}
                            frameBorder="0"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            loading="lazy"
                          />
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          )}

          {!loading && files.length === 0 && (!poi.contentUrls || poi.contentUrls.length === 0) && (
            <div className="no-files-section">
              <p>No files or content attached to this POI.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .poi-details-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .poi-details-modal {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .poi-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 12px 12px 0 0;
        }

        .poi-details-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .edit-button,
        .delete-button,
        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .edit-button:hover {
          background-color: #e3f2fd;
        }

        .delete-button:hover {
          background-color: #ffebee;
        }

        .close-button:hover {
          background-color: #f5f5f5;
        }

        .poi-details-content {
          padding: 24px;
        }

        .description-section,
        .metadata-section,
        .images-section,
        .documents-section,
        .loading-section,
        .no-files-section {
          margin-bottom: 24px;
        }

        .description-section h3,
        .images-section h3,
        .documents-section h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .description-section p {
          margin: 0;
          line-height: 1.6;
          color: #666;
        }

        .metadata-section {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
        }

        .metadata-item {
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }

        .metadata-item:last-child {
          margin-bottom: 0;
        }

        .metadata-item strong {
          color: #333;
        }

        .image-gallery {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }

        .main-image {
          position: relative;
          background: #f5f5f5;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .main-image img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
        }

        .image-controls {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
        }

        .download-button,
        .delete-file-button {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .download-button:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .delete-file-button:hover {
          background: rgba(244, 67, 54, 0.8);
        }

        .image-thumbnails {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: #f8f9fa;
          overflow-x: auto;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s;
        }

        .thumbnail.active {
          border-color: #4CAF50;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .documents-list {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }

        .document-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;
        }

        .document-item:last-child {
          border-bottom: none;
        }

        .document-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .file-icon {
          font-size: 24px;
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .file-meta {
          font-size: 12px;
          color: #666;
        }

        .document-actions {
          display: flex;
          gap: 8px;
        }

        .loading-section,
        .no-files-section {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .content-urls-section h3,
        .content-urls-section h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .content-urls-section h4 {
          font-size: 16px;
          margin-top: 20px;
        }

        .content-urls-list {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .content-url-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;
        }

        .content-url-item:last-child {
          border-bottom: none;
        }

        .url-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .url-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .url-details {
          flex: 1;
          min-width: 0;
        }

        .url-text {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          word-break: break-all;
          font-size: 14px;
        }

        .url-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .embeddable-badge {
          background: #e8f5e8;
          color: #2e7d32;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .non-embeddable-badge {
          background: #fff3e0;
          color: #f57c00;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .content-type {
          font-size: 12px;
          color: #666;
          text-transform: capitalize;
        }

        .url-actions {
          display: flex;
          gap: 8px;
        }

        .open-url-button {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .open-url-button:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .embedded-content {
          margin-top: 20px;
        }

        .iframe-container {
          position: relative;
          width: 100%;
          height: 400px;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .iframe-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 768px) {
          .poi-details-modal {
            margin: 10px;
            max-height: 95vh;
          }

          .poi-details-header {
            padding: 16px;
          }

          .poi-details-header h2 {
            font-size: 20px;
          }

          .poi-details-content {
            padding: 16px;
          }

          .main-image {
            min-height: 200px;
          }

          .main-image img {
            max-height: 250px;
          }

          .document-item {
            padding: 12px;
          }

          .content-url-item {
            padding: 12px;
          }

          .url-text {
            font-size: 13px;
          }

          .iframe-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}