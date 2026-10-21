"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dialogue, PackFace, PageHead, Slab } from "@/components/ui";
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

  const waiting = offline || !cards || cards.length === 0;

  return (
    <div className="px-6 py-10 md:px-12">
      <PageHead kicker="REAL CARDS ONLY" title="Vault">
        Every card pulled. Image, grade, insured value, coin, and winner.
      </PageHead>
      {!cards && !offline ? (
        <div className="mt-8 max-w-3xl">
          <Dialogue>The vault loads from the server.</Dialogue>
        </div>
      ) : null}
      {offline ? (
        <div className="mt-8 max-w-3xl">
          <Dialogue>The vault loads from the server. Cards show up here when it answers.</Dialogue>
        </div>
      ) : null}
      {cards && cards.length === 0 ? (
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[270px_1fr]">
          <div className="flex justify-center lg:justify-start">
            <PackFace caption="WAITING ON FEES" />
          </div>
          <Dialogue>No cards yet. Image, grade, insured value, coin, and winner show up here.</Dialogue>
        </div>
      ) : null}
      {!waiting ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(cards || []).map((card) => (
            <li key={card.id}>
              <Link href={`/coin/${card.mint}`} className="block" aria-label={`$${card.symbol} ${card.grade}`}>
                <Slab grade={card.grade} note={`$${card.symbol}`} image={card.image} alt={card.name || card.grade} />
              </Link>
              <p className="mt-3 font-mono text-sm text-acc">{usd(card.insuredUsd)}</p>
              <p className="mt-1 font-mono text-xs text-mute">
                {card.winner ? (
                  <a href={solscanAccount(card.winner)} className="hover:text-ink">
                    {short(card.winner)}
                  </a>
                ) : (
                  "Winner pending"
                )}
              </p>
              <p className="mt-1 font-mono text-xs text-[#777]">
                {card.transferSignature ? (
                  <a href={solscanTx(card.transferSignature)} className="hover:text-acc">
                    Transfer
                  </a>
                ) : (
                  "Transfer pending"
                )}
                {" · "}
                {card.paySignature ? (
                  <a href={solscanTx(card.paySignature)} className="hover:text-acc">
                    Pack
                  </a>
                ) : (
                  "Pack pending"
                )}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
