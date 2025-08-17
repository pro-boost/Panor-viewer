import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { CacheManager } from "@/utils/cacheManager";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sceneCount: number;
  hasConfig: boolean;
  firstSceneId?: string;
  poiCount: number;
  floorCount: number;
}

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getProjectInfo = async (projectId: string): Promise<Project | null> => {
  const projectsPath =
    process.env.PROJECTS_PATH || path.join(process.cwd(), "public");
  const projectPath = path.join(projectsPath, projectId);

  if (!fs.existsSync(projectPath)) {
    return null;
  }

  try {
    const stats = await stat(projectPath);
    const configPath = path.join(projectPath, "config.json");
    const hasConfig = fs.existsSync(configPath);

    let sceneCount = 0;
    let firstSceneId: string | undefined;
    let poiCount = 0;
    let floorCount = 0;

    if (hasConfig) {
      try {
        const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
        sceneCount = configData.scenes ? configData.scenes.length : 0;
        firstSceneId =
          configData.scenes && configData.scenes.length > 0
            ? configData.scenes[0].id
            : undefined;

        // Calculate floor count from unique floor values
        if (configData.scenes) {
          const floors = new Set(
            configData.scenes
              .map((scene: any) => scene.floor)
              .filter((floor: any) => floor !== undefined),
          );
          floorCount = floors.size;
        }
      } catch {
        sceneCount = 0;
        firstSceneId = undefined;
        floorCount = 0;
      }
    }

    // Count POIs
    const poiDataPath = path.join(projectPath, "poi", "poi-data.json");
    if (fs.existsSync(poiDataPath)) {
      try {
        const poiData = JSON.parse(fs.readFileSync(poiDataPath, "utf8"));
        poiCount = Array.isArray(poiData) ? poiData.length : 0;
      } catch {
        poiCount = 0;
      }
    }

    // Check for project metadata file to get the actual project name and ID
    const metadataPath = path.join(projectPath, "project-metadata.json");
    let projectName = projectId;
    let actualProjectId = projectId;
    
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
        if (metadata.name) projectName = metadata.name;
        if (metadata.id) actualProjectId = metadata.id;
      } catch {
        // If metadata file is corrupted, fall back to directory name
      }
    }

    return {
      id: actualProjectId,
      name: projectName,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      sceneCount,
      hasConfig,
      firstSceneId,
      poiCount,
      floorCount,
    };
  } catch (error) {
    console.error(`Error getting project info for ${projectId}:`, error);
    return null;
  }
};

const deleteProjectRecursively = async (dirPath: string): Promise<void> => {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const items = await readdir(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const itemStat = await stat(itemPath);

    if (itemStat.isDirectory()) {
      await deleteProjectRecursively(itemPath);
    } else {
      await unlink(itemPath);
    }
  }

  await rmdir(dirPath);
};

