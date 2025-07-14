import { useState } from 'react';

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
    setValidationErrors(prev => [...prev, error]);
  };

  const addValidationErrors = (errors: string[]) => {
    setValidationErrors(prev => [...prev, ...errors]);
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
    projectNameValidator: (name: string) => string[]
  ): boolean => {
    const allErrors: string[] = [];

    // Validate project name
    const nameErrors = projectNameValidator(projectName);
    allErrors.push(...nameErrors);

    // Validate required files
    if (!hasRequiredFiles) {
      allErrors.push('Please select required files (CSV and at least one image).');
    }

    // Add file validation errors
    allErrors.push(...fileValidationErrors);

    // Set all validation errors
    setValidationErrors(allErrors);

    return allErrors.length === 0;
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
        `Error: Project name "${errorData.projectName || 'unknown'}" already exists`,
        'Please choose a different name or edit the existing project',
      ]);
      return null;
    } else if (status === 400) {
      setValidationErrors([
        'Error: Invalid project name',
        'Project names can only contain letters, numbers, spaces, hyphens, and underscores',
      ]);
      return null;
    }
    
    return `Upload failed: ${errorData.error || errorData.message || 'Unknown error'}`;
  };

  const getErrorSummary = (): string => {
    if (validationErrors.length === 0) return '';
    
    return `Please fix ${validationErrors.length} validation error${validationErrors.length > 1 ? 's' : ''}`;
  };

  const getDuplicateSummary = (duplicateImagesCount: number): string => {
    const totalDuplicates = Math.max(duplicateImagesCount, duplicateWarning.length);
    if (totalDuplicates === 0) return '';
    
    return `${totalDuplicates} duplicate file${totalDuplicates > 1 ? 's' : ''} detected`;
  };

  const isSubmitDisabled = (): boolean => {
    return hasValidationErrors();
  };

  const getSubmitButtonText = (isLoading: boolean, isEditMode: boolean): string => {
    if (hasValidationErrors() && !isLoading) {
      return 'Fix errors to continue';
    }
    
    if (isLoading) {
      return isEditMode ? 'Updating Project...' : 'Uploading and Generating...';
    }
    
    return isEditMode ? 'Update Project' : 'Upload and Generate';
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
    getSubmitButtonText
  };
};