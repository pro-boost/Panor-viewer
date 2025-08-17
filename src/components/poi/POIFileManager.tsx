import React, { useState, useRef } from "react";
import { POIData } from "@/types/poi";
import styles from "@/styles/POIManagement.module.css";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface POIFileManagerProps {
  projectId: string;
  onPOIImported?: (poi: POIData) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  hasExistingPOIs?: boolean;
}

interface ImportOptions {
  overwrite: boolean;
  generateNewId: boolean;
}

export default function POIFileManager({
  projectId,
  onPOIImported,
  onError,
  onSuccess,
  hasExistingPOIs = false,
}: POIFileManagerProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwrite: false,
    generateNewId: false,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [overwriteData, setOverwriteData] = useState<{
    file: File;
    existingPOI: any;
    formData: FormData;
  } | null>(null);

  const handleExportPOI = async (poiId: string, poiName: string) => {
    try {
      const response = await fetch(
        `/api/poi/export-single?projectId=${encodeURIComponent(projectId)}&poiId=${encodeURIComponent(poiId)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export POI");
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `poi-${poiName.replace(/[^a-zA-Z0-9]/g, "_")}-${poiId.substring(0, 8)}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onSuccess?.(`POI "${poiName}" exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to export POI"
      );
    }
  };

  const handleImportPOI = async (file: File) => {
    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("overwrite", importOptions.overwrite.toString());
      formData.append("generateNewId", importOptions.generateNewId.toString());

      const response = await fetch("/api/poi/import-multiple", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import POIs");
      }

      // Handle multiple POI import results
      if (result.result && result.result.processedPOIs) {
        // Notify about each imported POI
        result.result.processedPOIs.forEach((poi: any) => {
          onPOIImported?.(poi);
        });
      }

      // Show comprehensive success message
      const { imported, updated, skipped, errors } = result.result || {};
      let message = result.message || "POIs processed successfully";

      if (errors && errors.length > 0) {
        message += `\n\nWarnings:\n${errors.join("\n")}`;
      }

      onSuccess?.(message);
    } catch (error) {
      console.error("Import error:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to import POIs"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmOverwrite = async () => {
    if (!overwriteData) return;

    setIsImporting(true);
    try {
      // Retry with overwrite enabled
      overwriteData.formData.set("overwrite", "true");
      const retryResponse = await fetch("/api/poi/import-multiple", {
        method: "POST",
        body: overwriteData.formData,
      });

      const retryResult = await retryResponse.json();
      if (!retryResponse.ok) {
        throw new Error(retryResult.error || "Failed to import POIs");
      }

      // Handle multiple POI import results
      if (retryResult.result && retryResult.result.processedPOIs) {
        retryResult.result.processedPOIs.forEach((poi: any) => {
          onPOIImported?.(poi);
        });
      }

      onSuccess?.(retryResult.message || "POIs imported successfully");
    } catch (error) {
      console.error("Import error:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to import POIs"
      );
    } finally {
      setIsImporting(false);
      setShowOverwriteConfirm(false);
      setOverwriteData(null);
    }
  };

  const handleCancelOverwrite = () => {
    setShowOverwriteConfirm(false);
    setOverwriteData(null);
    onError?.("Import cancelled by user");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportPOI(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImportPOI(files[0]);
    }
  };

  return (
    <div className={styles.poiFileManager}>
      {/* Import Section */}
      <div className={styles.section}>
        <h4>Import POI</h4>

        {/* Import Options - Only show if there are existing POIs */}
        {hasExistingPOIs && (
          <div className={styles.importOptions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={importOptions.generateNewId}
                onChange={(e) =>
                  setImportOptions((prev) => ({
                    ...prev,
                    generateNewId: e.target.checked,
                  }))
                }
              />
              Generate new ID (prevents conflicts)
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={importOptions.overwrite}
                onChange={(e) =>
                  setImportOptions((prev) => ({
                    ...prev,
                    overwrite: e.target.checked,
                  }))
                }
              />
              Overwrite existing POIs
            </label>
          </div>
        )}

        {/* File Drop Zone */}
        <div
          className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {isImporting ? (
            <div className={styles.importing}>
              <div className={styles.spinner}></div>
              <p>Importing POIs...</p>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <div className={styles.uploadIcon}></div>
              <p>Drop POI files here or click to browse</p>
              <p className={styles.supportedFormats}>
                Supported formats: .json, .zip
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showOverwriteConfirm}
        title="POI Already Exists"
        message={`POI "${overwriteData?.existingPOI?.name || "Unknown"}" already exists. Do you want to overwrite it?`}
        confirmText="Overwrite"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleConfirmOverwrite}
        onCancel={handleCancelOverwrite}
      />
    </div>
  );
}

// Export function for use in other components
export const exportPOI = async (
  projectId: string,
  poiId: string,
  poiName: string
) => {
  try {
    const response = await fetch(
      `/api/poi/export-single?projectId=${encodeURIComponent(projectId)}&poiId=${encodeURIComponent(poiId)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to export POI");
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `poi-${poiName.replace(/[^a-zA-Z0-9]/g, "_")}-${poiId.substring(0, 8)}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
};
