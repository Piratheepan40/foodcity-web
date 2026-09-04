import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'FoodCity POS & Inventory Management System',
  description: 'Lightweight, modern POS and inventory application built with NestJS, Next.js and Prisma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors theme="system" closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

