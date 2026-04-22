"use client"

import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
}
//niket123
export function AuthGuard({ children }: AuthGuardProps) {
    const { currentUser, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip redirect if on login page, SSO endpoint, or public weblink page
        // Management page is /weblinks, public page is /weblinks/[slug]
        const isPublicWeblink = pathname.startsWith('/weblinks/') && pathname.split('/').length === 3;
        if (pathname === '/login' || pathname === '/auth/sso' || isPublicWeblink) {
            return;
        }

        // Redirect to login if not authenticated
        if (!isLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, isLoading, router, pathname]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated (except on login/sso pages and public weblinks)
    const isPublicWeblink = pathname.startsWith('/weblinks/') && pathname.split('/').length === 3;
    if (!currentUser && pathname !== '/login' && pathname !== '/auth/sso' && !isPublicWeblink) {
        return null;
    }

    return <>{children}</>;
}
