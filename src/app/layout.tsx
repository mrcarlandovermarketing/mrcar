import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Chatbot } from '@/components/chatbot/Chatbot';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mr. Car Automotive Group | Importación de Vehículos EE. UU.',
  description: 'Encuentra vehículos confiables, precios competitivos y asesoramiento en español. Tu próximo auto está más cerca de lo que imaginas con Mr. Car.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        
        {/* Responsive Navigation Header */}
        <Header />

        {/* Page Content area */}
        <div className="flex-grow flex flex-col">
          {children}
        </div>

        {/* Floating Simulated Chatbot Assistant */}
        <Chatbot />

        {/* Site Footer */}
        <Footer />

      </body>
    </html>
  );
}
