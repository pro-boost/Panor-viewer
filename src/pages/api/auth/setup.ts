import { NextApiRequest, NextApiResponse } from "next";
import { authHelpers, userService, isSupabaseConfigured } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  if (method === "GET") {
    if (!isSupabaseConfigured()) {
      return res.status(200).json({
        configured: false,
        hasUsers: false,
      });
    }

    try {
      // Check if there are any admin users in Supabase
      const allUsers = await userService.getAllUsers();
      const hasAdminUsers = allUsers.some((user) => user.role === "admin");

      return res.status(200).json({
        configured: true,
        hasUsers: hasAdminUsers,
      });
    } catch (error) {
      console.error("Error checking setup status:", error);
      return res.status(200).json({
        configured: false,
        hasUsers: false,
      });
    }
  }

  if (method === "POST") {
    const { email, password, confirmPassword } = req.body;

    // Validate input
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase is not configured" });
    }

    try {
      // Check if there are already admin users
      const allUsers = await userService.getAllUsers();
      const hasAdminUsers = allUsers.some((user) => user.role === "admin");

      if (hasAdminUsers) {
        return res
          .status(409)
          .json({ error: "Authentication is already configured" });
      }

      // Create the admin user in Supabase
      try {
        const result = await authHelpers.signUp(email, password);
        const { user } = result;

        if (!user) {
          return res.status(400).json({ error: "Failed to create user" });
        }

        // Check if user profile already exists (might be created by trigger)
        const existingProfile = await userService.getUserProfile(user.id);
        console.log("Existing profile check:", {
          userId: user.id,
          existingProfile,
        });

        if (existingProfile) {
          console.log("Updating existing profile to admin role");
          // Update existing profile to admin role
          const success = await userService.updateUserRole(user.id, "admin");
          if (!success) {
            return res
              .status(500)
              .json({ error: "Failed to update user to admin role" });
          }
        } else {
          console.log("Creating new admin profile");
          // Create user profile with admin role
          const success = await userService.createAdminProfile(user.id, email);

          if (!success) {
            console.error("Failed to create admin profile for user:", {
              userId: user.id,
              email,
            });
            return res
              .status(500)
              .json({ error: "Failed to create admin profile" });
          }
        }

        res.status(201).json({
          success: true,
          message: "Authentication configured successfully",
          user: {
            email: user.email,
            id: user.id,
            role: "admin",
          },
        });
      } catch (signUpError: any) {
        console.error("Supabase signUp error:", signUpError);

        // Handle specific Supabase errors
        if (
          signUpError.code === "user_already_exists" ||
          signUpError.message?.includes("User already registered")
        ) {
          // User exists, try to get the user and check if admin profile exists
          try {
            const signInResult = await authHelpers.signIn(email, password);
            const user = signInResult.user;

            if (!user) {
              return res.status(409).json({
                error:
                  "User already exists but cannot sign in. Please check your credentials or contact support.",
              });
            }

            // Check if admin profile exists
            const existingProfile = await userService.getUserProfile(user.id);

            if (existingProfile) {
              if (existingProfile.role === "admin") {
                return res.status(409).json({
                  error:
                    "Authentication is already configured with this email.",
                });
              } else {
                // Update existing user profile to admin
                const success = await userService.updateUserRole(
                  user.id,
                  "admin",
                );
                if (!success) {
                  return res
                    .status(500)
                    .json({ error: "Failed to update user to admin role" });
                }
              }
            } else {
              // Create admin profile for existing user
              const success = await userService.createAdminProfile(
                user.id,
                email,
              );

              if (!success) {
                console.error(
                  "Failed to create admin profile for existing user:",
                  { userId: user.id, email },
                );
                return res.status(500).json({
                  error: "Failed to create admin profile for existing user",
                });
              }
            }

            return res.status(201).json({
              success: true,
              message:
                "Authentication configured successfully for existing user",
              user: {
                email: user.email,
                id: user.id,
                role: "admin",
              },
            });
          } catch (profileError: any) {
            console.error("Error handling existing user:", profileError);
            // If sign in fails, it might be due to wrong password or other issues
            if (profileError.message?.includes("Invalid login credentials")) {
              return res.status(409).json({
                error:
                  "User already exists but the password is incorrect. Please use the correct password or contact support.",
              });
            }
            return res.status(500).json({
              error:
                "User exists but failed to configure admin profile. Please contact support.",
            });
          }
        }

        if (signUpError.message?.includes("email confirmation")) {
          return res.status(400).json({
            error:
              "Email confirmation is required. Please disable email confirmation in your Supabase project settings or configure SMTP.",
          });
        }

        if (signUpError.message?.includes("Invalid login credentials")) {
          return res
            .status(400)
            .json({ error: "Invalid email or password format" });
        }

        if (signUpError.message?.includes("Database error saving new user")) {
          return res.status(500).json({
            error:
              "Database setup error. Please ensure you have run the SQL schema from SUPABASE_AUTH.md in your Supabase SQL editor. The user_profiles table and trigger function may be missing.",
          });
        }

        return res.status(500).json({
          error: `Supabase error: ${signUpError.message || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("Error setting up authentication:", error);
      res.status(500).json({ error: "Failed to configure authentication" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
