import { FormEvent, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/Upload.module.css";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/ui/LogoutButton";
import { useFileManager } from "@/hooks/useFileManager";
import { useUploadState } from "@/hooks/useUploadState";
import { useProjectManager } from "@/hooks/useProjectManager";
import { useValidation } from "@/hooks/useValidation";
import { useAuth } from "@/contexts/AuthContext";
import { useUploadCacheRefresh } from "@/hooks/useCacheRefresh";

export default function Upload() {
  // Initialize authentication
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Initialize custom hooks
  const projectManager = useProjectManager();
  const uploadState = useUploadState();
  const validation = useValidation();
  const fileManager = useFileManager(
    projectManager.isEditMode,
    projectManager.existingFiles,
  );
  const { handleUploadComplete } = useUploadCacheRefresh();

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
    getProjectStatusMessage,
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
    showLargeUploadWarning,
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
    getSubmitButtonText,
  } = validation;

  const {
    selectedFiles,
    poiFile,
    duplicateImages,
    handleFileChange,
    handlePOIFileChange,
    removeDuplicateImages,
    getFileValidationErrors,
    hasRequiredFiles,
  } = fileManager;

  // Initialize hooks with useEffect
  useEffect(() => {
    projectManager.initializeFromUrl();
  }, []);

  // Update UI when existingFiles changes
  useEffect(() => {
    // Force UI update when existingFiles changes
    console.log(
      "ExistingFiles changed in state:",
      projectManager.existingFiles,
    );
    // This will update the project status message in the UI
  }, [projectManager.existingFiles]);



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
    },
  ) => {
    event.preventDefault();

    // Clear previous state
    uploadState.clearState();
    validation.clearAllValidation();

    // Validate before submission
    const isValid = await validation.validateBeforeSubmit(
      projectManager.projectName,
      fileManager.hasRequiredFiles(),
      fileManager.getFileValidationErrors(),
      projectManager.validateProjectName,
      fileManager.selectedFiles.csv,
    );
    if (!isValid) {
      return;
    }

    uploadState.startUpload();

    // Declare progress interval variable outside try block for catch block access
    let progressInterval: NodeJS.Timeout;

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
      formData.append("projectName", projectManager.projectName.trim());

      // Handle CSV file
      if (fileManager.selectedFiles.csv) {
        formData.append("csv", fileManager.selectedFiles.csv);
      } else if (
        projectManager.isEditMode &&
        projectManager.existingFiles.csv
      ) {
        formData.append("existing_csv", projectManager.existingFiles.csv);
      }

      // Handle image files
      if (fileManager.selectedFiles.images.length > 0) {
        fileManager.selectedFiles.images.forEach((image) => {
          formData.append("images", image);
        });
      } else if (
        projectManager.isEditMode &&
        projectManager.existingFiles.images.length > 0
      ) {
        projectManager.existingFiles.images.forEach((imageName) => {
          formData.append("existing_images", imageName);
        });
      }

      // Handle POI file
      if (fileManager.poiFile) {
        formData.append("poiFile", fileManager.poiFile);
      }

      // Always use delete all mode when duplicates are detected
      const hasDuplicates = duplicateImages.length > 0 || duplicateWarning.length > 0;
      
      if (uploadState.allowOverwrite || event._overwriteMode) {
        formData.append("overwrite", "true");
      }

      if (uploadState.deleteAllAndUpload || event._deleteAllMode || hasDuplicates) {
        formData.append("deleteAll", "true");
      }
      uploadState.setAllowOverwrite(false);

      // Show large upload warning if needed
      const totalFiles =
        fileManager.selectedFiles.images.length +
        (fileManager.selectedFiles.csv ? 1 : 0) +
        (fileManager.poiFile ? 1 : 0);
      uploadState.showLargeUploadWarning(totalFiles);

      // Create progress simulation
      progressInterval = uploadState.createProgressInterval();

      // Upload files to the project
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      clearInterval(progressInterval);
      uploadState.updateProgress(100);

      const result = await uploadState.handleUploadResponse(response);

      // Clear session storage on successful upload
      try {
        sessionStorage.removeItem("uploadPageFiles");
        if (typeof window !== "undefined") {
          delete (window as any).__uploadPageFiles;
        }
      } catch (error) {
        console.warn("Failed to clear stored files:", error);
      }

      fileManager.clearDuplicateImages();

      // Refresh project data to update the UI with new file information
      if (projectManager.isEditMode && projectManager.editingProjectId) {
        console.log(
          "Refreshing project data after successful upload for project:",
          projectManager.editingProjectId,
        );
        await projectManager.loadProjectData(projectManager.editingProjectId);
        console.log(
          "Project data refreshed, current files:",
          projectManager.existingFiles,
        );

        // Force UI update by setting a message that includes the updated file information
        const updatedStatusMessage = projectManager.getProjectStatusMessage();
        uploadState.setMessage(updatedStatusMessage);
      }

      // Set success state with appropriate message
      const successMessage = projectManager.isEditMode
        ? "Project updated successfully!"
        : "Project created successfully!";
      uploadState.finishUpload(true, successMessage);
      
      // Trigger cache refresh for the updated project
      if (projectManager.isEditMode && projectId) {
        handleUploadComplete(projectId);
        // Dispatch cache refresh event for immediate UI updates
        window.dispatchEvent(new CustomEvent('panorama-cache-refresh', {
          detail: { projectId }
        }));
      }
    } catch (error: any) {
      // Clear progress interval immediately to stop any ongoing progress updates
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      // Immediately reset loading state to prevent UI from getting stuck
      uploadState.setIsLoading(false);
      uploadState.setUploadProgress(0);
      
      // Handle specific error types from handleUploadResponse
      if (error.status && error.data) {
        // This is a structured error from handleUploadResponse
        const errorMessage = validation.handleUploadError(error.status, error.data);
        // Set message if one is returned, but validation errors are set regardless
        if (errorMessage) {
          uploadState.setMessage(errorMessage);
        }
        // For 409 errors, validation errors are set in validation state and will be displayed
      } else {
        // Handle other types of errors (network, etc.)
        uploadState.handleUploadError(error);
      }
      
      // Ensure upload state is properly finished
      uploadState.finishUpload(false, "");
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.authLoadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDeniedContent}>
          <h1>Access Denied</h1>
          <p>You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Logo variant="default" position="absolute" />
      <div className={styles.logoutContainer}>
        <LogoutButton variant="minimal" />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {projectManager.isEditMode
            ? "Edit Project Data"
            : "Upload Panorama Data"}
        </h1>

        <button
          onClick={projectManager.navigateBack}
          className={styles.backLink}
        >
          ← Back to Panorama Viewer
        </button>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputHint}>
            {projectManager.isEditMode
              ? "Update the name of your existing project."
              : "This will create a new project folder for your panorama data."}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="projectName" className={styles.label}>
              Project Name:
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={projectManager.projectName}
              onChange={(e) => projectManager.setProjectName(e.target.value)}
              placeholder="Enter a name for your project"
              required
              className={`${styles.textInput} ${validation.validationErrors.some((error) => error.includes("Project name")) ? styles.inputError : ""}`}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="csv" className={styles.label}>
              CSV File
              {projectManager.isEditMode && projectManager.existingFiles.csv
                ? " (Optional - will replace existing)"
                : ""}
              :
            </label>
            {fileManager.selectedFiles.csv &&
              fileManager.selectedFiles.csv.name !== "pano-poses.csv" && (
                <div className={styles.csvInstruction}>
                  <p>
                    Important: Your CSV file must be named exactly{" "}
                    <strong>&quot;pano-poses.csv&quot;</strong>
                  </p>
                </div>
              )}
            <input
              type="file"
              id="csv"
              name="csv"
              accept=".csv"
              required={
                !projectManager.isEditMode || !projectManager.existingFiles.csv
              }
              onChange={fileManager.handleFileChange}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="images" className={styles.label}>
              Panorama Images
              {projectManager.isEditMode &&
              projectManager.existingFiles.images.length > 0
                ? " (Optional - will add to existing)"
                : ""}
              :
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              required={
                !projectManager.isEditMode ||
                projectManager.existingFiles.images.length === 0
              }
              onChange={fileManager.handleFileChange}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="poiFile" className={styles.label}>
              POI File (Optional):
            </label>
            <input
              type="file"
              id="poiFile"
              name="poiFile"
              accept=".json,.zip"
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
                      type="button"
                      onClick={() =>
                        projectManager.setShowExistingFiles(
                          !projectManager.showExistingFiles,
                        )
                      }
                      className={styles.toggleButton}
                    >
                      {projectManager.showExistingFiles ? "▼ Hide" : "▶ Show"}
                    </button>
                  </div>
                  {projectManager.showExistingFiles && (
                    <ul className={styles.fileListItems}>
                      {projectManager.existingFiles.csv && (
                        <li>CSV: {projectManager.existingFiles.csv}</li>
                      )}
                      {projectManager.existingFiles.poi && (
                        <li>POI: {projectManager.existingFiles.poi}</li>
                      )}
                      {projectManager.existingFiles.images.map(
                        (imageName, index) => (
                          <li key={index}>Image: {imageName}</li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}

          {/* File Summary */}
          {fileManager.hasRequiredFiles() && (
            <div className={styles.fileSummary}>
              <h4 className={styles.summaryTitle}>
                {projectManager.isEditMode
                  ? "Update Summary"
                  : "Upload Summary"}
              </h4>
              <div className={styles.summaryContent}>
                {fileManager.selectedFiles.csv && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryIcon}></span>
                    <span className={styles.summaryText}>
                      CSV: {fileManager.selectedFiles.csv.name} (
                      {Math.round(fileManager.selectedFiles.csv.size / 1024)}{" "}
                      KB)
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
                          0,
                        ) /
                          1024 /
                          1024,
                      )}{" "}
                      MB total)
                    </span>
                  </div>
                )}
                {fileManager.poiFile && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryIcon}></span>
                    <span className={styles.summaryText}>
                      POI: {fileManager.poiFile.name} (
                      {Math.round(fileManager.poiFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}



          <button
            type="submit"
            disabled={validation.isSubmitDisabled()}
            className={`${styles.submitButton} ${
              validation.validationErrors.length > 0
                ? styles.submitButtonDisabled
                : ""
            }`}
          >
            {uploadState.isLoading && (
              <span className={styles.loadingSpinner}></span>
            )}
            {validation.getSubmitButtonText(
              uploadState.isLoading,
              projectManager.isEditMode,
            )}
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
                    : "99%"}
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



        {(message || uploadSuccess) && (
          <div
            className={`${styles.message} ${
              message &&
              (message.includes("failed") || message.includes("error"))
                ? styles.messageError
                : styles.messageSuccess
            }`}
          >
            {uploadSuccess
              ? projectManager.getProjectStatusMessage() || message
              : message}
          </div>
        )}

        {uploadSuccess && (
          <div className={styles.successActions}>
            {createdProjectId || editingProjectId ? (
              <Link
                href={`/${createdProjectId || editingProjectId}`}
                className={styles.viewPanoramasButton}
              >
                View Project Panoramas
              </Link>
            ) : (
              <Link href="/" className={styles.viewPanoramasButton}>
                View Panoramas
              </Link>
            )}
          </div>
        )}

        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>
            {isEditMode ? "Update Instructions:" : "Instructions:"}
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
                  Click &quot;Update Project&quot; to upload new files and
                  regenerate the configuration
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
                  Click &quot;Upload and Generate&quot; to upload files and
                  automatically generate the configuration
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
