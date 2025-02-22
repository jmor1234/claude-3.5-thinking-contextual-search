// app/layout.tsx

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { GeistSans } from 'geist/font/sans'
import { Header } from "@/components/ui/layout/Header";
const fontSans = GeistSans

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Thinking Contextual Search",
  description: "Claude Thinking Contextual Search",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className={`${fontSans.className} ${geistMono.variable} antialiased min-h-full flex flex-col`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="fundamentals-theme"
          >
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
  );
}
