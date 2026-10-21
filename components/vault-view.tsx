"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJson, type Pull } from "@/lib/api";
import { short, solscanAccount, solscanTx, usd } from "@/lib/format";

export const VaultView = () => {
  const [cards, setCards] = useState<Pull[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const body = await getJson<{ cards: Pull[] }>("/v1/vault");
        setCards(body.cards);
        setOffline(false);
      } catch {
        setOffline(true);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="px-6 py-8 md:px-12">
      <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-acc">Vault</h1>
      <p className="mt-3 max-w-xl text-mute">Every card pulled. Image, grade, insured value, coin, and winner.</p>
      {offline ? <p className="mt-8 text-mute">The vault loads from the server. Cards show up here when it answers.</p> : null}
      {cards && cards.length === 0 ? <p className="mt-8 text-mute">No cards yet. Image, grade, insured value, coin, and winner show up here.</p> : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(cards || []).map((card) => (
          <li key={card.id} className="border border-line p-4">
            {card.image ? (
              <img src={card.image} alt={card.name || card.grade} className="mb-3 aspect-[63/88] w-full object-contain" />
            ) : (
              <p className="mb-3 text-sm text-mute">The card image lands with the pull.</p>
            )}
            <p className="font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-acc">{card.grade}</p>
            <p className="mt-2 font-mono text-sm">{usd(card.insuredUsd)}</p>
            <p className="mt-2 text-sm">
              <Link href={`/coin/${card.mint}`} className="font-extrabold">
                ${card.symbol}
              </Link>
            </p>
            <p className="mt-1 font-mono text-xs text-mute">
              {card.winner ? <a href={solscanAccount(card.winner)}>{short(card.winner)}</a> : "Winner pending"}
            </p>
            <p className="mt-2 font-mono text-xs">
              {card.transferSignature ? <a href={solscanTx(card.transferSignature)}>Transfer</a> : null}{" "}
              {card.paySignature ? <a href={solscanTx(card.paySignature)}>Pack</a> : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