const checkProjectNameExists = async (projectName: string, excludeProjectId?: string): Promise<boolean> => {
  const publicDir = process.env.PROJECTS_PATH || path.join(process.cwd(), "public");
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  
  try {
    const items = await readdir(publicDir);
    
    for (const item of items) {
      const itemPath = path.join(publicDir, item);
      const itemStat = await stat(itemPath);
      
      // Skip files and system directories
      if (
        !itemStat.isDirectory() ||
        item.startsWith(".") ||
        ["assets", "images", "data", "csv"].includes(item)
      ) {
        continue;
      }
      
      // Skip the project we're updating
      if (excludeProjectId && item === excludeProjectId) {
        continue;
      }
      
      // Check if directory name matches the sanitized name
      if (item === sanitizedName) {
        return true;
      }
      
      // Check metadata file for project name
      const metadataPath = path.join(itemPath, "project-metadata.json");
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
          if (metadata.id === sanitizedName || metadata.name?.toLowerCase() === projectName.toLowerCase()) {
            return true;
          }
        } catch (error) {
          // Ignore metadata parsing errors
        }
      } else {
        // For projects without metadata, check if the directory name matches
        // the sanitized version of any potential project name
        const projectInfo = await getProjectInfo(item);
        if (projectInfo && projectInfo.name.toLowerCase() === projectName.toLowerCase()) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking project name existence:", error);
    return false;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;
  const cacheManager = CacheManager.getInstance();

  try {
    switch (method) {
      case "GET":
        // List all projects
        const publicDir =
          process.env.PROJECTS_PATH || path.join(process.cwd(), "public");
        ensureDirectoryExists(publicDir);

        const items = await readdir(publicDir);
        const projects: Project[] = [];

        for (const item of items) {
          const itemPath = path.join(publicDir, item);
          const itemStat = await stat(itemPath);

          // Skip files and system directories
          if (
            !itemStat.isDirectory() ||
            item.startsWith(".") ||
            ["assets", "images", "data", "csv"].includes(item)
          ) {
            continue;
          }

          const projectInfo = await getProjectInfo(item);
          if (projectInfo) {
            projects.push(projectInfo);
          }
        }

        // Sort by updated date (newest first)
        projects.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        res.status(200).json({ projects });
        break;

      case "POST":
        // Create a new project or check for duplicates
        const { projectName, checkOnly } = req.body;

        if (!projectName || typeof projectName !== "string") {
          return res.status(400).json({ error: "Project name is required" });
        }

        // Sanitize project name
        const sanitizedName = projectName
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .toLowerCase();

        if (!sanitizedName) {
          return res.status(400).json({ error: "Invalid project name" });
        }

        // Check if project name already exists
        const nameExists = await checkProjectNameExists(projectName);
        if (nameExists) {
          return res.status(409).json({ error: "Project already exists" });
        }

        // If this is just a check, return success without creating
        if (checkOnly) {
          return res.status(200).json({ available: true });
        }

        const newProjectPath = path.join(
          process.env.PROJECTS_PATH || path.join(process.cwd(), "public"),
          sanitizedName,
        );

        // Create project directories
        ensureDirectoryExists(newProjectPath);
        ensureDirectoryExists(path.join(newProjectPath, "images"));
        ensureDirectoryExists(path.join(newProjectPath, "data"));

        // Clear any residual cache for this project name to prevent showing old images
        cacheManager.clearProjectCache(sanitizedName);

        const newProject = await getProjectInfo(sanitizedName);

        res.status(201).json({ project: newProject });
        break;

      case "PUT":
        // Update a project
        const { projectId: updateProjectId, projectName: newProjectName } = req.body;

        if (!updateProjectId || typeof updateProjectId !== "string") {
          return res.status(400).json({ error: "Project ID is required" });
        }

        if (!newProjectName || typeof newProjectName !== "string") {
          return res.status(400).json({ error: "Project name is required" });
        }

        // Sanitize new project name
        const sanitizedNewName = newProjectName
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .toLowerCase();

        if (!sanitizedNewName) {
          return res.status(400).json({ error: "Invalid project name" });
        }

        const currentProjectPath = path.join(
          process.env.PROJECTS_PATH || path.join(process.cwd(), "public"),
          updateProjectId,
        );

        const updatedProjectPath = path.join(
          process.env.PROJECTS_PATH || path.join(process.cwd(), "public"),
          sanitizedNewName,
        );

        if (!fs.existsSync(currentProjectPath)) {
          return res.status(404).json({ error: "Project not found" });
        }

        // Check if the new project name already exists (excluding the current project)
        if (sanitizedNewName !== updateProjectId) {
          const nameExists = await checkProjectNameExists(newProjectName, updateProjectId);
          if (nameExists) {
            return res.status(409).json({ error: "A project with this name already exists" });
          }
        }

        // If the sanitized name is different from current ID, we need to handle directory renaming
        let finalProjectId = updateProjectId;
        if (sanitizedNewName !== updateProjectId) {

          // For now, we'll skip the directory rename if it fails due to permissions
          // and just update the project metadata. The directory can be renamed later.
          try {
            // Use async rename with retry mechanism
            await new Promise((resolve, reject) => {
              const attemptRename = (attempts: number) => {
                fs.rename(currentProjectPath, updatedProjectPath, (error) => {
                  if (error) {
                    if (error.code === 'EPERM' && attempts > 0) {
                      // Wait a bit and retry
                      setTimeout(() => attemptRename(attempts - 1), 200);
                    } else {
                      reject(error);
                    }
                  } else {
                    resolve(undefined);
                  }
                });
              };
              attemptRename(5); // Try up to 5 times with longer delays
            });
            finalProjectId = sanitizedNewName;
          } catch (error: any) {
            console.error("Failed to rename project directory:", error);
            if (error.code === 'EPERM') {
              // Instead of failing, we'll continue with the old directory name
              // but still update the project name in memory
              console.warn(`Directory rename failed for project ${updateProjectId} -> ${sanitizedNewName}, continuing with old directory name`);
              finalProjectId = updateProjectId; // Keep using the old directory name
            } else if (error.code === 'ENOENT') {
              return res.status(404).json({ error: "Project directory not found" });
            } else {
              return res.status(500).json({ error: "Failed to rename project directory" });
            }
          }
        }

        const updatedProject = await getProjectInfo(finalProjectId);
        
        if (!updatedProject) {
          return res.status(404).json({ error: "Project not found after update" });
        }

        // If directory rename failed but we want to show the new name, update the project object
        if (finalProjectId === updateProjectId && sanitizedNewName !== updateProjectId) {
          updatedProject.name = newProjectName.trim();
          updatedProject.id = sanitizedNewName; // Return the new ID even if directory wasn't renamed
          console.log(`Project name updated: ${updateProjectId} -> ${sanitizedNewName}, returning updated project:`, updatedProject);
          
          // Create/update project metadata file to persist the new name and ID
          const metadataPath = path.join(currentProjectPath, "project-metadata.json");
          const metadata = {
            id: sanitizedNewName,
            name: newProjectName.trim(),
            directoryName: updateProjectId, // Keep track of the actual directory name
            updatedAt: new Date().toISOString()
          };
          
          try {
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            console.log(`Project metadata saved to ${metadataPath}`);
          } catch (error) {
            console.error(`Failed to save project metadata:`, error);
          }
        }

        res.status(200).json({ project: updatedProject });
        break;

      case "DELETE":
        // Delete a project
        const { projectId } = req.query;

        if (!projectId || typeof projectId !== "string") {
          return res.status(400).json({ error: "Project ID is required" });
        }

        const projectToDelete = path.join(
          process.env.PROJECTS_PATH || path.join(process.cwd(), "public"),
          projectId,
        );

        if (!fs.existsSync(projectToDelete)) {
          return res.status(404).json({ error: "Project not found" });
        }

        await deleteProjectRecursively(projectToDelete);

        // Clear cache for the deleted project
        cacheManager.clearProjectCache(projectId);

        res.status(200).json({ message: "Project deleted successfully" });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error: any) {
    console.error("Projects API error:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
