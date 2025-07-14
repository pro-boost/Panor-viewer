import { useState } from 'react';

export const useUploadState = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [deleteAllAndUpload, setDeleteAllAndUpload] = useState(false);

  const resetUploadState = () => {
    setMessage('');
    setUploadSuccess(false);
    setUploadProgress(0);
    setAllowOverwrite(false);
    setDeleteAllAndUpload(false);
  };

  const startUpload = () => {
    setIsLoading(true);
    setUploadProgress(0);
    resetUploadState();
  };

  const finishUpload = (success: boolean, finalMessage: string) => {
    setIsLoading(false);
    setUploadProgress(100);
    setUploadSuccess(success);
    setMessage(finalMessage);
    
    // Reset progress after a delay
    setTimeout(() => setUploadProgress(0), 2000);
  };

  const updateProgress = (progress: number) => {
    setUploadProgress(Math.min(progress, 100));
  };

  const createProgressInterval = () => {
    return setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 90) return prev + Math.random() * 10;
        return prev;
      });
    }, 1000);
  };

  const getProgressMessage = (progress: number): string => {
    if (progress < 30) return 'Preparing files...';
    if (progress < 70) return 'Uploading files...';
    if (progress < 100) return 'Processing data...';
    return 'Generating configuration...';
  };

  const handleUploadError = (error: any, response?: Response) => {
    setUploadProgress(0);
    setIsLoading(false);

    if (error.name === 'AbortError') {
      setMessage('Upload was cancelled.');
    } else if (error.message.includes('Failed to fetch')) {
      setMessage('Network error. Please check your connection and try again.');
    } else {
      setMessage('An error occurred during upload. Please try again.');
    }

    console.error('Upload error:', error);
  };

  const handleUploadResponse = async (response: Response) => {
    if (response.ok) {
      return await response.json();
    }

    const errorData = await response.json();

    if (response.status === 409 && errorData.duplicates) {
      // Handle duplicate files - this will be managed by validation hook
      throw { status: 409, data: errorData };
    } else if (response.status === 413) {
      setMessage(
        `Upload failed: ${errorData.error} Try uploading fewer files or reducing file sizes.`
      );
    } else if (response.status === 408) {
      setMessage(
        `Upload timeout: ${errorData.error} Try uploading fewer files at once.`
      );
    } else if (
      response.status === 500 &&
      errorData.error === 'Configuration generation failed'
    ) {
      setMessage(
        `Warning: Files uploaded successfully, but configuration generation failed.\n\n` +
          `Error: ${errorData.message}\n\n` +
          `You can try running this command manually:\n` +
          `${errorData.manualCommand || 'node scripts/node/generate-config.js --project "' + 'PROJECT_ID' + '"'}`
      );
    } else {
      setMessage(
        `Upload failed: ${errorData.error || errorData.message || 'Unknown error'}`
      );
    }

    throw { status: response.status, data: errorData };
  };

  const showLargeUploadWarning = (totalFiles: number) => {
    if (totalFiles > 10) {
      setMessage(
        'Large upload detected. This may take several minutes. Please be patient and do not close this page.'
      );
    }
  };

  const clearState = () => {
    setMessage('');
    setIsLoading(false);
    setUploadSuccess(false);
    setUploadProgress(0);
    setAllowOverwrite(false);
    setDeleteAllAndUpload(false);
  };

  return {
    message,
    setMessage,
    isLoading,
    setIsLoading,
    uploadSuccess,
    setUploadSuccess,
    uploadProgress,
    setUploadProgress,
    allowOverwrite,
    setAllowOverwrite,
    deleteAllAndUpload,
    setDeleteAllAndUpload,
    resetUploadState,
    startUpload,
    finishUpload,
    updateProgress,
    createProgressInterval,
    getProgressMessage,
    handleUploadError,
    handleUploadResponse,
    showLargeUploadWarning,
    clearState
  };
};