import type { Metadata } from "next";
import { Inter, Outfit, Cinzel, Great_Vibes, Dancing_Script } from "next/font/google";
import "./styles/base.css";
import ClientProviders from "./components/ClientProviders";
import VerificationBanner from "./components/VerificationBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
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

export const content: Metadata = {
  title: "Mytherion | Your World, Structured",
  description: "The ultimate platform for worldbuilders and storytellers to structure their lore, characters, and timelines with AI-powered assistance.",
  keywords: ["worldbuilding", "storytelling", "writing", "RPG", "fantasy", "lore"],
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
          />
        {/* Preload Material Symbols font to prevent icon flash */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          as="style"
          />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
          />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${cinzel.variable} ${greatVibes.variable} ${dancingScript.variable} antialiased bg-background-dark text-slate-100 selection:bg-primary/30`}
        suppressHydrationWarning
      >
        <ClientProviders>
          <VerificationBanner />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
