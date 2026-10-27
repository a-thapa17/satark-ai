import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "Satark AI — Stay Alert. Stay Protected.",
  description:
    "AI-powered scam detection and digital safety intelligence platform built for India. Identify suspicious messages, UPI QR traps, digital arrest threats, and malicious links.",
  keywords: [
    "scam detection",
    "cyber safety",
    "India fraud helpline 1930",
    "UPI scam checker",
    "digital arrest",
    "phishing protection",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var s=sessionStorage.getItem('satark_intro_seen');if(!s&&!r){document.documentElement.classList.add('satark-intro-active');}}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html.satark-intro-active,html.satark-intro-active body{background-color:#141211!important;}html.satark-intro-active #main-homepage-content{opacity:0!important;visibility:hidden!important;pointer-events:none!important;}html.satark-intro-active #satark-intro-overlay{display:flex!important;}`,
          }}
        />
      </head>
      <body className="bg-[#FAF7F2] text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#92400E]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
