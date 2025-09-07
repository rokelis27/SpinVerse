import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono, Orbitron, Pacifico } from "next/font/google";
import { UpgradeModalProvider } from '@/components/providers/UpgradeModalProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import { TermsModalProvider } from '@/components/providers/TermsModalProvider';
import { Analytics } from '@vercel/analytics/react';
import { Footer } from '@/components/ui/Footer';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "SpinVerse - Interactive Story Creator",
  description: "Transform spinning wheels into shareable stories with auto-advancing themed sequences and AI-powered narrative generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#8B5CF6' },
        elements: {
          // Style the captcha container if it appears
          captcha: {
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            border: '1px solid #374151'
          }
        },
        captcha: {
          theme: 'dark',
          size: 'flexible',
          language: 'en-US'
        }
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || '/'}
      signUpForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/'}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${pacifico.variable} antialiased`}
        >
          {/* Termly Consent Management Platform */}
          <Script
            src="https://app.termly.io/embed.min.js"
            data-auto-block="functional"
            data-website-uuid="a2d3cedf-857c-48bf-9994-a70c4d3560cc"
            data-allow-list="*.clerk.accounts.dev,*.clerk.dev,accounts.dev,*.recaptcha.net,*.google.com,*.gstatic.com,*.cloudflare.com,challenges.cloudflare.com,*.cf-challenge.com"
            strategy="afterInteractive"
          />
          <UserProvider>
            <TermsModalProvider>
              <UpgradeModalProvider>
                {children}
                <Footer />
              </UpgradeModalProvider>
            </TermsModalProvider>
          </UserProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
