"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Chrome, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const { currentUser, isLoading, signInWithGoogle, signInWithEmailPassword } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        // Redirect if already logged in
        if (!isLoading && currentUser) {
            router.push('/itinerary');
        }
    }, [currentUser, isLoading, router]);

    const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSigningIn(true);

        try {
            await signInWithEmailPassword(email, password);
            // Will redirect via useEffect above
        } catch (error: any) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: error.message || "Invalid email or password. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            // Will redirect via useEffect above
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            toast({
                title: "Sign In Failed",
                description: error.message || "Failed to sign in with Google. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSigningIn(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-brand-primary-50/30 p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Sign in to access your itineraries and quotations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isSigningIn}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isSigningIn}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={isSigningIn}
                        >
                            {isSigningIn ? 'Signing in...' : 'Sign in with Email'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign-In */}
                    <Button
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="w-full h-11 gap-2"
                        disabled={isSigningIn}
                    >
                        <Chrome className="h-5 w-5" />
                        Sign in with Google
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
