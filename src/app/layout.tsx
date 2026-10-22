import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { profile } from "@/content/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const title = `${profile.name} · ${profile.role}`;
const description = `${profile.intro} ${profile.statement}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://tathagat.xyz"),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: `${profile.name}'s observatory` },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <head>
        {/* marks JS availability so the semantic fallback can be visually hidden */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col grain">{children}</body>
    </html>
  );
}
