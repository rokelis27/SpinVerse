import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono, Orbitron, Pacifico } from "next/font/google";
import { UpgradeModalProvider } from '@/components/providers/UpgradeModalProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import { Analytics } from '@vercel/analytics/react';
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
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${pacifico.variable} antialiased`}
        >
          <UserProvider>
            <UpgradeModalProvider>
              {children}
            </UpgradeModalProvider>
          </UserProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
