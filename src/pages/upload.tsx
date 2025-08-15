import { FormEvent, ChangeEvent, useEffect, useState } from "react";
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
import PageLoadingComponent from "@/components/ui/PageLoadingComponent";

export default function Upload() {
  // Initialize authentication
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Add state for CSV validation loading
  const [csvValidating, setCsvValidating] = useState(false);

  // Add state for file input reset key to force re-render when same file is selected
  const [fileInputKey, setFileInputKey] = useState(0);

  // Initialize custom hooks
  const projectManager = useProjectManager();
  const uploadState = useUploadState();
  const validation = useValidation();
  const fileManager = useFileManager(
    projectManager.isEditMode,
    projectManager.existingFiles
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
    // This will update the project status message in the UI
  }, [projectManager.existingFiles]);

  // Enhanced CSV validation function
  const validateCSVContent = async (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const errors: string[] = [];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;

          if (!content || content.trim() === "") {
            errors.push("CSV file is empty or could not be read.");
            resolve(errors);
            return;
          }

          const lines = content
            .split("\n")
            .filter((line) => line.trim() !== "");

          if (lines.length < 2) {
            errors.push(
              "CSV file must contain at least a header row and one data row."
            );
            resolve(errors);
            return;
          }

          const header = lines[0].toLowerCase().trim();

          // Detect delimiter (comma or semicolon)
          const delimiter =
            header.includes(";") &&
            header.split(";").length > header.split(",").length
              ? ";"
              : ",";

          const headerColumns = header
            .split(delimiter)
            .map((col) => col.trim().replace(/"/g, "").replace(/^#\s*/, "")) // Remove leading # and whitespace
            .filter((col) => col.length > 0); // Remove empty columns

          const requiredColumns = [
            "filename",
            "pano_pos_x",
            "pano_pos_y",
            "pano_pos_z",
            "pano_ori_w",
            "pano_ori_x",
            "pano_ori_y",
            "pano_ori_z",
          ];

          const missingColumns = requiredColumns.filter(
            (col) => !headerColumns.includes(col)
          );

          if (missingColumns.length > 0) {
            const errorMsg = `CSV file is missing required columns: ${missingColumns.join(", ")}. Please ensure your CSV includes position (pano_pos_x, pano_pos_y, pano_pos_z) and orientation (pano_ori_w, pano_ori_x, pano_ori_y, pano_ori_z) columns.`;
            errors.push(errorMsg);
          }

          // Validate data rows
          const dataLines = lines.slice(1);
          const validDataLines = dataLines.filter((line) => line.trim() !== "");

          if (validDataLines.length === 0) {
            errors.push("CSV file contains headers but no data rows.");
            resolve(errors);
            return;
          }

          // Validate numeric columns
          let rowErrorCount = 0;
          const maxRowErrorsToReport = 3;

          validDataLines.forEach((line, index) => {
            const columns = line.split(delimiter).map((col) => col.trim());

            // Validate numeric columns for first few rows
            if (index < 5 && rowErrorCount < maxRowErrorsToReport) {
              const numericColumns = [
                "pano_pos_x",
                "pano_pos_y",
                "pano_pos_z",
                "pano_ori_w",
                "pano_ori_x",
                "pano_ori_y",
                "pano_ori_z",
              ];

              numericColumns.forEach((colName) => {
                const colIndex = headerColumns.indexOf(colName);
                if (colIndex !== -1 && columns[colIndex]) {
                  const value = columns[colIndex].replace(/"/g, "");
                  if (value && isNaN(parseFloat(value))) {
                    errors.push(
                      `Row ${index + 2}, column "${colName}": "${value}" is not a valid number.`
                    );
                    rowErrorCount++;
                  }
                }
              });
            }
          });

          if (rowErrorCount > maxRowErrorsToReport) {
            errors.push(
              `... and ${rowErrorCount - maxRowErrorsToReport} more row validation errors.`
            );
          }

          resolve(errors);
        } catch (parseError) {
          errors.push(
            "Error reading CSV file. Please ensure it's a valid CSV format."
          );
          resolve(errors);
        }
      };

      reader.onerror = () => {
        errors.push(
          "Failed to read CSV file. Please try selecting the file again."
        );
        resolve(errors);
      };

      reader.readAsText(file);
    });
  };

  const handleProjectNameChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newProjectName = event.target.value;
    setProjectName(newProjectName);

    // Collect all validation errors before setting them
    let allErrors: string[] = [];

    // Get current file validation errors
    const fileErrors = fileManager.getFileValidationErrors();
    allErrors.push(...fileErrors);

    // Add CSV content validation if CSV file exists
    if (fileManager.selectedFiles.csv) {
      try {
        const csvContentErrors = await validateCSVContent(
          fileManager.selectedFiles.csv
        );
        allErrors.push(...csvContentErrors);
      } catch (error) {
        console.error(
          "CSV validation error in handleProjectNameChange:",
          error
        );
        allErrors.push(
          "An error occurred while validating the CSV file. Please try again."
        );
      }
    }

    // Get project name validation errors
    const projectNameErrors =
      projectManager.validateProjectName(newProjectName);
    allErrors.push(...projectNameErrors);

    // Check for duplicate project names (only if basic validation passes and name has changed in edit mode)
    if (projectNameErrors.length === 0 && newProjectName.trim() && 
        (!projectManager.isEditMode || projectManager.hasProjectNameChanged())) {
      try {
        const checkResponse = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: newProjectName.trim(),
            checkOnly: true, // Add a flag to only check, not create
          }),
        });

        if (!checkResponse.ok && checkResponse.status === 409) {
          allErrors.push(
            `Project name "${newProjectName.trim()}" already exists. Please choose a different name or edit the existing project.`
          );
        }
      } catch (error) {
        // Silently ignore network errors for real-time validation
        console.warn("Failed to check duplicate project name:", error);
      }
    }

    // Set the complete error list without clearing existing errors first
    validation.setValidationErrorsFromArray(allErrors);
  };

  // Helper function to reset validation and file input (only call when explicitly needed)
  const resetValidationAndFileInput = () => {
    validation.clearAllValidation();

    // Clear file input values to prevent stale file references
    const csvInput = document.getElementById("csv") as HTMLInputElement;
    if (csvInput) {
      csvInput.value = "";
    }

    // Reset file manager state
    fileManager.setSelectedFiles((prev) => ({ ...prev, csv: null }));

    // Force re-render of file input to allow same file selection
    setFileInputKey((prev) => prev + 1);
  };

  const handleFileChangeWithValidation = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // Call the original file handler first
    fileManager.handleFileChange(event);

    // Collect all validation errors before setting them
    let allErrors: string[] = [];

    // Always validate CSV file (either fresh file or existing state)
    if (
      event.target.name === "csv" &&
      event.target.files &&
      event.target.files[0]
    ) {
      // For CSV files being changed, validate the fresh file
      const freshCsvFile = event.target.files[0];
      const csvFileErrors = fileManager.validateCSVFile(freshCsvFile);
      allErrors.push(...csvFileErrors);
    } else if (fileManager.selectedFiles.csv) {
      // If CSV exists but we're not changing it, validate existing CSV
      const csvFileErrors = fileManager.validateCSVFile(
        fileManager.selectedFiles.csv
      );
      allErrors.push(...csvFileErrors);
    }

    // Always validate image files (either fresh files or existing state)
    if (
      event.target.name === "images" &&
      event.target.files &&
      event.target.files.length > 0
    ) {
      // For image files being changed, validate the fresh files
      const imageFiles = Array.from(event.target.files);
      const imageErrors = fileManager.validateImageFiles(imageFiles);
      allErrors.push(...imageErrors);
    } else if (fileManager.selectedFiles.images.length > 0) {
      // If images exist but we're not changing them, validate existing images
      const imageErrors = fileManager.validateImageFiles(
        fileManager.selectedFiles.images
      );
      allErrors.push(...imageErrors);
    }

    // Validate CSV content asynchronously (for fresh CSV files or existing CSV when other inputs change)
    let csvFileToValidate: File | null = null;
    if (
      event.target.name === "csv" &&
      event.target.files &&
      event.target.files[0]
    ) {
      // Fresh CSV file being uploaded
      csvFileToValidate = event.target.files[0];
    } else if (fileManager.selectedFiles.csv) {
      // Existing CSV file when other inputs change
      csvFileToValidate = fileManager.selectedFiles.csv;
    }

    if (csvFileToValidate) {
      // Set loading state
      setCsvValidating(true);

      try {
        // Validate CSV content
        const csvContentErrors = await validateCSVContent(csvFileToValidate);
        allErrors.push(...csvContentErrors);
      } catch (error) {
        console.error("CSV validation error:", error);
        allErrors.push(
          "An error occurred while validating the CSV file. Please try again."
        );
      } finally {
        setCsvValidating(false);
      }
    }

    // Get project name validation errors
    const projectNameErrors = projectManager.validateProjectName(projectName);
    allErrors.push(...projectNameErrors);

    // Check for duplicate project name if project name is valid and name has changed in edit mode
    if (projectName.trim() && projectNameErrors.length === 0 && 
        (!projectManager.isEditMode || projectManager.hasProjectNameChanged())) {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: projectName.trim(),
            checkOnly: true,
          }),
        });

        if (response.status === 409) {
          allErrors.push(
            `Project name "${projectName.trim()}" already exists. Please choose a different name or edit the existing project.`
          );
        }
      } catch (error) {
        console.error("Error checking project name:", error);
      }
    }

    // Set the complete error list
    validation.setValidationErrorsFromArray(allErrors);

    // Note: Don't reset file input key on successful validation as it clears the input
    // The key reset should only happen when manually clearing or when there are persistent errors
  };

  const handlePOIFileChangeWithValidation = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // Call the original POI file handler
    fileManager.handlePOIFileChange(event);

    // Collect all validation errors
    let allErrors: string[] = [];

    // Get current file validation errors
    const fileErrors = fileManager.getFileValidationErrors();
    allErrors.push(...fileErrors);

    // Add CSV content validation if CSV file exists
    if (fileManager.selectedFiles.csv) {
      try {
        const csvContentErrors = await validateCSVContent(
          fileManager.selectedFiles.csv
        );
        allErrors.push(...csvContentErrors);
      } catch (error) {
        console.error(
          "CSV validation error in handlePOIFileChangeWithValidation:",
          error
        );
        allErrors.push(
          "An error occurred while validating the CSV file. Please try again."
        );
      }
    }

    // Get project name validation errors
    const projectNameErrors = projectManager.validateProjectName(projectName);
    allErrors.push(...projectNameErrors);

    // Check for duplicate project name if project name is valid and name has changed in edit mode
    if (projectName.trim() && projectNameErrors.length === 0 && 
        (!projectManager.isEditMode || projectManager.hasProjectNameChanged())) {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: projectName.trim(),
            checkOnly: true,
          }),
        });

        if (response.status === 409) {
          allErrors.push(
            `Project name "${projectName.trim()}" already exists. Please choose a different name or edit the existing project.`
          );
        }
      } catch (error) {
        console.error("Error checking project name:", error);
      }
    }

    // Set the complete error list without clearing existing errors first
    validation.setValidationErrorsFromArray(allErrors);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement> & {
      _overwriteMode?: boolean;
      _deleteAllMode?: boolean;
    }
  ) => {
    event.preventDefault();

    // Prevent submission if CSV is still being validated
    if (csvValidating) {
      uploadState.setMessage(
        "Please wait for CSV validation to complete before submitting."
      );
      return;
    }

    // Clear previous state
    uploadState.clearState();
    validation.clearAllValidation();

    // Re-validate CSV content if present before submission
    let finalFileErrors = fileManager.getFileValidationErrors();

    if (fileManager.selectedFiles.csv) {
      setCsvValidating(true);
      try {
        const csvContentErrors = await validateCSVContent(
          fileManager.selectedFiles.csv
        );
        finalFileErrors.push(...csvContentErrors);
      } catch (error) {
        finalFileErrors.push(
          "CSV validation failed. Please check your file and try again."
        );
      } finally {
        setCsvValidating(false);
      }
    }

    // Validate before submission with updated errors
    const isValid = await validation.validateBeforeSubmit(
      projectManager.projectName,
      fileManager.hasRequiredFiles(),
      finalFileErrors,
      projectManager.validateProjectName,
      fileManager.selectedFiles.csv,
      projectManager.isEditMode,
      projectManager.hasProjectNameChanged()
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
        // Update project name and get the new project ID
        projectId = await projectManager.updateProjectName(
          projectManager.editingProjectId
        );
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
      const hasDuplicates =
        duplicateImages.length > 0 || duplicateWarning.length > 0;

      if (uploadState.allowOverwrite || event._overwriteMode) {
        formData.append("overwrite", "true");
      }

      if (
        uploadState.deleteAllAndUpload ||
        event._deleteAllMode ||
        hasDuplicates
      ) {
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
      const progressInterval = uploadState.createProgressInterval();

      // Upload files to the project
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/upload`,
        {
          method: "POST",
          body: formData,
        }
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
      if (projectManager.isEditMode) {
        // Use the correct project ID (which might have changed during the update)
        await projectManager.loadProjectData(projectId);

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
        window.dispatchEvent(
          new CustomEvent("panorama-cache-refresh", {
            detail: { projectId },
          })
        );
      }
    } catch (error: any) {
      // Handle project creation/update errors specifically
      if (error.message && error.message.includes("already exists")) {
        // Add the error to validation system for proper display
        validation.setValidationErrorsFromArray([error.message]);
        uploadState.finishUpload(false, "");
      } else {
        // Handle other upload errors normally
        uploadState.handleUploadError(error);
        uploadState.finishUpload(false, "");
      }
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <PageLoadingComponent headerText="Checking Authentication" />;
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
        {user?.role === "admin" && (
          <Link href="/admin/users" className={styles.adminLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 11L19 13L23 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.adminText}>Admin</span>
            <span className={styles.adminTextHover}>Manage Users</span>
          </Link>
        )}
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
              onChange={handleProjectNameChange}
              placeholder="Enter a name for your project"
              required
              className={`${styles.textInput} ${validation.validationErrors.some((error) => error.includes("Project name") || error.includes("already exists")) ? styles.inputError : ""}`}
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

            <input
              key={`csv-${fileInputKey}`}
              type="file"
              id="csv"
              name="csv"
              accept=".csv"
              required={
                !projectManager.isEditMode || !projectManager.existingFiles.csv
              }
              onChange={handleFileChangeWithValidation}
              className={`${styles.fileInput} ${validation.validationErrors.some((error) => error.includes("CSV")) ? styles.inputError : ""}`}
              disabled={csvValidating}
            />
            {csvValidating && (
              <div className={styles.validationStatus}>
                <span className={styles.loadingSpinner}></span>
                <span>Validating CSV content...</span>
              </div>
            )}
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
              onChange={handleFileChangeWithValidation}
              className={`${styles.fileInput} ${validation.validationErrors.some((error) => error.includes("Image")) ? styles.inputError : ""}`}
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
              onChange={handlePOIFileChangeWithValidation}
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
                          !projectManager.showExistingFiles
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
                        )
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
                          0
                        ) /
                          1024 /
                          1024
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
            disabled={validation.isSubmitDisabled() || csvValidating}
            className={`${styles.submitButton} ${
              validation.validationErrors.length > 0 || csvValidating
                ? styles.submitButtonDisabled
                : ""
            }`}
          >
            {(uploadState.isLoading || csvValidating) && (
              <span className={styles.loadingSpinner}></span>
            )}
            {csvValidating
              ? "Validating CSV..."
              : validation.getSubmitButtonText(
                  uploadState.isLoading,
                  projectManager.isEditMode
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
