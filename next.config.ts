import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error for critical errors
    } : false
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' 
                https://js.stripe.com 
                https://checkout.stripe.com 
                https://maps.googleapis.com
                https://*.clerk.accounts.dev
                https://*.clerk.com
                https://clerk.spinverse.fun;
              style-src 'self' 'unsafe-inline' 
                https://fonts.googleapis.com;
              img-src 'self' data: https: blob:
                https://images.clerk.dev
                https://www.gravatar.com;
              font-src 'self' 
                https://fonts.gstatic.com;
              connect-src 'self' 
                https://api.openai.com 
                https://api.stripe.com 
                https://checkout.stripe.com
                https://*.clerk.accounts.dev
                https://*.clerk.com
                https://clerk.spinverse.fun
                https://api.resend.com
                wss://clerk.com;
              frame-src 'self' 
                https://js.stripe.com 
                https://checkout.stripe.com
                https://*.clerk.accounts.dev
                https://*.clerk.com
                https://clerk.spinverse.fun;
              frame-ancestors 'none';
              form-action 'self' https://checkout.stripe.com;
              object-src 'none';
              base-uri 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
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
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), location=(), interest-cohort=()'
          }
        ]
      }
    ];
  },

  // Security optimizations
  poweredByHeader: false,
  
  // Image optimization security
  images: {
    domains: ['images.clerk.dev', 'www.gravatar.com'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
};

export default nextConfig;
