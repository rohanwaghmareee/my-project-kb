import type { Metadata, Viewport } from "next";
import { Great_Vibes, Quicksand } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const script = Great_Vibes({
  variable: "--font-script",
  display: "swap",
  weight: "400",
});

const body = Quicksand({
  variable: "--font-body",
  display: "swap",
  weight: ["300", "700"],
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
