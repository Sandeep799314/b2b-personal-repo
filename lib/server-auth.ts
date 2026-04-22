import { adminAuth } from './firebase/admin';
import { NextRequest } from 'next/server';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

/**
 * Verify Firebase ID token from request and return user info
 * @param request - Next.js request object
 * @returns User info if authenticated, null otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        // Try to get token from Authorization header
        const authHeader = request.headers.get('authorization');
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            // Fallback to cookie
            const cookieToken = request.cookies.get('firebase-auth-token');
            token = cookieToken?.value;
        }

        if (!token) {
            return null;
        }

        // Verify the token with Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(token);

        return {
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            displayName: decodedToken.name || null,
            photoURL: decodedToken.picture || null,
        };
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return null;
    }
}

/**
 * Get authentication headers for API requests (client-side)
 * Returns headers with Firebase ID token if user is authenticated
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    try {
        // Try to get token from cookie
        if (typeof window !== 'undefined') {
            const authToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('firebase-auth-token='))
                ?.split('=')[1];

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
        }
    } catch (error) {
        console.error('Error getting auth token:', error);
    }

    return headers;
}
