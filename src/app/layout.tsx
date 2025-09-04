// app/layout.tsx
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/auth/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});




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
