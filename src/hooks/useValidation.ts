import { useState } from "react";

export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string[]>([]);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);

  const clearValidationErrors = () => {
    setValidationErrors([]);
  };

  const clearDuplicateWarning = () => {
    setDuplicateWarning([]);
  };

  const clearAllValidation = () => {
    clearValidationErrors();
    clearDuplicateWarning();
  };

  const addValidationError = (error: string) => {
    setValidationErrors((prev) => [...prev, error]);
  };

  const addValidationErrors = (errors: string[]) => {
    setValidationErrors((prev) => [...prev, ...errors]);
  };

  const setValidationErrorsFromArray = (errors: string[]) => {
    setValidationErrors(errors);
  };

  const hasValidationErrors = (): boolean => {
    return validationErrors.length > 0;
  };

  const hasDuplicateWarnings = (): boolean => {
    return duplicateWarning.length > 0;
  };

  const validateBeforeSubmit = (
    projectName: string,
    hasRequiredFiles: boolean,
    fileValidationErrors: string[],
    projectNameValidator: (name: string) => string[],
    csvFile?: File,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const allErrors: string[] = [];

      // Validate project name
      const nameErrors = projectNameValidator(projectName);
      allErrors.push(...nameErrors);

      // Validate required files
      if (!hasRequiredFiles) {
        allErrors.push(
          "Please select required files (CSV and at least one image).",
        );
      }

      // Add file validation errors
      allErrors.push(...fileValidationErrors);

      // Validate CSV file content if provided
      if (csvFile) {
        validateCSVContent(csvFile, allErrors).then(() => {
          setValidationErrors(allErrors);
          resolve(allErrors.length === 0);
        });
      } else {
        setValidationErrors(allErrors);
        resolve(allErrors.length === 0);
      }
    });
  };

  const validateCSVContent = (
    csvFile: File,
    errors: string[],
  ): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const lines = content.split("\n");
          if (lines.length > 0) {
            const header = lines[0].toLowerCase();
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
              (col) => !header.includes(col),
            );
            if (missingColumns.length > 0) {
              errors.push(
                `CSV file is missing required columns: ${missingColumns.join(", ")}. Please ensure your CSV includes position (pano_pos_x, pano_pos_y, pano_pos_z) and orientation (pano_ori_w, pano_ori_x, pano_ori_y, pano_ori_z) columns.`,
              );
            }
          }
        }
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsText(csvFile);
    });
  };

  const handleDuplicateFiles = (duplicates: string[]) => {
    setDuplicateWarning(duplicates);
  };

  const handleUploadError = (status: number, errorData: any) => {
    if (status === 409 && errorData.duplicates) {
      setDuplicateWarning(errorData.duplicates);
      return errorData.message;
    } else if (status === 409) {
      setValidationErrors([
        `Error: Project name "${errorData.projectName || "unknown"}" already exists`,
        "Please choose a different name or edit the existing project",
      ]);
      return null;
    } else if (status === 400) {
      setValidationErrors([
        "Error: Invalid project name",
        "Project names can only contain letters, numbers, spaces, hyphens, and underscores",
      ]);
      return null;
    }

    return `Upload failed: ${errorData.error || errorData.message || "Unknown error"}`;
  };

  const getErrorSummary = (): string => {
    if (validationErrors.length === 0) return "";

    return `Please fix ${validationErrors.length} validation error${validationErrors.length > 1 ? "s" : ""}`;
  };

  const getDuplicateSummary = (duplicateImagesCount: number): string => {
    const totalDuplicates = Math.max(
      duplicateImagesCount,
      duplicateWarning.length,
    );
    if (totalDuplicates === 0) return "";

    return `${totalDuplicates} duplicate file${totalDuplicates > 1 ? "s" : ""} detected`;
  };

  const isSubmitDisabled = (): boolean => {
    return hasValidationErrors();
  };

  const getSubmitButtonText = (
    isLoading: boolean,
    isEditMode: boolean,
  ): string => {
    if (hasValidationErrors() && !isLoading) {
      return "Fix errors to continue";
    }

    if (isLoading) {
      return isEditMode ? "Updating Project..." : "Uploading and Generating...";
    }

    return isEditMode ? "Update Project" : "Upload and Generate";
  };

  return {
    validationErrors,
    setValidationErrors,
    duplicateWarning,
    setDuplicateWarning,
    showDuplicateDetails,
    setShowDuplicateDetails,
    clearValidationErrors,
    clearDuplicateWarning,
    clearAllValidation,
    addValidationError,
    addValidationErrors,
    setValidationErrorsFromArray,
    hasValidationErrors,
    hasDuplicateWarnings,
    validateBeforeSubmit,
    handleDuplicateFiles,
    handleUploadError,
    getErrorSummary,
    getDuplicateSummary,
    isSubmitDisabled,
    getSubmitButtonText,
  };
};
