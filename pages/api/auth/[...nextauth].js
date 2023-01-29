/* 
 * All requests to /api/auth/* (signIn, callback, signOut, etc.) will automatically be handled by NextAuth.js.
 * 
 * Dynamic route handler for NextAuth.js which also contains all global NextAuth.js 
 * configurations
 */

import NextAuth from "next-auth"
import StravaProvider from "next-auth/providers/strava"

export const authOptions = {
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_ID,
      clientSecret: process.env.STRAVA_SECRET,
      authorization: {
        url: 'https://www.strava.com/oauth/authorize?',
        params : {scope: 'activity:read,activity:read_all,activity:write'}
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      
      // Initial Sign in
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.id = profile.id
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      var newToken = await refreshAccessToken(token);
      return newToken;
    },

    async session({ session, token }) {
      session.user = token.name
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.error = token.error
      return session
    },

  },
}

async function refreshAccessToken(token) {
  try {
    const url =
      "https://www.strava.com/oauth/token?" +
      new URLSearchParams({
        client_id: process.env.STRAVA_ID,
        client_secret: process.env.STRAVA_SECRET,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
        redirect_uri: "http://localhost:3000/mileage"
      })
      

    const response = await fetch(url, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}



export default NextAuth(authOptions)