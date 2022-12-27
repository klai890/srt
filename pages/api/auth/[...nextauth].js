/* 
 * All requests to /api/auth/* (signIn, callback, signOut, etc.) will automatically be handled by NextAuth.js.
 * 
 * Dynamic route handler for NextAuth.js which also contains all global NextAuth.js 
 * configurations
 */

import NextAuth from "next-auth"
import StravaProvider from "next-auth/providers/strava"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prismadb.ts"

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_ID,
      clientSecret: process.env.STRAVA_SECRET,
    }),
  ],
})

