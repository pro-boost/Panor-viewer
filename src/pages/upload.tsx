import { FormEvent, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/Upload.module.css';
import Logo from '@/components/ui/Logo';
import { useFileManager } from '@/hooks/useFileManager';
import { useUploadState } from '@/hooks/useUploadState';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useValidation } from '@/hooks/useValidation';

export default function Upload() {
  // Initialize custom hooks
  const projectManager = useProjectManager();
  const uploadState = useUploadState();
  const validation = useValidation();
  const fileManager = useFileManager(projectManager.isEditMode, projectManager.existingFiles);

  // Destructure commonly used values for cleaner code
  const {
    projectName,
    setProjectName,
    createdProjectId,
    editingProjectId,
    isEditMode,
    existingFiles,
    showExistingFiles,
    setShowExistingFiles,
    navigateBack,
    validateProjectName,
    createProject,
    updateProjectName,
    getProjectStatusMessage
  } = projectManager;

  const {
    message,
    setMessage,
    isLoading,
    uploadSuccess,
    uploadProgress,
    allowOverwrite,
    setAllowOverwrite,
    deleteAllAndUpload,
    setDeleteAllAndUpload,
    startUpload,
    finishUpload,
    createProgressInterval,
    getProgressMessage,
    handleUploadError,
    handleUploadResponse,
    showLargeUploadWarning
  } = uploadState;

  const {
    validationErrors,
    duplicateWarning,
    showDuplicateDetails,
    setShowDuplicateDetails,
    clearAllValidation,
    validateBeforeSubmit,
    handleDuplicateFiles,
    isSubmitDisabled,
    getSubmitButtonText
  } = validation;

  const {
    selectedFiles,
    poiFile,
    duplicateImages,
    handleFileChange,
    handlePOIFileChange,
    removeDuplicateImages,
    getFileValidationErrors,
    hasRequiredFiles
  } = fileManager;

  // Initialize hooks with useEffect
  useEffect(() => {
    projectManager.initializeFromUrl();
  }, []);

  const handleDeleteAllAndUpload = () => {
    validation.clearAllValidation();
    setDeleteAllAndUpload(true);
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      const syntheticEvent = {
        preventDefault: () => {},
        currentTarget: form,
        target: form,
        nativeEvent: new Event('submit'),
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'submit',
        _deleteAllMode: true,
      } as any;
      handleSubmit(syntheticEvent);
    }
  };



  const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProjectName(newName);

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      validation.clearAllValidation();
    }
  };





  const handleSubmit = async (
    event: FormEvent<HTMLFormElement> & {
      _overwriteMode?: boolean;
      _deleteAllMode?: boolean;
    }
  ) => {
    event.preventDefault();
    
    // Clear previous state
    uploadState.clearState();
    validation.clearAllValidation();

    // Validate before submission
    const isValid = validation.validateBeforeSubmit(
      projectManager.projectName,
      fileManager.hasRequiredFiles(),
      fileManager.getFileValidationErrors(),
      projectManager.validateProjectName
    );
    if (!isValid) {
      return;
    }

    uploadState.startUpload();

    try {
      let projectId: string;

      if (projectManager.isEditMode && projectManager.editingProjectId) {
        // Use existing project ID for editing
        projectId = projectManager.editingProjectId;
        await projectManager.updateProjectName(projectManager.editingProjectId);
      } else {
        // Create new project
        projectId = await projectManager.createProject();
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('projectName', projectManager.projectName.trim());

      // Handle CSV file
      if (fileManager.selectedFiles.csv) {
        formData.append('csv', fileManager.selectedFiles.csv);
      } else if (projectManager.isEditMode && projectManager.existingFiles.csv) {
        formData.append('existing_csv', projectManager.existingFiles.csv);
      }

      // Handle image files
      if (fileManager.selectedFiles.images.length > 0) {
        fileManager.selectedFiles.images.forEach(image => {
          formData.append('images', image);
        });
      } else if (projectManager.isEditMode && projectManager.existingFiles.images.length > 0) {
        projectManager.existingFiles.images.forEach(imageName => {
          formData.append('existing_images', imageName);
        });
      }

      if (uploadState.allowOverwrite || event._overwriteMode) {
        formData.append('overwrite', 'true');
      }

      if (uploadState.deleteAllAndUpload || event._deleteAllMode) {
        formData.append('deleteAll', 'true');
      }
      uploadState.setAllowOverwrite(false);

      // Show large upload warning if needed
      const totalFiles = fileManager.selectedFiles.images.length + (fileManager.selectedFiles.csv ? 1 : 0) + (fileManager.poiFile ? 1 : 0);
      uploadState.showLargeUploadWarning(totalFiles);

      // Create progress simulation
      const progressInterval = uploadState.createProgressInterval();

      // Upload files to the project
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      clearInterval(progressInterval);
      uploadState.updateProgress(100);

      const result = await uploadState.handleUploadResponse(response);
      
      // Clear session storage on successful upload
      try {
        sessionStorage.removeItem('uploadPageFiles');
        if (typeof window !== 'undefined') {
          delete (window as any).__uploadPageFiles;
        }
      } catch (error) {
        console.warn('Failed to clear stored files:', error);
      }
      
      fileManager.clearDuplicateImages();
    } catch (error: any) {
      uploadState.handleUploadError(error);
    } finally {
      uploadState.finishUpload(false, '');
    }
  };

  return (
    <div className={styles.container}>
      <Logo variant='default' position='absolute' />
      <div className={styles.content}>
        <h1 className={styles.title}>
          {projectManager.isEditMode ? 'Edit Project Data' : 'Upload Panorama Data'}
        </h1>

        <button
          onClick={projectManager.navigateBack}
          className={styles.backLink}
        >
          ← Back to Panorama Viewer
        </button>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor='projectName' className={styles.label}>
              Project Name:
            </label>
            <input
              type='text'
              id='projectName'
              name='projectName'
              value={projectManager.projectName}
              onChange={(e) => projectManager.setProjectName(e.target.value)}
              placeholder='Enter a name for your project'
              required
              className={`${styles.textInput} ${validation.validationErrors.some(error => error.includes('Project name')) ? styles.inputError : ''}`}
            />
            <div className={styles.inputHint}>
              {projectManager.isEditMode
                ? 'Update the name of your existing project.'
                : 'This will create a new project folder for your panorama data.'}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='csv' className={styles.label}>
              CSV File
              {projectManager.isEditMode && projectManager.existingFiles.csv
                ? ' (Optional - will replace existing)'
                : ''}
              :
            </label>
            {fileManager.selectedFiles.csv &&
              fileManager.selectedFiles.csv.name !== 'pano-poses.csv' && (
                <div className={styles.csvInstruction}>
                  <p>
                    Important: Your CSV file must be named exactly{' '}
                    <strong>"pano-poses.csv"</strong>
                  </p>
                </div>
              )}
            <input
              type='file'
              id='csv'
              name='csv'
              accept='.csv'
              required={!projectManager.isEditMode || !projectManager.existingFiles.csv}
              onChange={fileManager.handleFileChange}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='images' className={styles.label}>
              Panorama Images
              {projectManager.isEditMode && projectManager.existingFiles.images.length > 0
                ? ' (Optional - will add to existing)'
                : ''}
              :
            </label>
            <input
              type='file'
              id='images'
              name='images'
              accept='image/*'
              multiple
              required={!projectManager.isEditMode || projectManager.existingFiles.images.length === 0}
              onChange={fileManager.handleFileChange}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='poiFile' className={styles.label}>
              POI File (Optional):
            </label>
            <input
              type='file'
              id='poiFile'
              name='poiFile'
              accept='.json,.zip'
              onChange={fileManager.handlePOIFileChange}
              className={styles.fileInput}
            />
          </div>

          {projectManager.isEditMode &&
            (projectManager.existingFiles.csv ||
              projectManager.existingFiles.images.length > 0 ||
              projectManager.existingFiles.poi) && (
              <div className={styles.formGroup}>
                <div className={styles.fileList}>
                  <div className={styles.fileListHeader}>
                    <p className={styles.fileListTitle}>
                      Current Project Files
                    </p>
                    <button
                      type='button'
                      onClick={() => projectManager.setShowExistingFiles(!projectManager.showExistingFiles)}
                      className={styles.toggleButton}
                    >
                      {projectManager.showExistingFiles ? '▼ Hide' : '▶ Show'}
                    </button>
                  </div>
                  {projectManager.showExistingFiles && (
                    <ul className={styles.fileListItems}>
                      {projectManager.existingFiles.csv && <li>CSV: {projectManager.existingFiles.csv}</li>}
                      {projectManager.existingFiles.poi && <li>POI: {projectManager.existingFiles.poi}</li>}
                      {projectManager.existingFiles.images.map((imageName, index) => (
                        <li key={index}>Image: {imageName}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

          {/* File Summary */}
          {fileManager.hasRequiredFiles() && (
            <div className={styles.fileSummary}>
              <h4 className={styles.summaryTitle}>Upload Summary</h4>
              <div className={styles.summaryContent}>
                {fileManager.selectedFiles.csv && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryIcon}></span>
                    <span className={styles.summaryText}>
                      CSV: {fileManager.selectedFiles.csv.name} (
                      {Math.round(fileManager.selectedFiles.csv.size / 1024)} KB)
                    </span>
                  </div>
                )}
                {fileManager.selectedFiles.images.length > 0 && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryIcon}></span>
                    <span className={styles.summaryText}>
                      {fileManager.selectedFiles.images.length} image(s) (
                      {Math.round(
                        fileManager.selectedFiles.images.reduce(
                          (sum, file) => sum + file.size,
                          0
                        ) /
                          1024 /
                          1024
                      )}{' '}
                      MB total)
                    </span>
                  </div>
                )}
                {fileManager.poiFile && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryIcon}></span>
                    <span className={styles.summaryText}>
                      POI: {fileManager.poiFile.name} ({Math.round(fileManager.poiFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
                {fileManager.duplicateImages.length > 0 && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryIcon}></span>
                    <span className={styles.summaryText}>
                      {fileManager.duplicateImages.length} duplicate(s) detected
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type='submit'
            disabled={validation.isSubmitDisabled()}
            className={`${styles.submitButton} ${
              validation.validationErrors.length > 0 ? styles.submitButtonDisabled : ''
            }`}
          >
            {uploadState.isLoading && <span className={styles.loadingSpinner}></span>}
            {validation.getSubmitButtonText(uploadState.isLoading, projectManager.isEditMode)}
          </button>

          {uploadState.isLoading && uploadState.uploadProgress > 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span className={styles.progressTitle}>
                  {uploadState.getProgressMessage(uploadState.uploadProgress)}
                </span>
                <span className={styles.progressPercentage}>
                  {uploadState.uploadProgress < 100
                    ? `${Math.round(uploadState.uploadProgress)}%`
                    : '99%'}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadState.uploadProgress}%` }}
                ></div>
              </div>
              <div className={styles.progressDetails}>
                {uploadState.uploadProgress < 100 ? (
                  <span className={styles.progressSubtext}>
                    Please keep this page open while files are being
                    processed...
                  </span>
                ) : (
                  <span className={styles.progressSubtext}>
                    Almost done! Finalizing your panorama project...
                  </span>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className={`${styles.message} ${styles.messageError}`}>
            <div className={styles.errorHeader}>
              <h4>Please fix the following issues:</h4>
            </div>
            <ul className={styles.errorList}>
              {validationErrors.map((error, index) => (
                <li key={index} className={styles.errorItem}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicate Files Management */}
        {(duplicateImages.length > 0 || duplicateWarning.length > 0) && (
          <div className={`${styles.message} ${styles.messageWarning}`}>
            <div className={styles.duplicateHeader}>
              <h4>
                Duplicate Files Detected (
                {Math.max(duplicateImages.length, duplicateWarning.length)}{' '}
                files)
              </h4>
              <button
                type="button"
                onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
                className={styles.toggleDetailsButton}
              >
                {showDuplicateDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <div>
              <p className={styles.duplicateExplanation}>
                These files have the same names as existing files in your
                project:
              </p>
              {showDuplicateDetails && (
                <ul className={styles.duplicateList}>
                {duplicateImages.length > 0
                  ? duplicateImages.map((img, index) => (
                      <li key={index} className={styles.duplicateItem}>
                        <span className={styles.fileName}>{img.name}</span>
                        <span className={styles.fileSize}>
                          ({Math.round(img.size / 1024)} KB)
                        </span>
                      </li>
                    ))
                  : duplicateWarning.map((filename, index) => (
                      <li key={index} className={styles.duplicateItem}>
                        <span className={styles.fileName}>{filename}</span>
                      </li>
                    ))}
                </ul>
              )}

              <div className={styles.duplicateActions}>
                <p className={styles.actionText}>
                  <strong>Options:</strong>
                </p>
                <ul className={styles.actionList}>
                  <li>Rename the duplicate files and re-select them</li>
                  <li>Continue upload to replace existing files</li>
                  <li>
                    Remove all existing files and replace them with the new ones
                    provided
                  </li>
                </ul>
              </div>
              <div className={styles.duplicateActions}>
                {duplicateImages.length > 0 && (
                  <button
                    type='button'
                    onClick={fileManager.removeDuplicateImages}
                    className={styles.removeDuplicatesButton}
                  >
                    Remove Duplicates
                  </button>
                )}
                <button
                  onClick={e => {
                    e.preventDefault();
                    const form = document.querySelector(
                      'form'
                    ) as HTMLFormElement;
                    if (form) {
                      const syntheticEvent = {
                        preventDefault: () => {},
                        currentTarget: form,
                        target: form,
                        nativeEvent: new Event('submit'),
                        bubbles: true,
                        cancelable: true,
                        defaultPrevented: false,
                        eventPhase: 0,
                        isTrusted: true,
                        timeStamp: Date.now(),
                        type: 'submit',
                        _overwriteMode: true,
                      } as unknown as FormEvent<HTMLFormElement> & {
                        _overwriteMode: boolean;
                      };
                      handleSubmit(syntheticEvent);
                    }
                  }}
                  disabled={isLoading}
                  className={styles.overwriteButton}
                >
                  {isLoading && <span className={styles.loadingSpinner}></span>}
                  {isLoading ? 'Overwriting...' : 'Upload and Overwrite'}
                </button>
                <button
                  type='button'
                  onClick={handleDeleteAllAndUpload}
                  className={styles.deleteAllButton}
                >
                  Delete All & Upload
                </button>
                  </div>
            </div>
          </div>
        )}

        {message && duplicateWarning.length === 0 && (
          <div
            className={`${styles.message} ${
              message.includes('failed') || message.includes('error')
                ? styles.messageError
                : styles.messageSuccess
            }`}
          >
            {projectManager.getProjectStatusMessage() || message}
          </div>
        )}

        {uploadSuccess && (
          <div className={styles.successActions}>
            {createdProjectId ? (
              <Link
                href={`/${createdProjectId}`}
                className={styles.viewPanoramasButton}
              >
                View Project Panoramas
              </Link>
            ) : (
              <Link href='/' className={styles.viewPanoramasButton}>
                View Panoramas
              </Link>
            )}
          </div>
        )}

        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>
            {isEditMode ? 'Update Instructions:' : 'Instructions:'}
          </h3>
          <ol className={styles.instructionsList}>
            {isEditMode ? (
              <>
                <li>
                  (Optional) Select a new pano-poses.csv file to replace
                  existing panorama position data
                </li>
                <li>
                  (Optional) Select additional panorama images (JPG or PNG
                  format) to add to your project
                </li>
                <li>
                  (Optional) Select a POI file (JSON format) to update points of
                  interest in your panoramas
                </li>
                <li>
                  Click "Update Project" to upload new files and regenerate the
                  configuration
                </li>
                <li>
                  Once complete, return to the main viewer to see your updated
                  panoramas
                </li>
              </>
            ) : (
              <>
                <li>
                  Select your pano-poses.csv file containing panorama position
                  data
                </li>
                <li>Select one or more panorama images (JPG or PNG format)</li>
                <li>
                  (Optional) Select a POI file (JSON format) to add points of
                  interest to your panoramas
                </li>
                <li>
                  Click "Upload and Generate" to upload files and automatically
                  generate the configuration
                </li>
                <li>
                  Once complete, return to the main viewer to see your panoramas
                </li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
