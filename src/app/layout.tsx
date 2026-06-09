// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/auth/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});




export const metadata: Metadata = {
  metadataBase: new URL('https://app.famtech.llc'),
  title: 'Famtech App: Smart Farm Management',
  description: 'Manage your crops, livestock, finances, and farm operations in one place with Famtech.',
  openGraph: {
    type: 'website',
    url: 'https://app.famtech.llc',
    siteName: 'Famtech',
    title: 'Famtech App: Smart Farm Management',
    description: 'Manage your crops, livestock, finances, and farm operations in one place with Famtech.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Famtech' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Famtech App: Smart Farm Management',
    description: 'Manage your crops, livestock, finances, and farm operations in one place with Famtech.',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className='bg-white text-gray-800 antialiased'>
        <AuthProvider>
           {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
