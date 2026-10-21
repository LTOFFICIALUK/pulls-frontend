"use client";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getJson, type Coin, type Pull } from "@/lib/api";
import { Dialogue, PackFace, PageHead, Slab, Stat } from "@/components/ui";
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
  const [offline, setOffline] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    try {
      const body = await getJson<{ coin: Coin; pulls: Pull[] }>(`/v1/coins/${mint}`);
      setCoin(body.coin);
      setPulls(body.pulls);
      setMissing(false);
      setOffline(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("not launched")) {
        setMissing(true);
        setOffline(false);
        return;
      }
      setOffline(true);
      setMissing(false);
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

  if (offline) {
    return (
      <div className="px-6 py-16 md:px-12">
        <PageHead kicker="PAIRED WITH CARDS" title="This coin loads from the server.">
          Holders, pulls, and the next pack show up here when it answers.
        </PageHead>
      </div>
    );
  }
  if (missing) {
    return (
      <div className="px-6 py-16 md:px-12">
        <PageHead kicker="NOT ON THE BOARD" title="This coin was not launched here.">
          Coins paired with CARDS show up with holders, pulls, and the next pack.
        </PageHead>
      </div>
    );
  }
  if (!coin) {
    return (
      <div className="px-6 py-16 md:px-12">
        <Dialogue>This coin loads from the server.</Dialogue>
      </div>
    );
  }

  const newest = pulls.find((pull) => pull.image) || null;

  return (
    <div className="px-6 py-10 md:px-12">
      <p className="font-mono text-xs text-mute">
        <Link href="/" className="hover:text-acc">
          pulls
        </Link>
        {" · "}${coin.symbol}
      </p>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <PageHead kicker="PAIRED WITH CARDS" title={`$${coin.symbol}`}>
            {coin.description || coin.name}
          </PageHead>
          <p className="mt-4 break-all font-mono text-xs text-mute">
            <a href={solscanToken(coin.mint)} className="hover:text-acc">
              {coin.mint}
            </a>
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Holders" value={String(coin.holders)} />
            <Stat label="Pulls" value={String(coin.pulls)} />
            <Stat label="Vault" value={usd(coin.vaultUsd)} />
            <Stat
              label="Next pack"
              value={`${usd(coin.packBalanceUsdc)} / ${usd(coin.packPriceUsdc)}`}
              hint={countdown(coin.etaMs) || "When fees cover a pack"}
            />
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          {newest?.image ? (
            <div className="w-[220px]">
              <Slab grade={newest.grade} note={`$${coin.symbol}`} image={newest.image} alt={newest.name || newest.grade} />
            </div>
          ) : (
            <PackFace caption={`$${coin.symbol}`} />
          )}
        </div>
      </div>
      <h2 className="mt-12 font-[family-name:var(--font-pixel)] text-xs text-acc">PULLS</h2>
      {pulls.length === 0 ? (
        <div className="mt-4 max-w-3xl">
          <Dialogue>No pulls for this coin yet. The card, winner, and transaction show up here after the first rip.</Dialogue>
        </div>
      ) : (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pulls.map((pull) => {
            const mine = wallet.address && pull.winner === wallet.address && !pull.choice;
            return (
              <li key={pull.id}>
                <Slab grade={pull.grade} note={`$${coin.symbol}`} image={pull.image} alt={pull.name || pull.grade} />
                <p className="mt-3 font-mono text-sm text-acc">{usd(pull.insuredUsd)} insured</p>
                <p className="mt-1 font-mono text-xs text-mute">
                  Winner{" "}
                  {pull.winner ? (
                    <a href={solscanAccount(pull.winner)} className="hover:text-ink">
                      {short(pull.winner)}
                    </a>
                  ) : (
                    "Pending"
                  )}
                </p>
                <p className="mt-1 font-mono text-xs text-[#777]">
                  {pull.transferSignature ? (
                    <a href={solscanTx(pull.transferSignature)} className="hover:text-acc">
                      Transfer
                    </a>
                  ) : (
                    "Transfer pending"
                  )}
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
      {note ? (
        <div className="mt-4 max-w-3xl">
          <Dialogue plain>{note}</Dialogue>
        </div>
      ) : null}
    </div>
  );
};
