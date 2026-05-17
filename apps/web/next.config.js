const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https://vercel.live https://*.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://*.whatsapp.net https://*.fbcdn.net https://placehold.co https://ui-avatars.com;
    font-src 'self' data:;
    connect-src 'self' http://localhost:5000 https://ecomplus-api.onrender.com https://*.supabase.co wss://*.supabase.co ws: wss: blob: data: https://vercel.live;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests;' : ''}
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
