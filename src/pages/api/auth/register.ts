import { NextApiRequest, NextApiResponse } from "next";
import { authHelpers, isSupabaseConfigured } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  if (method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return res.status(500).json({
      error:
        "Authentication system is not configured. Please contact the administrator.",
    });
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  // Validate password strength
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  // Check password strength
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength < 3) {
    return res.status(400).json({
      error:
        "Password is too weak. Please include uppercase, lowercase, and numbers.",
    });
  }

  try {
    // Attempt to register the user with Supabase
    const result = await authHelpers.signUp(
      email.toLowerCase().trim(),
      password,
    );

    if (result.user) {
      // User registration successful
      // The database trigger will automatically create a user_profile with approved: false
      return res.status(201).json({
        success: true,
        message:
          "Registration successful! Your account is pending admin approval.",
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      });
    } else {
      return res.status(400).json({
        error: "Registration failed. Please try again.",
      });
    }
  } catch (signUpError: any) {
    console.error("User registration error:", signUpError);

    // Handle specific Supabase errors
    if (
      signUpError.code === "user_already_exists" ||
      signUpError.message?.includes("User already registered") ||
      signUpError.message?.includes("already been registered")
    ) {
      return res.status(409).json({
        error:
          "An account with this email already exists. Please try signing in instead.",
      });
    }

    if (signUpError.message?.includes("Invalid email")) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (signUpError.message?.includes("Password should be at least")) {
      return res.status(400).json({
        error: "Password does not meet the minimum requirements.",
      });
    }

    if (signUpError.message?.includes("email confirmation")) {
      return res.status(400).json({
        error:
          "Email confirmation is required. Please check your email and follow the confirmation link.",
      });
    }

    if (signUpError.message?.includes("signup is disabled")) {
      return res.status(403).json({
        error:
          "User registration is currently disabled. Please contact the administrator.",
      });
    }

    // Generic error for other cases
    return res.status(500).json({
      error:
        "Registration failed. Please try again later or contact support if the problem persists.",
    });
  }
}
