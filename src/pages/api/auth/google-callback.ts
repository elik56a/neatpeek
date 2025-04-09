import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Check if user exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: token.email },
      include: { accounts: true }
    });
    
    if (existingUser) {
      // Check if this Google account is already linked
      const linkedAccount = existingUser.accounts?.find(
        (acc) => acc.provider === "google"
      );
      
      // If not linked, create the link
      if (!linkedAccount) {
        // Get the Google account details from the session
        const googleAccount = await prisma.account.findFirst({
          where: {
            provider: "google",
            userId: { not: existingUser.id },
            user: { email: token.email }
          }
        });
        
        if (googleAccount) {
          // Move the Google account to the existing user
          await prisma.account.update({
            where: { id: googleAccount.id },
            data: { userId: existingUser.id }
          });
          
          // Update user profile
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLogin: new Date() }
          });
        }
      }
    }
    
    // Redirect to dashboard
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Error in Google callback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
