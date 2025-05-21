import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from 'next'

// Import static components directly
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import MobileNav from "@/components/mobile-nav"
import { ClientProviders } from "@/components/client-provider" 

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font display
  preload: true,
})

export const metadata: Metadata = {
  title: "FertiShop - Online Fertilizer Store",
  description: "Boost your harvest with premium fertilizers",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' http://localhost:5000; connect-src 'self' http://localhost:5000; img-src 'self' https://images.pexels.com https://images.unsplash.com data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; font-src 'self' data:;"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
