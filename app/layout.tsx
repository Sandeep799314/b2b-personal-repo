import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { MainLayout } from '@/components/main-layout'
import { AuthProvider } from '@/lib/firebase/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import { Toaster } from '@/components/ui/toaster'
import { UniversalChatbot } from '@/components/universal-chatbot'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trav Platforms',
  description: 'B2B Travel Platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --primary-color: #eab308;
  --primary-hover: #ca8a04;
  --primary-light: #fef9c3;
  --primary-dark: #854d0e;
}
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <MainLayout>{children}</MainLayout>
          </AuthGuard>
        </AuthProvider>
        <Toaster />
        <UniversalChatbot />
      </body>
    </html>
  )
}
