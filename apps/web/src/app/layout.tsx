import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    default: "Ecom Plus Gabon — Sourcing Chine-Gabon",
    template: "%s | Ecom Plus Gabon"
  },
  description: "La plateforme PWA n°1 pour sourcer vos produits en Chine et les faire livrer au Gabon en toute sécurité.",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Ecom Plus Gabon",
    title: "Ecom Plus Gabon — Sourcing Chine-Gabon",
    description: "Sourcez vos produits en Chine et suivez vos colis jusqu'à Libreville.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <FloatingWhatsApp />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
