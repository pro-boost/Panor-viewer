import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { projectId, filenames } = req.body;

    if (!projectId || !filenames || !Array.isArray(filenames)) {
      return res
        .status(400)
        .json({ error: "Project ID and filenames array are required" });
    }

    const projectsPath =
      process.env.PROJECTS_PATH || path.join(process.cwd(), "public");
    const uploadDir = path.join(projectsPath, "uploads", projectId);
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    // Delete each file
    for (const filename of filenames) {
      try {
        const filePath = path.join(uploadDir, filename);

        // Check if file exists before attempting to delete
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(filename);
        } else {
          errors.push(`File not found: ${filename}`);
        }
      } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
        errors.push(
          `Failed to delete ${filename}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    // Return results
    res.status(200).json({
      success: true,
      deletedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `Deleted ${deletedFiles.length} of ${filenames.length} files`,
    });
  } catch (error) {
    console.error("Delete files API error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
