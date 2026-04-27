import type { NextConfig } from "next";
// Double-lock: Validate environment variables during Next.js config loading
// import "./src/env.mjs";

const nextConfig: NextConfig = {
  compress: true,
  devIndicators: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'bqszadfunqgtfpaorwvx.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'portal.if.usp.br', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/@sparticuz/chromium/bin/**/*'],
  },
  transpilePackages: ['recharts'],
  async redirects() {
    return [
      { source: '/perfil', destination: '/lab', permanent: true },
      { source: '/dms', destination: '/emaranhamento', permanent: true },
      { source: '/timeline', destination: '/fluxo', permanent: true },
      { source: '/guia', destination: '/manual', permanent: true },
    ];
  },
};

export default nextConfig;
