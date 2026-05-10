"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User as FirebaseUser,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onIdTokenChanged,
} from 'firebase/auth';
import { auth } from './config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmailPassword: (email: string, password: string) => Promise<void>;
    signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }

        // Handle redirect result
        getRedirectResult(auth).catch((error) => {
            console.error('Error getting redirect result:', error);
        });

        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Get fresh ID token and store in cookie
                // onIdTokenChanged fires when the token is refreshed
                const idToken = await user.getIdToken();
                document.cookie = `firebase-auth-token=${idToken}; path=/; max-age=3600; SameSite=Lax`;
            } else {
                // Clear cookie on logout
                document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    async function signInWithGoogle() {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please check your configuration.');
        }
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            try {
                // Try popup first
                await signInWithPopup(auth, provider);
            } catch (error: any) {
                // If popup is blocked or other popup-specific errors, try redirect
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                    await signInWithRedirect(auth, provider);
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    }

    async function signInWithEmailPassword(email: string, password: string) {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please check your configuration.');
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in with email/password:', error);
            throw error;
        }
    }

    async function signUpWithEmailPassword(email: string, password: string) {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please check your configuration.');
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing up with email/password:', error);
            throw error;
        }
    }

    async function signOut() {
        if (!auth) {
            console.warn('Firebase Auth is not initialized during signOut');
            return;
        }
        try {
            await firebaseSignOut(auth);
            // Cookie will be cleared by onAuthStateChanged listener
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    const value = {
        currentUser,
        isLoading,
        signInWithGoogle,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
