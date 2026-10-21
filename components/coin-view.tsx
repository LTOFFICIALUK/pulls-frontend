"use client";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getJson, type Coin, type Pull } from "@/lib/api";
import { countdown, short, solscanAccount, solscanToken, solscanTx, usd } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
const encode = (tx: Transaction | VersionedTransaction) => {
  const raw = tx instanceof VersionedTransaction ? tx.serialize() : tx.serialize();
  let binary = "";
  raw.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const openForCash = (pull: Pull) => {
  if (!pull.openedAt || pull.choice) return false;
  return Date.now() - new Date(pull.openedAt).getTime() < 72 * 60 * 60 * 1000;
};

export const CoinView = ({ mint }: { mint: string }) => {
  const wallet = useWallet();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [missing, setMissing] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    try {
      const body = await getJson<{ coin: Coin; pulls: Pull[] }>(`/v1/coins/${mint}`);
      setCoin(body.coin);
      setPulls(body.pulls);
      setMissing(false);
    } catch {
      setMissing(true);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [mint]);

  const handleKeep = async (pull: Pull) => {
    if (!wallet.address || !pull.nft) return;
    setNote("");
    try {
      const message = await getJson<{ message: string }>(`/v1/packs/${pull.id}/keep-message`);
      const signature = await wallet.signMessage(message.message);
      await getJson(`/v1/packs/${pull.id}/keep`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address, signature }),
      });
      setNote("The card stays with you. Redeem the physical card on Collector Crypt.");
      await load();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Sign again to keep the card.");
    }
  };

  const handleCash = async (pull: Pull) => {
    if (!wallet.address) return;
    setNote("");
    try {
      const built = await getJson<{ transaction: string }>(`/v1/packs/${pull.id}/cashout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address }),
      });
      const raw = bytes(built.transaction);
      const tx = (() => {
        try {
          return Transaction.from(raw);
        } catch {
          return VersionedTransaction.deserialize(raw);
        }
      })();
      const [signed] = await wallet.signAll([tx]);
      await getJson(`/v1/packs/${pull.id}/cashout/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address, signedTransaction: encode(signed) }),
      });
      setNote("Cash out is signed. USDC is on the way to your wallet.");
      await load();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Sign again to cash out.");
    }
  };

  if (missing) return <p className="px-6 py-16 text-mute md:px-12">This coin was not launched here.</p>;
  if (!coin) return <p className="px-6 py-16 text-mute md:px-12">Loading this coin from the server.</p>;

  return (
    <div className="px-6 py-8 md:px-12">
      <p className="font-mono text-xs text-mute">
        <Link href="/">Home</Link> / ${coin.symbol}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-pixel)] text-2xl text-ink md:text-4xl">${coin.symbol}</h1>
      <p className="mt-3 max-w-xl text-mute">{coin.description || coin.name}</p>
      <p className="mt-2 font-mono text-xs text-mute">
        <a href={solscanToken(coin.mint)}>{coin.mint}</a>
      </p>
      <div className="mt-6 grid gap-3 font-mono text-sm md:grid-cols-4">
        <Stat label="Holders" value={String(coin.holders)} />
        <Stat label="Pulls" value={String(coin.pulls)} />
        <Stat label="Vault" value={usd(coin.vaultUsd)} />
        <Stat label="Next pack" value={`${usd(coin.packBalanceUsdc)} / ${usd(coin.packPriceUsdc)}`} hint={countdown(coin.etaMs) || "When fees cover a pack"} />
      </div>
      <h2 className="mt-10 font-[family-name:var(--font-pixel)] text-xs text-acc">PULLS</h2>
      {pulls.length === 0 ? (
        <p className="mt-4 text-mute">No pulls for this coin yet. The card, winner, and transaction show up here after the first rip.</p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {pulls.map((pull) => {
            const mine = wallet.address && pull.winner === wallet.address && !pull.choice;
            return (
              <li key={pull.id} className="border border-line p-4">
                {pull.image ? <img src={pull.image} alt={pull.name || pull.grade} className="mb-3 h-48 w-full object-contain" /> : <p className="mb-3 text-mute">The card image lands with the pull.</p>}
                <p className="font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-acc">{pull.grade}</p>
                <p className="mt-2 font-mono text-sm">{usd(pull.insuredUsd)} insured</p>
                <p className="mt-1 font-mono text-xs text-mute">
                  Winner {pull.winner ? <a href={solscanAccount(pull.winner)}>{short(pull.winner)}</a> : "Pending"}
                </p>
                <p className="mt-1 font-mono text-xs">
                  {pull.transferSignature ? <a href={solscanTx(pull.transferSignature)}>Transfer</a> : "Transfer pending"}
                </p>
                {mine ? (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => void handleKeep(pull)} className="rounded-[10px] bg-acc px-3 py-2 text-sm font-extrabold text-black">
                      Keep
                    </button>
                    {openForCash(pull) ? (
                      <button type="button" onClick={() => void handleCash(pull)} className="rounded-[10px] border border-[#333] px-3 py-2 text-sm font-bold">
                        Cash out
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {pull.choice === "keep" ? <p className="mt-2 text-sm text-mute">Kept. Redeem the physical card on Collector Crypt.</p> : null}
                {pull.choice === "cashout" ? <p className="mt-2 text-sm text-mute">Cashed out.</p> : null}
              </li>
            );
          })}
        </ul>
      )}
      {note ? <p className="mt-4 text-sm text-acc">{note}</p> : null}
    </div>
  );
};

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="border border-line p-3">
    <p className="font-[family-name:var(--font-pixel)] text-[10px] text-acc">{label}</p>
    <p className="mt-2 text-ink">{value}</p>
    {hint ? <p className="text-mute">{hint}</p> : null}
  </div>
);
