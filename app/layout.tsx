import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Ecommerce",
    template: "%s | Ecommerce",
  },
  description:
    "A modern full-stack ecommerce store built with Next.js.",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col bg-white">
          <Header />

          <div className="flex-1">
            {children}
          </div>

          <Footer />
        </div>
      </body>
    </html>

  );
}
