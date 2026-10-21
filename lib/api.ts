export type Coin = {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  xUrl: string | null;
  websiteUrl: string | null;
  holders: number;
  pulls: number;
  vaultUsd: number;
  packBalanceUsdc: number;
  packPriceUsdc: number;
  etaMs: number | null;
  createdAt: string;
};

export type Pull = {
  id: string;
  mint: string;
  symbol: string;
  grade: string;
  rarity: string | null;
  winner: string | null;
  nft: string | null;
  name: string | null;
  image: string | null;
  insuredUsd: number | null;
  transferSignature: string | null;
  openSignature: string | null;
  paySignature: string | null;
  choice: string | null;
  openedAt: string | null;
  createdAt: string;
};

export type RecordRow = {
  id: string;
  memo: string;
  mint: string;
  symbol: string;
  status: string;
  roll: string | null;
  seed: string | null;
  snapshot: { wallet: string; amount: string }[] | null;
  winner: string | null;
  paySignature: string | null;
  openSignature: string | null;
  transferSignature: string | null;
  nft: string | null;
  grade: string | null;
  createdAt: string;
};

export type Stats = {
  cards: number;
  insuredUsd: number;
  coins: number;
  packPriceUsdc: number;
  nextPack: { mint: string | null; symbol: string | null; etaMs: number | null; balanceUsdc: number; priceUsdc: number };
};

export const getJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, { ...init, cache: "no-store" });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error || "The server did not answer.");
  return body;
};
