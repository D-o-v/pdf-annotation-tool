
import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Signer & Annotator',
  description: 'Advanced PDF annotation and signing tool',
  icons: {
    icon: '/icons/logo.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body 
        className={`
          ${inter.className} 
          bg-gradient-to-br 
          from-indigo-50 
          via-white 
          to-blue-50 
          text-gray-900 
          selection:bg-indigo-200 
          selection:text-indigo-900
        `}
      >
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="w-full py-4 px-4 sm:px-6  bg-white/60 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center space-x-4 group"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="w-8 h-8 text-indigo-600 group-hover:text-indigo-700 transition-colors"
                >
                  <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H4"/>
                  <polyline points="12 2 12 8 18 8"/>
                  <line x1="9" x2="15" y1="13" y2="13"/>
                  <line x1="9" x2="15" y1="17" y2="17"/>
                </svg>
                <h1 className="text-xl font-bold text-gray-800 group-hover:text-indigo-800 transition-colors">
                  Document Signer
                </h1>
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow w-full">
              {children}
          </main>

          <Footer/>

        </div>
      </body>
    </html>
  )
}