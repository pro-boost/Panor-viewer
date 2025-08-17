import { useState, ChangeEvent } from "react";

interface SelectedFiles {
  csv: File | null;
  images: File[];
}

interface DuplicateImage {
  name: string;
  size: number;
  lastModified: number;
}

interface ExistingFiles {
  csv: string | null;
  images: string[];
  poi: string | null;
}

export const useFileManager = (
  isEditMode: boolean,
  existingFiles: ExistingFiles,
) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({
    csv: null,
    images: [],
  });
  const [poiFile, setPOIFile] = useState<File | null>(null);
  const [duplicateImages, setDuplicateImages] = useState<DuplicateImage[]>([]);

  // Validation functions
  const validateCSVFile = (file: File): string[] => {
    const errors: string[] = [];
    if (file.name !== "pano-poses.csv") {
      const nameError = 'CSV file must be named exactly "pano-poses.csv"';
      errors.push(nameError);
    }
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      const typeError = "File must be a valid CSV file";
      errors.push(typeError);
    }
    return errors;
  };

  const validateImageFiles = (files: File[]): string[] => {
    const errors: string[] = [];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (files.length === 0) {
      errors.push("At least one image file is required");
      return errors;
    }

    const fileNames = new Set<string>();

    files.forEach((file, index) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(
          `Image ${index + 1} (${file.name}): Only JPEG and PNG files are allowed`,
        );
      }

      // Check for duplicate names in selection
      if (fileNames.has(file.name)) {
        errors.push(`Duplicate file name in selection: ${file.name}`);
      }
      fileNames.add(file.name);
    });

    return errors;
  };

  const detectDuplicateImages = (newFiles: File[]): DuplicateImage[] => {
    if (!isEditMode || existingFiles.images.length === 0) return [];

    const duplicates: DuplicateImage[] = [];
    newFiles.forEach((file) => {
      if (existingFiles.images.includes(file.name)) {
        duplicates.push({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
        });
      }
    });

    return duplicates;
  };

  const removeDuplicateImages = () => {
    const duplicateNames = new Set(duplicateImages.map((img) => img.name));
    const filteredImages = selectedFiles.images.filter(
      (file) => !duplicateNames.has(file.name),
    );

    setSelectedFiles((prev) => ({ ...prev, images: filteredImages }));
    setDuplicateImages([]);

    // Update the file input
    const imagesInput = document.getElementById("images") as HTMLInputElement;
    if (imagesInput) {
      const dt = new DataTransfer();
      filteredImages.forEach((file) => dt.items.add(file));
      imagesInput.files = dt.files;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    setDuplicateImages([]);

    if (name === "csv") {
      // Handle CSV file selection or removal
      if (files && files[0]) {
        setSelectedFiles((prev) => ({ ...prev, csv: files[0] }));
      } else {
        // File was removed/cleared
        setSelectedFiles((prev) => ({ ...prev, csv: null }));
      }
    } else if (name === "images") {
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const duplicates = detectDuplicateImages(fileArray);

        if (duplicates.length > 0) {
          setDuplicateImages(duplicates);
        }

        setSelectedFiles((prev) => ({ ...prev, images: fileArray }));
      } else {
        // Files were removed/cleared
        setSelectedFiles((prev) => ({ ...prev, images: [] }));
      }
    }
  };

  const handlePOIFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPOIFile(file);
  };

  const getFileValidationErrors = (): string[] => {
    const allErrors: string[] = [];

    // Validate CSV file
    if (selectedFiles.csv) {
      const csvErrors = validateCSVFile(selectedFiles.csv);
      allErrors.push(...csvErrors);
    }

    // Validate image files
    if (selectedFiles.images.length > 0) {
      const imageErrors = validateImageFiles(selectedFiles.images);
      allErrors.push(...imageErrors);
    }

    return allErrors;
  };

  const hasRequiredFiles = (): boolean => {
    const hasExistingCsv = isEditMode && !!existingFiles.csv;
    const hasExistingImages = isEditMode && existingFiles.images.length > 0;
    const hasNewCsv = !!selectedFiles.csv;
    const hasNewImages = selectedFiles.images.length > 0;

    const hasCsv = hasNewCsv || hasExistingCsv;
    const hasImages = hasNewImages || hasExistingImages;

    return hasCsv && hasImages;
  };

  const clearDuplicateImages = () => {
    setDuplicateImages([]);
  };

  return {
    selectedFiles,
    setSelectedFiles,
    poiFile,
    setPOIFile,
    duplicateImages,
    setDuplicateImages,
    handleFileChange,
    handlePOIFileChange,
    removeDuplicateImages,
    clearDuplicateImages,
    validateCSVFile,
    validateImageFiles,
    detectDuplicateImages,
    getFileValidationErrors,
    hasRequiredFiles,
  };
};
