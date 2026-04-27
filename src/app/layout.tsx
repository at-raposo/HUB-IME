import type { Metadata } from "next";
import { Open_Sans, Outfit } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Script from "next/script";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: 'swap',
});

const bukraFallback = Outfit({
  variable: "--font-bukra",
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '700', '900'],
});

const materialSymbols = localFont({
  src: '../../node_modules/material-symbols/material-symbols-outlined.woff2',
  variable: '--font-material-symbols',
  display: 'swap',
  weight: '100 700',
  style: 'normal',
});

import { LazyMotion, domAnimation } from "framer-motion";

import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { ReadingExperienceProvider } from "@/components/reading/ReadingExperienceProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import { ClientPwaManager } from "@/components/pwa/ClientPwaManager";
import { SkipLink } from "@/components/ui/SkipLink";
import { AuthProvider } from "@/providers/AuthProvider";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { createServerSupabase } from "@/lib/supabase/server";
import { TelemetryManager } from "@/components/telemetry/TelemetryManager";

/**
 * V4.0.0 Layout - Protocol Apocalypse Certified
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'),
  title: "Hub de Comunicação Científica - HUB IME USP",
  description: "Um projeto para melhorar a comunicação do IME USP e reunir em um FLUXO interativo o arquivo de material de divulgação do HUB IME e de toda a comunidade — de dentro e fora do instituto.",
  openGraph: {
    title: "Hub de Comunicação Científica - HUB IME USP",
    description: "O hub oficial de comunicação científica do Instituto de Matemática e Estatística da USP (IME USP).",
    images: ['/api/og?title=Hub%20de%20Comunicação%20Científica&category=IME'],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "hub-ime",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || '';
  const htmlClass = theme === 'dark' ? 'dark' : '';

  const impersonatedId = cookieStore.get('admin_impersonating_id')?.value;
  let impersonatedName = '';

  if (impersonatedId) {
    const supabase = await createServerSupabase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', impersonatedId)
      .single();
    impersonatedName = profile?.full_name || profile?.username || '';
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning className={htmlClass}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://bqszadfunqgtfpaorwvx.supabase.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  const buildId = "${process.env.NEXT_PUBLIC_BUILD_ID || 'v3-golden'}";
                  navigator.serviceWorker.register('/sw.js?id=' + buildId).then(function(registration) {
                    // Registration successful
                  }, function(err) {
                    // Registration failed
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${openSans.variable} ${bukraFallback.variable} ${materialSymbols.variable} font-open-sans selection:bg-brand-yellow selection:text-brand-blue bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-200 antialiased`}
        suppressHydrationWarning
      >
        <LazyMotion features={domAnimation}>
          <AuthProvider>
            <ReadingExperienceProvider>
              <SearchProvider>
                <Toaster position="top-right" toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1E1E1E',
                    color: '#fff',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                  }
                }} />
                <ClientPwaManager />
                <ReadingProgressBar />
                <SkipLink />
                <TelemetryManager />
                {/* Microsoft Clarity */}
                {process.env.NEXT_PUBLIC_CLARITY_ID && (
                    <Script
                      id="microsoft-clarity"
                      strategy="afterInteractive"
                      dangerouslySetInnerHTML={{
                        __html: `
                          (function(c,l,a,r,i,t,y){
                              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                          })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
                        `,
                      }}
                    />
                )}


                {impersonatedId && <ImpersonationBanner impersonatedName={impersonatedName} />}

                {children}
              </SearchProvider>
            </ReadingExperienceProvider>
          </AuthProvider>
        </LazyMotion>
      </body>
    </html>
  );
}
