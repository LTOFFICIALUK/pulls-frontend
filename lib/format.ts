export const short = (value: string | null | undefined) => {
  if (!value) return "Pending";
  if (value.length <= 10) return value;
  return `${value.slice(0, 4)}…${value.slice(-3)}`;
};

export const usd = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return "Pending";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
};

export const countdown = (etaMs: number | null | undefined) => {
  if (etaMs == null) return null;
  if (etaMs <= 0) return "THIS CYCLE";
  const total = Math.ceil(etaMs / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const solscanTx = (signature: string) => `https://solscan.io/tx/${signature}`;
export const solscanAccount = (address: string) => `https://solscan.io/account/${address}`;
export const solscanToken = (mint: string) => `https://solscan.io/token/${mint}`;
