import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const script = localFont({
  src: "./fonts/GreatVibes-latin.woff2",
  variable: "--font-script",
  display: "swap",
  weight: "400",
});

const body = localFont({
  src: "./fonts/Quicksand-latin.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "300 700",
});

export const metadata: Metadata = {
  title: "Happy Birthday Khushi 🌷 | A Fairy Land Made With Love",
  description:
    "An enchanted 3D fairy land built for Khushi's birthday — touch the animals, bloom the tulips and find the secret in the castle's deepest room.",
};

export const viewport: Viewport = {
  themeColor: "#ff6fa5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${body.variable}`}>
      <body className="font-body bg-[#fff0f6] text-rose-950 antialiased">{children}</body>
    </html>
  );
}
