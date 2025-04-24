// Re-applying alias fix: 2025-04-24 18:30 UTC
import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { comparePasswords } from '@/lib/auth';

/**
 * NextAuth configuration options
 * Sets up authentication providers and callbacks
 */
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels'
        }
      }
    }),
    // Credentials provider for email/password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Return user without password
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    /**
     * JWT callback - called whenever JWT is created or updated
     */
    async jwt({ token, user, account }) {
      // Pass account info to token for access to OAuth tokens
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000; // Convert to milliseconds
        token.userId = user.id;
      }
      
      // Return previous token if the access token has not expired
      const now = Date.now();
      if (token.accessTokenExpires && now < token.accessTokenExpires) {
        return token;
      }
      
      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          // TODO: Implement token refresh logic if needed
          return token;
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
      
      return token;
    },
    
    /**
     * Session callback - called whenever a session is checked
     */
    async session({ session, token }) {
      // Add user ID and access token to session
      if (token) {
        session.user.id = token.userId as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string | undefined;
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Next.js API route handler for NextAuth
 */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 