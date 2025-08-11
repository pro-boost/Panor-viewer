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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
