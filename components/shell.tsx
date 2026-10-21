"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Mark } from "@/components/mark";
import { short } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

const links = [
  { href: "/vault", label: "Vault" },
  { href: "/records", label: "Records" },
  { href: "/how", label: "How it works" },
];

export const Shell = ({ ca, children }: { ca: string; children: ReactNode }) => {
  const { address, connect, disconnect, connecting } = useWallet();
  const [copied, setCopied] = useState(false);
  const shown = ca || "Pending";

  const handleCopy = async () => {
    if (!ca) return;
    await navigator.clipboard.writeText(ca);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-ink">
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-12 md:py-[18px]">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Pulls home">
          <Mark className="h-8 w-7" />
          <span className="text-[22px] font-extrabold tracking-tight">pulls</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-bold text-mute">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          {address ? (
            <button type="button" onClick={() => void disconnect()} className="font-mono text-xs text-mute" aria-label="Disconnect wallet">
              {short(address)}
            </button>
          ) : (
            <button type="button" onClick={() => void connect().catch(() => undefined)} className="font-mono text-xs text-acc" aria-label="Connect Phantom">
              {connecting ? "Connecting" : "Connect"}
            </button>
          )}
          <Link href="/launch" className="rounded-[10px] border-2 border-acc px-4 py-2 font-bold text-acc">
            Launch a coin
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-5 font-mono text-xs text-mute md:px-12">
        <a href="https://x.com/getpullsfun" target="_blank" rel="noreferrer" aria-label="Pulls on X">
          X @getpullsfun
        </a>
        <button type="button" onClick={() => void handleCopy()} className="text-left" aria-label="Copy the PULLS contract address">
          $PULLS {shown}
          {copied ? "  copied" : ""}
        </button>
      </footer>
    </div>
  );
};
