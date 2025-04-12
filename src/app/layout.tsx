import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Freewrite - Distraction-free writing app",
  description: "A simple, open-source app to freewrite without distractions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body
        className={`${lato.variable} ${inter.variable} antialiased bg-white`}
        style={{ backgroundColor: "white" }}
      >
        {children}
      </body>
    </html>
  );
}
