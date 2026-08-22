import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store/app-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Dayflow - Human Resource Management System',
  description: 'Modern workforce management platform for HR officers and employees.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full flex flex-col antialiased">
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}
