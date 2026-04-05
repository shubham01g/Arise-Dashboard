import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export const metadata = {
  title: 'Arise Transform | Internal Dashboard',
  description: 'Complete internal business management dashboard for Arise Transform — YouTube, Outreach, Clients, Projects',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Sidebar />
        <TopNav />
        <main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
