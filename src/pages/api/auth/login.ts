import { NextApiRequest, NextApiResponse } from "next";
import { authHelpers, userService } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await authHelpers.signIn(email, password);
    const { user, session } = result;

    if (!user || !session) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Check if user is approved
    const profile = await userService.getUserProfile(user.id);
    if (!profile || !profile.approved) {
      return res.status(403).json({
        error: "Account pending approval. Please contact an administrator.",
      });
    }

    // Set session cookies
    const isProduction = process.env.NODE_ENV === "production";
    res.setHeader("Set-Cookie", [
      `supabase-access-token=${session.access_token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${isProduction ? "; Secure" : ""}`,
      `supabase-refresh-token=${session.refresh_token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${isProduction ? "; Secure" : ""}`,
    ]);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle specific Supabase authentication errors
    if (error.message?.includes("Invalid login credentials") || 
        error.message?.includes("Email not confirmed") ||
        error.message?.includes("Invalid email or password")) {
      return res.status(401).json({ 
        error: "Invalid email or password. Please check your credentials and try again." 
      });
    }

    if (error.message?.includes("Email not confirmed")) {
      return res.status(401).json({ 
        error: "Please check your email and confirm your account before signing in." 
      });
    }

    if (error.message?.includes("Too many requests") || 
        error.message?.includes("rate limit")) {
      return res.status(429).json({ 
        error: "Too many login attempts. Please wait a few minutes before trying again." 
      });
    }

    if (error.message?.includes("Network") || 
        error.message?.includes("fetch") ||
        error.code === "NETWORK_ERROR") {
      return res.status(503).json({ 
        error: "Network connection error. Please check your internet connection and try again." 
      });
    }

    if (error.message?.includes("Database") || 
        error.message?.includes("Connection")) {
      return res.status(503).json({ 
        error: "Service temporarily unavailable. Please try again later." 
      });
    }

    // Generic error for other cases
    res.status(500).json({ 
      error: "An unexpected error occurred. Please try again later or contact support if the problem persists." 
    });
  }
}
