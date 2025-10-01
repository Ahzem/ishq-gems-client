import type { NextConfig } from "next";
import { apiConfig, environment } from '@/config/environment';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience and catching issues
  reactStrictMode: true,

  // Compress pages for better performance (SWC minification is enabled by default in Next.js 15+)
  compress: true,

  // Environment-aware API rewrites
  async rewrites() {
    const apiUrl = environment.isProduction 
      ? apiConfig.baseUrl.replace('/api', '') || 'https://34.229.40.129:5000'
      : 'http://localhost:5000';
    
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },
  // Configure security headers and service worker
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
    ];

    return [
      // Apply security headers to all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Service worker specific headers
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          ...securityHeaders,
        ],
      },
    ];
  },
  // Configure external image domains and optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ishq-gems.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Enable optimization in production, disable only in development if needed
    unoptimized: process.env.NODE_ENV === 'development',
    // Add device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Production optimizations and experimental features
  experimental: {
    proxyTimeout: 60000, // 60 seconds for file uploads
    optimizeServerReact: true, // Optimize React for server-side rendering
    // Note: optimizeCss removed due to deprecated critters dependency
  },

  // TypeScript configuration
  typescript: {
    // Don't ignore build errors in production
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Don't ignore ESLint errors during builds
    ignoreDuringBuilds: false,
  },

  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // Server runtime configuration (deprecated in favor of environment variables)
  serverRuntimeConfig: {
    imageOptimizationTimeout: 60000,
  },

  // Output configuration for different deployment targets
  ...(process.env.NEXT_OUTPUT === 'standalone' && {
    output: 'standalone',
  }),
};

export default nextConfig;
