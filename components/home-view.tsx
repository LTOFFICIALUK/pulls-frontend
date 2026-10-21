"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dialogue, PackFace, Slab, Stat } from "@/components/ui";
import { getJson, type Coin, type Pull, type Stats } from "@/lib/api";
import { countdown, short, solscanAccount, usd } from "@/lib/format";
import { PULLS_CA } from "@/lib/pulls";

const PullsCard = ({ coin, history }: { coin: Coin | null; history: Pull[] }) => {
  if (!coin) {
    return <Dialogue>The $PULLS pack balance shows up here when the coin is on the board.</Dialogue>;
  }
  const newest = history.find((pull) => pull.image) || null;
  return (
    <article className="border border-line bg-black p-5 md:p-6" aria-labelledby="pulls-card-title">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div>
          <p className="font-[family-name:var(--font-pixel)] text-[11px] text-acc">▶ $PULLS</p>
          <h3 id="pulls-card-title" className="mt-4 font-[family-name:var(--font-pixel)] text-xl leading-relaxed text-ink">
            <Link href={`/coin/${coin.mint}`} className="hover:text-acc">
              ${coin.symbol}
            </Link>
          </h3>
          <p className="mt-4 max-w-xl text-lg leading-snug text-mute">
            Packs come from 10 percent of the fees of every coin launched on Pulls.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat
              label="Pack balance"
              value={`${usd(coin.packBalanceUsdc)} / ${usd(coin.packPriceUsdc)}`}
              hint={countdown(coin.etaMs) || "When fees cover a pack"}
            />
            <Stat label="Holders" value={String(coin.holders)} />
            <Stat label="Pulls" value={String(coin.pulls)} />
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          {newest?.image ? (
            <div className="w-[180px]">
              <Slab grade={newest.grade} note="$PULLS" image={newest.image} alt={newest.name || newest.grade} />
            </div>
          ) : (
            <PackFace caption="$PULLS" />
          )}
        </div>
      </div>
      <h4 className="mt-8 font-[family-name:var(--font-pixel)] text-[10px] text-acc">PULL HISTORY</h4>
      {history.length === 0 ? (
        <div className="mt-4">
          <Dialogue>No $PULLS pulls yet. The card, winner, and grade show up here after the first rip.</Dialogue>
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {history.slice(0, 6).map((pull) => (
            <li key={pull.id} className="flex items-center justify-between gap-3 border border-line px-4 py-3">
              <span className="font-mono text-sm text-acc">{pull.grade}</span>
              {pull.winner ? (
                <a href={solscanAccount(pull.winner)} className="font-mono text-xs text-mute hover:text-ink" aria-label={`Winner ${short(pull.winner)}`}>
                  {short(pull.winner)}
                </a>
              ) : (
                <span className="font-mono text-xs text-mute">Pending</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

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
        <div className="relative mx-auto h-[460px] w-full max-w-[520px] md:h-[520px]">
          <div className="absolute left-1/2 top-10 -translate-x-1/2">
            <PackFace />
          </div>
          {latest?.image ? (
            <div className="absolute right-0 top-0 w-[170px] rotate-[9deg] sm:w-[190px]">
              <Slab grade={latest.grade} note={latest.symbol} image={latest.image} alt={latest.name || latest.grade} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-6 grid gap-3 md:mx-12 md:grid-cols-2">
        {offline || !ready ? (
          <div className="md:col-span-2">
            <Dialogue>Live pulls show up here as dialogue boxes.</Dialogue>
          </div>
        ) : live.length === 0 ? (
          <div className="md:col-span-2">
            <Dialogue>No pulls yet. The first graded card lands in a box like this.</Dialogue>
          </div>
        ) : (
          live.slice(0, 4).map((pull) => (
            <Dialogue key={pull.id}>
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
            </Dialogue>
          ))
        )}
      </section>

      <section className="mx-6 mt-10 grid gap-3 font-mono text-sm md:mx-12 md:grid-cols-3">
        <Stat label="Cards pulled" value={stats ? String(stats.cards) : "Pending"} />
        <Stat label="Insured value" value={stats ? usd(stats.insuredUsd) : "Pending"} />
        <Stat label="Coins live" value={stats ? String(stats.coins) : "Pending"} />
      </section>

      <section className="mx-6 mt-10 md:mx-12">
        <h2 className="font-[family-name:var(--font-pixel)] text-xs text-acc">COINS</h2>
        {!ready || offline ? (
          <div className="mt-4">
            <Dialogue>Coins load from the server. Holders, pulls, vault value, and the next pack show up here.</Dialogue>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <PullsCard
                coin={(coins || []).find((coin) => coin.mint === PULLS_CA) || null}
                history={(pulls || []).filter((pull) => pull.mint === PULLS_CA)}
              />
            </div>
            {(coins || []).filter((coin) => coin.mint !== PULLS_CA).length === 0 ? (
              <div className="mt-4">
                <Dialogue>A coin launched on Pulls shows up here with holders, pulls, vault value, and the next pack.</Dialogue>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto border border-line">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="font-mono text-xs text-mute">
                    <tr>
                      <th className="px-4 py-3 font-medium">Coin</th>
                      <th className="px-4 py-3 font-medium">Holders</th>
                      <th className="px-4 py-3 font-medium">Pulls</th>
                      <th className="px-4 py-3 font-medium">Vault</th>
                      <th className="px-4 py-3 font-medium">Next pack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(coins || [])
                      .filter((coin) => coin.mint !== PULLS_CA)
                      .map((coin) => (
                        <tr key={coin.mint} className="border-t border-line hover:bg-white/[0.03]">
                          <td className="px-4 py-3">
                            <Link href={`/coin/${coin.mint}`} className="font-extrabold hover:text-acc">
                              ${coin.symbol}
                            </Link>
                            <p className="font-mono text-xs text-mute">{short(coin.mint)}</p>
                          </td>
                          <td className="px-4 py-3 font-mono">{coin.holders}</td>
                          <td className="px-4 py-3 font-mono">{coin.pulls}</td>
                          <td className="px-4 py-3 font-mono text-acc">{usd(coin.vaultUsd)}</td>
                          <td className="px-4 py-3 font-mono text-acc">
                            {usd(coin.packBalanceUsdc)} / {usd(coin.packPriceUsdc)}
                            <span className="mt-1 block text-mute">{countdown(coin.etaMs) || "When fees cover a pack"}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
