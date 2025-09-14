import type { Metadata } from "next";
import { Roboto } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/Navbar";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sam Mehrany - Portfolio",
  description: "UI/UX Designer and Creative Technologist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
