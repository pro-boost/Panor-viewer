'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { POIModalProps, POIFormData, POIPosition } from '@/types/poi';
import { validateFileType, formatFileSize } from './utils';
import { FaTimes, FaUpload, FaFile, FaLink, FaMapPin, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './POIModal.module.css';

const POIModal: React.FC<POIModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pendingPosition,
  editingPOI,
}) => {
  const [formData, setFormData] = useState<POIFormData>({
    name: '',
    description: '',
    type: 'file',
    content: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [customFilenames, setCustomFilenames] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedPosition, setStoredPosition] = useState<POIPosition | null>(
    null
  );

  // Store the pending position when modal opens or pre-fill form when editing
  useEffect(() => {
    if (isOpen) {
      if (editingPOI) {
        // Pre-fill form for editing
        setFormData({
          name: editingPOI.name,
          description: editingPOI.description,
          type: editingPOI.type,
          content: editingPOI.content,
        });
        setSelectedFiles([]);
        setCustomFilenames({});
        // Set existing files for editing
        if (editingPOI.files && editingPOI.files.length > 0) {
          setExistingFiles(editingPOI.files);
        } else if (editingPOI.content && editingPOI.type === 'file') {
          setExistingFiles([editingPOI.content]);
        } else {
          setExistingFiles([]);
        }
        setFilesToDelete([]);
        setCustomFilenames(editingPOI.customFilenames || {});
        
        // Initialize originalFilenames for existing files if not already set
         if (editingPOI.files && !editingPOI.originalFilenames) {
           const originalFilenames: {[key: number]: string} = {};
           editingPOI.files.forEach((filename, index) => {
             // For existing POIs without originalFilenames, use the stored filename as fallback
             originalFilenames[index] = filename;
           });
           // Store this in the POI data so it persists
           editingPOI.originalFilenames = originalFilenames;
         }
        setStoredPosition(editingPOI.position);
      } else if (pendingPosition && !storedPosition) {

        setStoredPosition(pendingPosition);
      }
    }
  }, [isOpen, pendingPosition, storedPosition, editingPOI]);

  // Clear stored position and form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStoredPosition(null);
      setFormData({
        name: '',
        description: '',
        type: 'file',
        content: '',
      });
      setSelectedFile(null);
      setSelectedFiles([]);
      setCustomFilenames({});
      setExistingFiles([]);
      setFilesToDelete([]);
    }
  }, [isOpen]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      if (!validateFileType(file)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 10MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      toast.error(`Some files were rejected:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        return newFiles;
      });
      // For backward compatibility, also set the first file as selectedFile
      if (validFiles.length === 1 && selectedFiles.length === 0) {
        setSelectedFile(validFiles[0]);
        setFormData(prev => ({ ...prev, content: validFiles[0].name }));
      } else {
        // For multiple files, set content to indicate multiple files
        const totalFiles = selectedFiles.length + validFiles.length;
        setFormData(prev => ({ ...prev, content: `${totalFiles} files selected` }));
      }
    }
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.webm'],
    },
    multiple: true,
  });

  const handleInputChange = (field: keyof POIFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type: 'file' | 'iframe') => {
    setFormData(prev => ({ ...prev, type, content: '' }));
    setSelectedFile(null);
    setSelectedFiles([]);
    setCustomFilenames({});
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, index) => index !== indexToRemove);
      
      // Update form content based on remaining files
      if (newFiles.length === 0) {
        setFormData(prev => ({ ...prev, content: '' }));
        setSelectedFile(null);
      } else if (newFiles.length === 1) {
        setFormData(prev => ({ ...prev, content: newFiles[0].name }));
        setSelectedFile(newFiles[0]);
      } else {
        setFormData(prev => ({ ...prev, content: `${newFiles.length} files selected` }));
      }
      
      return newFiles;
    });
    // Remove custom filename for this index and shift others
    setCustomFilenames(prev => {
      const newFilenames = { ...prev };
      const adjustedIndexToRemove = existingFiles.length + indexToRemove;
      delete newFilenames[adjustedIndexToRemove];
      // Shift remaining filenames down
      const shifted: {[key: number]: string} = {};
      Object.keys(newFilenames).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > adjustedIndexToRemove) {
          shifted[keyNum - 1] = newFilenames[keyNum];
        } else {
          shifted[keyNum] = newFilenames[keyNum];
        }
      });
      return shifted;
    });
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, content: '' }));
    setCustomFilenames({});
  };

  const handleCustomFilenameChange = (index: number, filename: string) => {
    // Adjust index to account for existing files
    const adjustedIndex = existingFiles.length + index;
    setCustomFilenames(prev => ({
      ...prev,
      [adjustedIndex]: filename
    }));
  };

  const getCustomFilename = (index: number, originalName: string) => {
    // Adjust index to account for existing files
    const adjustedIndex = existingFiles.length + index;
    return customFilenames[adjustedIndex] || (originalName ? originalName.replace(/\.[^/.]+$/, '') : '');
  };

  const getFileExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  };

  const getDisplayFilename = (filename: string, index?: number): string => {
    // First, check if we have a custom filename for this index (use current state)
    if (index !== undefined && customFilenames && customFilenames[index]) {
      return customFilenames[index];
    }
    
    // If no custom filename is set, try to use the original filename from editingPOI
    if (index !== undefined && editingPOI?.originalFilenames && editingPOI.originalFilenames[index]) {
      return editingPOI.originalFilenames[index];
    }
    
    // If we have a stored filename, return it, otherwise return empty string
    return filename || '';
  };

  const removeExistingFile = (filename: string) => {
    const fileIndex = existingFiles.indexOf(filename);
    if (fileIndex === -1) return;
    
    setExistingFiles(prev => prev.filter(file => file !== filename));
    setFilesToDelete(prev => [...prev, filename]);
    
    // Update customFilenames and originalFilenames to account for the removed file
    setCustomFilenames(prev => {
      const newFilenames = { ...prev };
      
      // Remove the custom filename for the deleted file
      delete newFilenames[fileIndex];
      
      // Shift all subsequent indices down by 1
      const shifted: {[key: number]: string} = {};
      Object.keys(newFilenames).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > fileIndex) {
          shifted[keyNum - 1] = newFilenames[keyNum];
        } else {
          shifted[keyNum] = newFilenames[keyNum];
        }
      });
      
      return shifted;
    });
    
    // Also update the originalFilenames in the editingPOI if it exists
    if (editingPOI && editingPOI.originalFilenames) {
      const newOriginalFilenames = { ...editingPOI.originalFilenames };
      
      // Remove the original filename for the deleted file
      delete newOriginalFilenames[fileIndex];
      
      // Shift all subsequent indices down by 1
      const shiftedOriginal: {[key: number]: string} = {};
      Object.keys(newOriginalFilenames).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > fileIndex) {
          shiftedOriginal[keyNum - 1] = newOriginalFilenames[keyNum];
        } else {
          shiftedOriginal[keyNum] = newOriginalFilenames[keyNum];
        }
      });
      
      editingPOI.originalFilenames = shiftedOriginal;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a name for the POI.');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description for the POI.');
      return;
    }

    if (formData.type === 'file' && selectedFiles.length === 0 && !selectedFile && !editingPOI) {
      toast.error('Please select at least one file to upload.');
      return;
    }

    if (formData.type === 'iframe' && !formData.content.trim()) {
      toast.error('Please enter a URL or iframe code for the iframe content.');
      return;
    }

    if (formData.type === 'iframe' && !isValidUrlOrIframe(formData.content)) {
      toast.error('Please enter a valid URL or iframe HTML code.');
      return;
    }

    // Add strict position validation
    if (!storedPosition) {
      toast.error('POI position missing - please right-click again');
      return;
    }



    setIsSubmitting(true);

    try {
      const submitData: POIFormData = {
        ...formData,
        file: selectedFile || undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
        position: storedPosition,
        customFilenames: customFilenames,
        originalFilenames: editingPOI?.originalFilenames || {},
      };

      // Add POI ID and file deletion info for editing
      if (editingPOI) {
        (submitData as any).id = editingPOI.id;
        (submitData as any).existingFiles = existingFiles;
        (submitData as any).filesToDelete = filesToDelete;
      }


      await onSubmit(submitData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'file',
        content: '',
      });
      setSelectedFile(null);
      setSelectedFiles([]);
      setCustomFilenames({});
      setExistingFiles([]);
      setFilesToDelete([]);

      toast.success(
        editingPOI ? 'POI updated successfully!' : 'POI created successfully!'
      );
      // Note: Modal will be closed by parent component after successful save
    } catch (error) {
      console.error(
        `Error ${editingPOI ? 'updating' : 'creating'} POI:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      toast.error(
        `Failed to ${editingPOI ? 'update' : 'create'} POI: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidUrlOrIframe = (string: string) => {
    // Check if it's a valid URL
    if (isValidUrl(string)) {
      return true;
    }
    
    // Check if it's iframe HTML code
    const trimmed = string.trim();
    if (trimmed.toLowerCase().startsWith('<iframe') && trimmed.toLowerCase().includes('</iframe>')) {
      return true;
    }
    
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FaMapPin className={styles.headerIcon} />
            <h2 className={styles.headerTitle}>
              {editingPOI ? 'Edit POI' : 'Create POI'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isSubmitting}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor='name' className={styles.label}>
              Name *
            </label>
            <input
              type='text'
              id='name'
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={styles.input}
              placeholder='Enter POI name'
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='description' className={styles.label}>
              Description *
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              className={styles.textarea}
              placeholder='Enter POI description'
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Content Type *</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type='radio'
                  name='type'
                  value='file'
                  checked={formData.type === 'file'}
                  onChange={() => handleTypeChange('file')}
                  className={styles.radioInput}
                  disabled={isSubmitting}
                />
                <FaFile />
                File Upload
              </label>
              <label className={styles.radioOption}>
                <input
                  type='radio'
                  name='type'
                  value='iframe'
                  checked={formData.type === 'iframe'}
                  onChange={() => handleTypeChange('iframe')}
                  className={styles.radioInput}
                  disabled={isSubmitting}
                />
                <FaLink />
                URL/Iframe
              </label>
            </div>
          </div>

          {formData.type === 'file' && (
            <div className={styles.fileUploadSection}>
              <label className={styles.label}>
                File Upload {editingPOI ? '' : '*'}
              </label>

              {/* Show existing files when editing */}
              {existingFiles.length > 0 && (
                <div className={styles.existingFilesSection}>
                  <div className={styles.existingFilesHeader}>
                    <span>Current Files ({existingFiles.length})</span>
                  </div>
                  <div className={styles.existingFilesList}>
                    {existingFiles.map((filename, index) => (
                      <div key={`existing-${filename}-${index}`} className={styles.existingFileItem}>
                        <div className={styles.fileInfo}>
                          <FaFile className={styles.fileIcon} />
                          <div className={styles.fileDetails}>
                            <span className={styles.fileName}>
                              {getDisplayFilename(filename, index)}
                            </span>
                            <span className={styles.fileType}>Existing file</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingFile(filename)}
                          className={styles.removeFileButton}
                          disabled={isSubmitting}
                          title="Delete file"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {existingFiles.length > 0 && (
                    <p className={styles.existingFileNote}>
                      Add new files below or delete existing ones above
                    </p>
                  )}
                </div>
              )}

              <div
                {...getRootProps()}
                className={`${styles.dropzone} ${
                  isDragActive ? styles.dropzoneActive : ''
                } ${isSubmitting ? styles.dropzoneDisabled : ''}`}
              >
                <input {...getInputProps()} disabled={isSubmitting} />
                <FaUpload className={styles.uploadIcon} size={24} />
                {selectedFiles.length > 0 || selectedFile ? (
                  <div className={styles.selectedFileInfo}>
                    {selectedFiles.length > 0 ? (
                      <p className={styles.selectedFileName}>
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                    ) : selectedFile ? (
                      <>
                        <p className={styles.selectedFileName}>
                          {selectedFile.name}
                        </p>
                        <p className={styles.selectedFileSize}>
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </>
                    ) : null}
                    {editingPOI && (
                      <p className={styles.replaceFileNote}>
                        This will replace the current file{selectedFiles.length > 1 ? 's' : ''}
                      </p>
                    )}
                    <p className={styles.dropzoneSubtext}>
                      Click or drag to add more files
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className={styles.dropzoneText}>
                      {isDragActive
                        ? 'Drop the files here'
                        : editingPOI
                          ? 'Drag & drop files here, or click to select'
                          : 'Drag & drop files here, or click to select'}
                    </p>
                    <p className={styles.dropzoneSubtext}>
                      Supports: Images, PDFs, Videos (max 10MB each) • Multiple files allowed
                    </p>
                  </div>
                )}
              </div>

              {/* Display selected files list */}
              {selectedFiles.length > 0 && (
                <div className={styles.selectedFilesList}>
                  <div className={styles.filesListHeader}>
                    <span>Selected Files ({selectedFiles.length})</span>
                    <button
                      type="button"
                      onClick={clearAllFiles}
                      className={styles.clearAllButton}
                      disabled={isSubmitting}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className={styles.filesList}>
                    {selectedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                          <FaFile className={styles.fileIcon} />
                          <div className={styles.fileDetails}>
                            <div className={styles.fileNameSection}>
                              <label className={styles.filenameLabel}>Filename:</label>
                              <div className={styles.filenameInputGroup}>
                                <input
                                  type="text"
                                  value={getCustomFilename(index, file.name)}
                                  onChange={(e) => handleCustomFilenameChange(index, e.target.value)}
                                  className={styles.filenameInput}
                                  placeholder="Enter filename"
                                  disabled={isSubmitting}
                                />
                                <span className={styles.fileExtension}>{getFileExtension(file.name)}</span>
                              </div>
                            </div>
                            <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className={styles.removeFileButton}
                          disabled={isSubmitting}
                          title="Remove file"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.type === 'iframe' && (
            <div className={styles.formGroup}>
              <label htmlFor='url' className={styles.label}>
                URL or Iframe Code *
              </label>
              <textarea
                id='url'
                value={formData.content}
                onChange={e => handleInputChange('content', e.target.value)}
                className={styles.textarea}
                placeholder='https://www.youtube.com/watch?v=VIDEO_ID or https://example.com or <iframe src="..." width="..." height="..."></iframe>'
                rows={4}
                required
                disabled={isSubmitting}
              />
              <p className={styles.inputHint}>
                Enter a URL (YouTube, Vimeo, etc.) or paste iframe HTML code. YouTube URLs will be automatically converted to embeddable format.
              </p>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type='button'
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? editingPOI
                  ? 'Updating...'
                  : 'Creating...'
                : editingPOI
                  ? 'Update POI'
                  : 'Create POI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POIModal;
