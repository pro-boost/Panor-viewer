import { NextApiRequest, NextApiResponse } from "next";
import { userService, isSupabaseConfigured, supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!isSupabaseConfigured()) {
    return res.status(500).json({ error: "Supabase is not configured" });
  }

  const { method } = req;

  switch (method) {
    case "GET":
      return handleGetUsers(req, res);
    case "PUT":
      return handleUpdateUser(req, res);
    case "DELETE":
      return handleDeleteUser(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type } = req.query;
    let users;

    console.log("Fetching users with type:", type);

    if (type === "pending") {
      users = await userService.getPendingUsers();
      console.log("Pending users fetched:", users?.length || 0, "users");
    } else {
      users = await userService.getAllUsers();
      console.log("All users fetched:", users?.length || 0, "users");
    }

    console.log("Returning users data:", {
      users: users?.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        approved: u.approved,
      })),
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, action, role, approved } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current user from session to prevent self-modification
    const accessToken = req.cookies["supabase-access-token"];
    const refreshToken = req.cookies["supabase-refresh-token"];

    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUserProfile = await userService.getUserProfile(user.id);
    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Prevent self-modification for certain actions
    if (user.id === userId) {
      if (action === "updateRole" && role !== "admin") {
        return res
          .status(400)
          .json({ error: "Cannot change your own admin role" });
      }
      if (action === "updateStatus" && approved === false) {
        return res
          .status(400)
          .json({ error: "Cannot change your own approval status" });
      }
    }

    // Check if trying to modify the last admin
    if (action === "updateRole" && role !== "admin") {
      const targetUser = await userService.getUserProfile(userId);
      if (targetUser?.role === "admin") {
        const allUsers = await userService.getAllUsers();
        const adminCount = allUsers.filter(
          (u) => u.role === "admin" && u.approved,
        ).length;
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({ error: "Cannot remove the last admin user" });
        }
      }
    }

    let success = false;

    switch (action) {
      case "approve":
        success = await userService.approveUser(userId);
        break;
      case "updateRole":
        if (!role) {
          return res
            .status(400)
            .json({ error: "Role is required for updateRole action" });
        }
        success = await userService.updateUserRole(userId, role);
        break;
      case "updateStatus":
        if (typeof approved !== "boolean") {
          return res.status(400).json({
            error: "Approved status is required for updateStatus action",
          });
        }
        success = await userService.updateUserStatus(userId, approved);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    if (success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Operation failed" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
}

async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get current user from session to prevent self-deletion
    const accessToken = req.cookies["supabase-access-token"];
    const refreshToken = req.cookies["supabase-refresh-token"];

    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUserProfile = await userService.getUserProfile(user.id);
    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Prevent self-deletion
    if (user.id === userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Check if trying to delete the last admin
    const targetUser = await userService.getUserProfile(userId);
    if (targetUser?.role === "admin") {
      const allUsers = await userService.getAllUsers();
      const adminCount = allUsers.filter(
        (u) => u.role === "admin" && u.approved,
      ).length;
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ error: "Cannot delete the last admin user" });
      }
    }

    const success = await userService.deleteUser(userId);

    if (success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Failed to delete user" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
}
