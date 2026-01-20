"use client";

import type { Metadata } from "next";
import { Inter, Outfit, Great_Vibes, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "./store";
import VerificationBanner from "./components/VerificationBanner";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${greatVibes.variable} ${dancingScript.variable} antialiased bg-background-dark text-slate-100 selection:bg-primary/30`}
      >
        {/* Animated background overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-starfield opacity-40"></div>
        </div>

        <Provider store={store}>
          <VerificationBanner />
          {children}
        </Provider>
      </body>
    </html>
  );
}
