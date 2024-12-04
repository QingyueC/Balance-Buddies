import { ApplePwaSplash } from '@/app/apple-pwa-splash'

import { ProgressBar } from '@/components/progress-bar'
import { ThemeProvider } from '@/components/theme-provider'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { env } from '@/lib/env'
import { TRPCProvider } from '@/trpc/client'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: {
    default: 'Balanced Expenses with Buddies',
    template: '%s | Balance Buddies',
  },
  description:
    '',
  openGraph: {
    title: 'Balanced Expenses with Buddies',
    description:
      '',
    images: `/banner.png`,
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@scastiel',
    site: '@scastiel',
    images: `/banner.png`,
    title: 'Share Expenses with Friends & Family',
    description:
      '',
  },
  appleWebApp: {
    capable: true,
    title: 'BalanceBuddies',
  },
  applicationName: 'BalanceBuddies',
  icons: [
    {
      url: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      url: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

export const viewport: Viewport = {
  themeColor: '#78B3CE',
}

function Content({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  return (
    <TRPCProvider>
      <header className="fixed top-0 left-0 right-0 h-16 flex justify-between bg-white dark:bg-gray-950 bg-opacity-50 dark:bg-opacity-50 p-2 border-b backdrop-blur-sm z-50">
        <Link
          className="flex items-center gap-2 hover:scale-105 transition-transform"
          href="/"
        >
          <h1>
            <Image
              src="/logo-with-text.png"
              className="m-1 h-auto w-auto"
              width={(35 * 522) / 180}
              height={35}
              alt="BILL"
            />
          </h1>
        </Link>
        <div role="navigation" aria-label="Menu" className="flex">
          <ul className="flex items-center text-sm">
            <li>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="-my-3 text-primary"
              >
                <Link href="/groups">My Groups</Link>
              </Button>
              {/* <Button
                variant="ghost"
                size="sm"
                asChild
                className="-my-3 text-primary"
              >
                <Link href="/groups">Log in</Link>
              </Button> */}
            </li>
          </ul>
        </div>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>

      <footer className="sm:p-8 md:px-16 sm:mt-16 sm:text-sm md:text-base md:mt-12 bg-slate-50 dark:bg-card border-t p-6 mt-8 flex flex-col sm:flex-row sm:justify-between gap-4 text-xs [&_a]:underline">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="sm:text-lg font-semibold text-base flex space-x-2 items-center">
            <Link className="flex items-center gap-2" href="/">
              <Image
                src="/logo-with-text.png"
                className="m-1 h-auto w-auto"
                width={(35 * 522) / 180}
                height={35}
                alt="logo"
              />
            </Link>
          </div>
          <div className="flex flex-col space-y a--no-underline-text-white">
            <Link href="https://www.vt.edu/"><span>Made in Virginia Tech, VA, USA</span></Link>
            <span>
              Built by Software Engineer Team 4
            </span>
            <Link href='mailto:jiren@vt.edu'>Contact Us</Link>
          </div>
        </div>
      </footer>
      <Toaster />
    </TRPCProvider>
  )
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <ApplePwaSplash icon="/logo-with-text.png" color="#78B3CE" />
      <body className="pt-16 min-h-[100dvh] flex flex-col items-stretch bg-slate-50 bg-opacity-30 dark:bg-background">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense>
              <ProgressBar />
            </Suspense>
            <Content>{children}</Content>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
