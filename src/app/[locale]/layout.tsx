import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkyLearners - LMS",
  description: "Get all academic content here",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${hindSiliguri.variable} antialiased min-h-screen bg-background text-foreground flex flex-col`}
        style={{ fontFamily: 'var(--font-inter), var(--font-hind-siliguri), sans-serif' }}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              <main className="w-full flex-grow">
                {children}
              </main>
              <Footer />
              <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' } }} />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
