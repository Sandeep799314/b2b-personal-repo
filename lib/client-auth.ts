import { auth } from './firebase/config';

/**
 * Client-side utility to get authentication headers for API requests
 * Retrieves Firebase ID token and formats it as Authorization header
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        const token = await currentUser.getIdToken();

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    } catch (error) {
        console.error('Error getting auth headers:', error);
        throw error;
    }
}
