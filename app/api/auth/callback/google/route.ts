import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oauth2Client } from 'app/lib/google';
import { prisma } from 'app/lib/prisma';
import { generateToken } from 'app/lib/auth';

/**
 * GET handler for Google OAuth callback
 * Processes the OAuth code and sets up authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization code from URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url));
    }
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/auth/login?error=profile_fetch_failed', request.url));
    }
    
    const googleUser = await userInfoResponse.json();
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    
    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          // Generate a random password for OAuth users
          password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
        },
      });
    }
    
    // Store Google tokens in database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleUser.id,
        },
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
        token_type: tokens.token_type,
        scope: tokens.scope,
        id_token: tokens.id_token,
      },
      create: {
        user: {
          connect: {
            id: user.id,
          },
        },
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
        token_type: tokens.token_type,
        scope: tokens.scope,
        id_token: tokens.id_token,
      },
    });
    
    // Generate JWT token
    const jwt = generateToken(user);
    
    // Create response with redirect
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set token in cookie
    redirectResponse.cookies.set('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return redirectResponse;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=oauth_error', request.url));
  }
} 