'use client';

import { useState, useRef, useCallback } from 'react';
import { InfoHotspot } from '@/types/scenes';

interface POIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poi: InfoHotspot, files: File[]) => void;
  initialData?: {
    yaw: number;
    pitch: number;
    sceneId: string;
  };
  editingPOI?: InfoHotspot;
}

export default function POIDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  editingPOI,
}: POIDialogProps) {
  const [title, setTitle] = useState(editingPOI?.title || '');
  const [description, setDescription] = useState(editingPOI?.description || '');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; files?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; files?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Check file sizes (max 10MB per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      newErrors.files = 'Some files are larger than 10MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (!initialData && !editingPOI) return;

    const poi: InfoHotspot = {
      id: editingPOI?.id || `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      yaw: editingPOI?.yaw || initialData!.yaw,
      pitch: editingPOI?.pitch || initialData!.pitch,
      title: title.trim(),
      description: description.trim() || undefined,
      type: 'info',
      sceneId: editingPOI?.sceneId || initialData!.sceneId,
      createdAt: editingPOI?.createdAt || new Date(),
      updatedAt: editingPOI ? new Date() : undefined,
    };

    onSave(poi, files);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setFiles([]);
    setErrors({});
    onClose();
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).filter(file => {
      // Allow images and common document types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      return allowedTypes.includes(file.type);
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

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

  if (!isOpen) return null;

  return (
    <div className="poi-dialog-overlay">
      <div className="poi-dialog">
        <div className="poi-dialog-header">
          <h3>{editingPOI ? 'Edit POI' : 'Create New POI'}</h3>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="poi-dialog-content">
          <div className="form-group">
            <label htmlFor="poi-title">Title *</label>
            <input
              id="poi-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter POI title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="poi-description">Description</label>
            <textarea
              id="poi-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter POI description (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Files</label>
            <div
              className={`file-drop-zone ${dragActive ? 'active' : ''} ${errors.files ? 'error' : ''}`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="file-drop-content">
                <span className="file-drop-icon">📁</span>
                <p>Drag & drop files here or click to select</p>
                <p className="file-drop-hint">
                  Supports: Images (JPG, PNG, GIF, WebP), PDF, Word documents, Text files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>
            {errors.files && <span className="error-text">{errors.files}</span>}
          </div>

          {files.length > 0 && (
            <div className="file-preview-grid">
              {files.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <div className="file-preview-header">
                    <span className="file-icon">{getFileIcon(file.type)}</span>
                    <button
                      className="remove-file-button"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="file-preview-info">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                  {file.type.startsWith('image/') && (
                    <div className="file-preview-image">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        onLoad={(e) => {
                          // Clean up the blob URL after image loads
                          setTimeout(() => {
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }, 1000);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="poi-dialog-footer">
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            {editingPOI ? 'Update' : 'Create'} POI
          </button>
        </div>
      </div>

      <style jsx>{`
        .poi-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .poi-dialog {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .poi-dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }

        .poi-dialog-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background-color: #f5f5f5;
        }

        .poi-dialog-content {
          padding: 0 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #f44336;
        }

        .error-text {
          color: #f44336;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .file-drop-zone {
          border: 2px dashed #e1e5e9;
          border-radius: 8px;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }

        .file-drop-zone:hover,
        .file-drop-zone.active {
          border-color: #4CAF50;
          background: #f8fff8;
        }

        .file-drop-zone.error {
          border-color: #f44336;
          background: #fff8f8;
        }

        .file-drop-content p {
          margin: 8px 0;
          color: #666;
        }

        .file-drop-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 10px;
        }

        .file-drop-hint {
          font-size: 12px !important;
          color: #999 !important;
        }

        .file-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .file-preview-item {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 8px;
          background: white;
        }

        .file-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .file-icon {
          font-size: 20px;
        }

        .remove-file-button {
          background: #f44336;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-preview-info {
          margin-bottom: 8px;
        }

        .file-name {
          font-size: 12px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 11px;
          color: #666;
        }

        .file-preview-image {
          width: 100%;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
        }

        .file-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .poi-dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #eee;
          margin-top: 20px;
        }

        .cancel-button,
        .save-button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-button {
          background: #f5f5f5;
          border: 1px solid #ddd;
          color: #666;
        }

        .cancel-button:hover {
          background: #eeeeee;
        }

        .save-button {
          background: #4CAF50;
          border: 1px solid #4CAF50;
          color: white;
        }

        .save-button:hover {
          background: #45a049;
        }

        @media (max-width: 768px) {
          .poi-dialog {
            margin: 10px;
            max-height: 90vh;
          }

          .file-preview-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}