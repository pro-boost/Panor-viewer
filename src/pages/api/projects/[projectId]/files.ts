import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { projectId } = req.query;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ error: "Project ID is required" });
  }

  try {
    const projectsPath =
      process.env.PROJECTS_PATH || path.join(process.cwd(), "public");
    
    // First try to find the project directory by the projectId
    let projectDir = path.join(projectsPath, projectId);
    
    // If the directory doesn't exist, search for it using metadata files
    if (!fs.existsSync(projectDir)) {
      const directories = fs.readdirSync(projectsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      // Search through all directories for a matching metadata file
      for (const dirName of directories) {
        const metadataPath = path.join(projectsPath, dirName, "project-metadata.json");
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            if (metadata.id === projectId) {
              projectDir = path.join(projectsPath, dirName);
              break;
            }
          } catch (error) {
            // Skip invalid metadata files
            continue;
          }
        }
      }
    }

    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: "Project not found" });
    }

    const files = {
      csv: null as string | null,
      images: [] as string[],
      poi: null as string | null,
    };

    // Check for CSV file (pano-poses.csv) in config directory
    const csvPath = path.join(projectDir, "config", "pano-poses.csv");
    if (fs.existsSync(csvPath)) {
      files.csv = "pano-poses.csv";
    }

    // Check for images directory
    const imagesDir = path.join(projectDir, "images");
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs
        .readdirSync(imagesDir)
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"].includes(
            ext,
          );
        })
        .sort();
      files.images = imageFiles;
    }

    // Check for POI files
    const poiDir = path.join(projectDir, "poi");
    if (fs.existsSync(poiDir)) {
      const poiFiles = fs
        .readdirSync(poiDir)
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return [".json", ".zip"].includes(ext);
        })
        .sort();

      if (poiFiles.length > 0) {
        files.poi = poiFiles[0]; // Use the first POI file found
      }
    }

    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error getting project files:", error);
    return res.status(500).json({ error: "Failed to get project files" });
  }
}
