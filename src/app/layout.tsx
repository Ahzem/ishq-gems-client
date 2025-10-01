import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'
import { SEO_DEFAULTS, THEME_CONFIG } from '@/lib/constants'
import { appConfig } from '@/config/environment'
import { AuthProvider } from '@/features/auth/hooks/useAuth'
import { UIProvider } from '@/components/providers'
import WebSocketBiddingProvider from '@/providers/WebSocketBiddingProvider'
import CursorGlow from '@/components/common/CursorGlow'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'
import RouteTracker from '@/components/navigation/RouteTracker'
import "@/styles/globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.baseUrl),
  title: SEO_DEFAULTS.defaultTitle,
  description: SEO_DEFAULTS.description,
  keywords: SEO_DEFAULTS.keywords,
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    title: SEO_DEFAULTS.defaultTitle,
    description: SEO_DEFAULTS.description,
    type: SEO_DEFAULTS.openGraph.type,
    locale: SEO_DEFAULTS.openGraph.locale,
    siteName: SEO_DEFAULTS.openGraph.siteName,
    images: [
      {
        url: '/images/logo/ishq-gems.png',
        width: 1200,
        height: 630,
        alt: 'Ishq Gems - Luxury Gems & Jewelry Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_DEFAULTS.defaultTitle,
    description: SEO_DEFAULTS.description,
    images: ['/images/logo/ishq-gems.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script 
          src="/cache-patch.js" 
          strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme={THEME_CONFIG.defaultTheme}
          enableSystem={THEME_CONFIG.enableSystem}
          storageKey={THEME_CONFIG.storageKey}
        >
          <AuthProvider>
            <WebSocketBiddingProvider>
              <UIProvider>
                <CursorGlow
                  size={200}
                  blur={80}
                  duration={300}
                />
                <ServiceWorkerRegistration />
                <RouteTracker />
                {children}
              </UIProvider>
            </WebSocketBiddingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
