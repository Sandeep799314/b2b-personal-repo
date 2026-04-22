"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User as FirebaseUser,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Get fresh ID token and store in cookie
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
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    }

    async function signInWithEmailPassword(email: string, password: string) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in with email/password:', error);
            throw error;
        }
    }

    async function signUpWithEmailPassword(email: string, password: string) {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing up with email/password:', error);
            throw error;
        }
    }

    async function signOut() {
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
