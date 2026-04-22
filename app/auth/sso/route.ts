import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

// SSO endpoint to receive token from ticketing platform
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Verify the token with Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(token);

        if (!decodedToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Token is valid - set cookie and redirect to dashboard
        const response = NextResponse.redirect(new URL('/itinerary', request.url));

        // Set auth cookie
        response.cookies.set('firebase-auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 3600, // 1 hour
        });

        return response;
    } catch (error) {
        console.error('SSO error:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}
