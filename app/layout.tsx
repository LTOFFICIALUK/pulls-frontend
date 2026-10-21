import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { Shell } from "@/components/shell";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });
const sans = Inter_Tight({ weight: ["500", "700", "800"], subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ weight: "500", subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://getpulls.fun"),
  title: { default: "Pulls", template: "%s · Pulls" },
  description: "Open packs, not charts.",
  openGraph: {
    title: "Pulls",
    description: "Open packs, not charts.",
    url: "https://getpulls.fun",
    siteName: "Pulls",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@getpullsfun",
    title: "Pulls",
    description: "Open packs, not charts.",
    images: ["/og.png"],
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${pixel.variable} ${sans.variable} ${mono.variable}`}>
    <body>
      <WalletProvider>
        <Shell ca={process.env.NEXT_PUBLIC_PULLS_CA || ""}>{children}</Shell>
      </WalletProvider>
    </body>
  </html>
);

export default RootLayout;
