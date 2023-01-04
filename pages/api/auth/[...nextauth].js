/* 
 * All requests to /api/auth/* (signIn, callback, signOut, etc.) will automatically be handled by NextAuth.js.
 * 
 * Dynamic route handler for NextAuth.js which also contains all global NextAuth.js 
 * configurations
 */

import NextAuth from "next-auth"
import StravaProvider from "next-auth/providers/strava"
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import prisma from "../../../lib/prismadb.ts"

export default NextAuth({
  // adapter: PrismaAdapter(prisma),
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_ID,
      clientSecret: process.env.STRAVA_SECRET,
      authorization: {
        url: 'https://www.strava.com/oauth/authorize',
        scope: 'activity:read,activity:write'
      }
    }),
  ],
  session: {
    // Choose how you want to save the user session.
    // The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
    // If you use an `adapter` however, we default it to `"database"` instead.
    // You can still force a JWT session by explicitly defining `"jwt"`.
    // When using `"database"`, the session cookie will only contain a `sessionToken` value,
    // which is used to look up the session in the database.
    strategy: "jwt",
  
    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days
  
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
    
    // The session token is usually either a random UUID or string, however if you
    // need a more customized session token string, you can define your own generate function.
    // generateSessionToken: () => {
    //   return randomUUID?.() ?? randomBytes(32).toString("hex")
    // }
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = profile.id
      }
      console.log(token);
      console.log("ACCOUNT: " + account);
      console.log("PROFILE: " + profile);
      return token
    }  
  },

  token: {
    url: "https://www.strava.com/oauth/token",
    params: { scope: "activity:read" }
  }
})