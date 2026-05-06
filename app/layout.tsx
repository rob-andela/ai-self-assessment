import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const QUIZ_URL = 'https://assess.aipoc.site';

export const metadata: Metadata = {
  title: "AI Archetype Assessment | Andela",
  description: "Are you a Prototyper, Builder, or Scaler? Discover your AI engineering archetype in under 5 minutes.",
  metadataBase: new URL(QUIZ_URL),
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "Discover your AI Engineering Archetype",
    description: "Are you a Prototyper, Builder, or Scaler? A 12-question assessment for AI engineers. Takes less than 5 minutes.",
    url: QUIZ_URL,
    type: "website",
    siteName: "AI Archetype Assessment by Andela",
    locale: "en_US",
    images: [{ url: `${QUIZ_URL}/builder.png`, alt: "AI Archetype Assessment — Prototyper, Builder, or Scaler?" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover your AI Engineering Archetype",
    description: "Are you a Prototyper, Builder, or Scaler? Takes less than 5 minutes.",
    images: [`${QUIZ_URL}/builder.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
