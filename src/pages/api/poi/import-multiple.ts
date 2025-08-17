import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { POIData } from "@/types/poi";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import AdmZip from "adm-zip";

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get project-specific POI paths
function getProjectPOIPaths(projectId: string) {
  const projectsPath =
    process.env.PROJECTS_PATH || path.join(process.cwd(), "public");
  const dataDir = path.join(projectsPath, projectId, "poi");
  const filesDir = path.join(dataDir, "files");
  const dataFile = path.join(dataDir, "poi-data.json");

  // Ensure directories exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }

  return { dataDir, filesDir, dataFile };
}

function validatePOIData(poi: any): poi is POIData {
  return (
    poi &&
    typeof poi.id === "string" &&
    typeof poi.panoramaId === "string" &&
    typeof poi.name === "string" &&
    typeof poi.description === "string" &&
    poi.position &&
    typeof poi.position.yaw === "number" &&
    typeof poi.position.pitch === "number" &&
    ["file", "iframe"].includes(poi.type) &&
    typeof poi.content === "string" &&
    typeof poi.createdAt === "string" &&
    typeof poi.updatedAt === "string"
  );
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
  processedPOIs: POIData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const projectId = Array.isArray(fields.projectId)
      ? fields.projectId[0]
      : fields.projectId;
    const overwrite = Array.isArray(fields.overwrite)
      ? fields.overwrite[0] === "true"
      : fields.overwrite === "true";
    const generateNewId = Array.isArray(fields.generateNewId)
      ? fields.generateNewId[0] === "true"
      : fields.generateNewId === "true";

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { dataDir, filesDir, dataFile } = getProjectPOIPaths(projectId);

    let poisToImport: POIData[] = [];
    let attachmentFiles: { [poiId: string]: { originalName: string; content: Buffer }[] } = {};

    // Determine file type and process accordingly
    const fileExtension = path
      .extname(uploadedFile.originalFilename || "")
      .toLowerCase();

    if (fileExtension === ".zip") {
      // Handle ZIP file import
      const zip = new AdmZip(uploadedFile.filepath);
      const entries = zip.getEntries();

      let poiJsonEntry = entries.find(
        (entry: any) => entry.entryName === "poi-data.json",
      );
      if (!poiJsonEntry) {
        return res
          .status(400)
          .json({ error: "Invalid POI package: poi-data.json not found" });
      }

      const poiJsonContent = poiJsonEntry.getData().toString("utf8");
      const poiArray = JSON.parse(poiJsonContent);

      // Handle both single POI and array formats
      if (Array.isArray(poiArray)) {
        if (poiArray.length === 0) {
          return res
            .status(400)
            .json({ error: "No POI data found in the file" });
        }
        // Process all POIs in the array
        poisToImport = poiArray.filter(validatePOIData);
      } else if (poiArray.poi && validatePOIData(poiArray.poi)) {
        // Legacy format with poi wrapper
        poisToImport = [poiArray.poi];
      } else if (validatePOIData(poiArray)) {
        // Direct POI object
        poisToImport = [poiArray];
      } else {
        return res.status(400).json({ error: "Invalid POI data structure" });
      }

      // Extract attachment files and organize by POI ID
      const attachmentEntries = entries.filter((entry: any) =>
        entry.entryName.startsWith("attachments/"),
      );
      
      for (const entry of attachmentEntries) {
        const fileName = path.basename(entry.entryName);
        const dirName = path.dirname(entry.entryName).split('/')[1]; // Get POI ID from path
        
        if (!attachmentFiles[dirName]) {
          attachmentFiles[dirName] = [];
        }
        
        attachmentFiles[dirName].push({
          originalName: fileName,
          content: entry.getData(),
        });
      }
    } else if (fileExtension === ".json") {
      // Handle JSON file import
      const jsonContent = fs.readFileSync(uploadedFile.filepath, "utf8");
      const poiPackage = JSON.parse(jsonContent);

      if (Array.isArray(poiPackage)) {
        // Direct array of POIs
        poisToImport = poiPackage.filter(validatePOIData);
      } else if (poiPackage.poi && validatePOIData(poiPackage.poi)) {
        // Legacy format with poi wrapper
        poisToImport = [poiPackage.poi];
      } else if (validatePOIData(poiPackage)) {
        // Direct POI object
        poisToImport = [poiPackage];
      } else {
        return res.status(400).json({ error: "Invalid POI data structure" });
      }
    } else {
      return res.status(400).json({
        error: "Unsupported file format. Please upload a .json or .zip file",
      });
    }

    if (poisToImport.length === 0) {
      return res.status(400).json({ error: "No valid POI data found in the file" });
    }

    // Read existing POIs
    let existingPOIs: POIData[] = [];
    if (fs.existsSync(dataFile)) {
      try {
        const fileContent = fs.readFileSync(dataFile, "utf8");
        existingPOIs = JSON.parse(fileContent);
      } catch (parseError) {
        console.error("Error parsing existing POI data:", parseError);
        existingPOIs = [];
      }
    }

    const result: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      processedPOIs: [],
    };

    // Process each POI
    for (const poiData of poisToImport) {
      try {
        let processedPOI = { ...poiData };

        // Generate new ID if requested
        if (generateNewId) {
          processedPOI.id = uuidv4();
        }

        // Update timestamps
        processedPOI.updatedAt = new Date().toISOString();

        // Check for existing POI with same ID
        const existingIndex = existingPOIs.findIndex(
          (poi) => poi.id === processedPOI.id,
        );

        if (existingIndex !== -1 && !overwrite) {
          result.skipped++;
          result.errors.push(`POI '${processedPOI.name}' (ID: ${processedPOI.id}) already exists and overwrite is disabled`);
          continue;
        }

        // Handle file attachments for this POI
        if (attachmentFiles[poiData.id] && processedPOI.type === "file") {
          const poiAttachments = attachmentFiles[poiData.id];
          if (poiAttachments.length > 0) {
            const attachmentFile = poiAttachments[0]; // Use first attachment
            const newFileName = `${uuidv4()}_${attachmentFile.originalName}`;
            const attachmentPath = path.join(filesDir, newFileName);

            fs.writeFileSync(attachmentPath, attachmentFile.content);
            processedPOI.content = newFileName;
          }
        }

        // Add or update POI
        if (existingIndex !== -1) {
          existingPOIs[existingIndex] = processedPOI;
          result.updated++;
        } else {
          existingPOIs.push(processedPOI);
          result.imported++;
        }

        result.processedPOIs.push(processedPOI);
      } catch (error) {
        result.errors.push(`Error processing POI '${poiData.name}': ${error}`);
      }
    }

    // Save updated POI data
    fs.writeFileSync(dataFile, JSON.stringify(existingPOIs, null, 2), "utf8");

    const totalProcessed = result.imported + result.updated;
    const message = `Import completed: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped`;

    res.status(200).json({
      success: true,
      message,
      result,
      totalPOIs: poisToImport.length,
      processedPOIs: totalProcessed,
    });
  } catch (error) {
    console.error("Import multiple POIs error:", error);
    res.status(500).json({ error: "Failed to import POIs" });
  }
}