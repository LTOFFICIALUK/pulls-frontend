"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mark } from "@/components/mark";
import { getJson, type Coin, type Pull, type Stats } from "@/lib/api";
import { countdown, short, solscanAccount, usd } from "@/lib/format";

const TEAR =
  "polygon(0 0,5% 100%,10% 0,15% 100%,20% 0,25% 100%,30% 0,35% 100%,40% 0,45% 100%,50% 0,55% 100%,60% 0,65% 100%,70% 0,75% 100%,80% 0,85% 100%,90% 0,95% 100%,100% 0)";

export const HomeView = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pulls, setPulls] = useState<Pull[] | null>(null);
  const [coins, setCoins] = useState<Coin[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const [nextStats, nextPulls, nextCoins] = await Promise.all([
          getJson<Stats>("/v1/stats"),
          getJson<{ pulls: Pull[] }>("/v1/pulls"),
          getJson<{ coins: Coin[] }>("/v1/coins"),
        ]);
        if (stop) return;
        setStats(nextStats);
        setPulls(nextPulls.pulls);
        setCoins(nextCoins.coins);
        setOffline(false);
        setReady(true);
      } catch {
        if (!stop) {
          setOffline(true);
          setReady(true);
        }
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const latest = pulls?.find((pull) => pull.image) || null;
  const timer = countdown(stats?.nextPack.etaMs);
  const headline = !stats
    ? "NEXT PACK RIPS WHEN FEES LAND"
    : stats.nextPack.etaMs === 0
      ? "NEXT PACK RIPS THIS CYCLE"
      : timer
        ? `NEXT PACK RIPS IN ${timer}`
        : "NEXT PACK RIPS WHEN FEES LAND";
  const live = (pulls || []).slice(0, 8);

  return (
    <div>
      <div className="overflow-hidden border-y border-line px-6 py-2 font-mono text-xs text-mute md:px-12">
        {offline ? (
          <span>The live board loads from the server. Pulls show up here when it answers.</span>
        ) : !ready ? (
          <span>Pulls load from the server.</span>
        ) : live.length === 0 ? (
          <span>No pulls yet. The first rip shows up here.</span>
        ) : (
          <span>
            LIVE ·{" "}
            {live.map((pull) => (
              <span key={pull.id} className="mr-4">
                <b className="text-acc">${pull.symbol}</b> pulled {pull.grade}
              </span>
            ))}
            {stats?.nextPack.symbol ? <span>next rip {timer || "when the balance covers a pack"}</span> : null}
          </span>
        )}
      </div>

      <section className="grid items-center gap-8 px-6 py-10 md:grid-cols-[1.05fr_1fr] md:px-12 md:py-10">
        <div>
          <p className="font-[family-name:var(--font-pixel)] text-[11px] text-acc md:text-[13px]">▶ {headline}</p>
          <h1 className="my-6 font-[family-name:var(--font-pixel)] text-[28px] leading-[1.25] text-ink md:text-[50px]">
            Open packs,
            <br />
            not charts.
          </h1>
          <p className="max-w-[560px] text-lg leading-snug text-mute md:text-[19px]">
            The launchpad where every coin is paired with CARDS. Creator fees rip real graded packs. Hold the coin, get the pull.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/launch" className="rounded-[10px] bg-acc px-5 py-3.5 font-extrabold text-black">
              Launch a coin
            </Link>
            <Link href="/vault" className="rounded-[10px] border border-[#333] px-5 py-3.5 font-bold">
              See the vault
            </Link>
          </div>
        </div>
        <div className="relative h-[460px] md:h-[520px]">
          <div className="absolute left-1/2 top-10 h-[390px] w-[270px] -translate-x-1/2 -rotate-6 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#1a1a1a,#2c2c2c_40%,#111)] shadow-[0_30px_80px_rgba(0,0,0,.8),inset_0_0_0_2px_#333]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,.05)_18px_20px)]" />
            <div className="h-[26px] bg-[repeating-linear-gradient(90deg,#3a3a3a_0_6px,#222_6px_12px)]" />
            <div className="absolute left-0 right-0 top-[26px] h-[14px] bg-acc" style={{ clipPath: TEAR }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Mark className="h-[100px] w-[90px]" />
              <span className="text-[30px] font-extrabold">pulls</span>
              <span className="font-mono text-xs text-[#888]">1 GRADED SLAB INSIDE</span>
            </div>
          </div>
          {latest?.image ? (
            <div className="absolute right-4 top-0 w-[190px] rotate-[9deg] rounded-[10px] bg-[linear-gradient(160deg,#e9e9ea,#bdbdc2)] p-[7px] shadow-[0_18px_40px_rgba(0,0,0,.6),inset_0_0_0_1px_rgba(255,255,255,.6)]">
              <div className="flex justify-between gap-1.5 rounded border-t-[3px] border-acc bg-white px-1.5 py-1 font-mono text-[9px] text-[#111]">
                <span>{latest.grade}</span>
                <span className="text-[#666]">{latest.symbol}</span>
              </div>
              <img src={latest.image} alt={latest.name || latest.grade} className="mt-[7px] aspect-[63/88] w-full rounded border-[5px] border-[#f3e7a6] object-cover" />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-6 grid gap-3 md:mx-12 md:grid-cols-2">
        {offline || !ready ? (
          <p className="border-[3px] border-[#eee] bg-[#0a0a0a] p-4 font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-[#eee] shadow-[inset_0_0_0_3px_#000,inset_0_0_0_5px_#555] md:col-span-2">
            Live pulls show up here as dialogue boxes.
          </p>
        ) : live.length === 0 ? (
          <p className="border-[3px] border-[#eee] bg-[#0a0a0a] p-4 font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-[#eee] shadow-[inset_0_0_0_3px_#000,inset_0_0_0_5px_#555] md:col-span-2">
            No pulls yet. The first graded card lands in a box like this.
          </p>
        ) : (
          live.slice(0, 4).map((pull) => (
            <div
              key={pull.id}
              className="border-[3px] border-[#eee] bg-[#0a0a0a] p-4 font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-[#eee] shadow-[inset_0_0_0_3px_#000,inset_0_0_0_5px_#555]"
            >
              <b className="font-normal text-acc">${pull.symbol}</b> holders pulled a <b className="font-normal text-acc">{pull.grade}</b>!{" "}
              {pull.winner ? (
                <a href={solscanAccount(pull.winner)} className="text-[#777]">
                  → {short(pull.winner)}
                </a>
              ) : (
                <span className="text-[#777]">→ winner pending</span>
              )}{" "}
              <Link href="/records" className="text-[#777]">
                record
              </Link>
            </div>
          ))
        )}
      </section>

      <section className="mx-6 mt-10 grid gap-3 font-mono text-sm md:mx-12 md:grid-cols-3">
        {[
          ["Cards pulled", stats ? String(stats.cards) : "Pending"],
          ["Insured value", stats ? usd(stats.insuredUsd) : "Pending"],
          ["Coins live", stats ? String(stats.coins) : "Pending"],
        ].map(([label, value]) => (
          <div key={label} className="border border-line p-4">
            <p className="font-[family-name:var(--font-pixel)] text-[10px] text-acc">{label}</p>
            <p className="mt-3 text-2xl text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="mx-6 mt-10 md:mx-12">
        <h2 className="font-[family-name:var(--font-pixel)] text-xs text-acc">COINS</h2>
        {!ready || offline ? (
          <p className="mt-4 text-mute">Coins load from the server. Holders, pulls, vault value, and the next pack show up here.</p>
        ) : (coins || []).length === 0 ? (
          <p className="mt-4 text-mute">No coins yet. The first CARDS launch shows up here with holders, pulls, vault value, and the next pack.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="font-mono text-xs text-mute">
                <tr>
                  <th className="py-2 font-medium">Coin</th>
                  <th className="py-2 font-medium">Holders</th>
                  <th className="py-2 font-medium">Pulls</th>
                  <th className="py-2 font-medium">Vault</th>
                  <th className="py-2 font-medium">Next pack</th>
                </tr>
              </thead>
              <tbody>
                {(coins || []).map((coin) => (
                  <tr key={coin.mint} className="border-t border-line">
                    <td className="py-3">
                      <Link href={`/coin/${coin.mint}`} className="font-extrabold">
                        ${coin.symbol}
                      </Link>
                      <p className="font-mono text-xs text-mute">{short(coin.mint)}</p>
                    </td>
                    <td className="py-3 font-mono">{coin.holders}</td>
                    <td className="py-3 font-mono">{coin.pulls}</td>
                    <td className="py-3 font-mono">{usd(coin.vaultUsd)}</td>
                    <td className="py-3 font-mono text-acc">
                      {usd(coin.packBalanceUsdc)} / {usd(coin.packPriceUsdc)}
                      <span className="mt-1 block text-mute">{countdown(coin.etaMs) || "When fees cover a pack"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
