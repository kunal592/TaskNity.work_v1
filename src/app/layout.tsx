import type {Metadata} from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Toaster as HotToaster } from 'react-hot-toast';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/layout/Sidebar';
import OrgTree from '@/components/layout/OrgTree';
import LeaveRequestButton from '@/components/layout/LeaveRequestButton';

export const metadata: Metadata = {
  title: 'TaskNity.Work',
  description: 'Premium Task Management Frontend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <Sidebar />
          <main className="p-6 pt-20">
            <div className="flex justify-end items-center gap-4 mb-6">
              <OrgTree />
              <LeaveRequestButton />
            </div>
            {children}
          </main>
          <Toaster />
          <HotToaster />
        </AppProvider>
      </body>
    </html>
  );
}
