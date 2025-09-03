import {withSentryConfig} from '@sentry/nextjs';
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
                wss://clerk.com
                https://*.sentry.io
                https://o4509957944377344.ingest.de.sentry.io;
              worker-src 'self' blob:;
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
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "spinverse",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});