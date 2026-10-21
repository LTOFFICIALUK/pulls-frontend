"use client";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getJson } from "@/lib/api";
import { useWallet } from "@/lib/wallet";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));

const decode = (b64: string) => {
  const raw = bytes(b64);
  try {
    return Transaction.from(raw);
  } catch {
    return VersionedTransaction.deserialize(raw);
  }
};

const encode = (tx: Transaction | VersionedTransaction) => {
  const raw = tx instanceof VersionedTransaction ? tx.serialize() : tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  let binary = "";
  raw.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const LaunchForm = () => {
  const wallet = useWallet();
  const router = useRouter();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [devBuy, setDevBuy] = useState("");
  const [vanity, setVanity] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleLaunch = async () => {
    setNote("");
    if (!wallet.address) {
      await wallet.connect();
    }
    const address = wallet.address || window.localStorage.getItem("pulls.wallet");
    if (!address) throw new Error("Connect Phantom to launch.");
    setBusy(true);
    try {
      const built = await getJson<{ launchId: string; mint: string; transactions: { kind: string; tx: string }[] }>("/v1/launch/build", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          name,
          symbol,
          description,
          xUrl,
          image,
          devBuySol: devBuy ? Number(devBuy) : 0,
          vanity,
        }),
      });
      const signed = await wallet.signAll(built.transactions.map((item) => decode(item.tx)));
      const sent = await getJson<{ mint: string }>("/v1/launch/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ launchId: built.launchId, transactions: signed.map(encode) }),
      });
      router.push(`/coin/${sent.mint}`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Launch needs another try.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="mx-auto grid max-w-xl gap-4 px-6 py-10"
      onSubmit={(event) => {
        event.preventDefault();
        void handleLaunch();
      }}
    >
      <h1 className="font-[family-name:var(--font-pixel)] text-xl text-acc md:text-2xl">Launch a coin</h1>
      <p className="text-mute">Paired with CARDS. Creator fees go to the vault and rip graded packs for holders.</p>
      <label className="grid gap-1 text-sm font-bold">
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={32} required className="rounded-[10px] border border-[#333] bg-black px-3 py-3 font-medium" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Ticker
        <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} maxLength={13} required className="rounded-[10px] border border-[#333] bg-black px-3 py-3 font-mono" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Image
        <input type="file" accept="image/png,image/jpeg,image/webp" required onChange={(event) => handleFile(event.target.files?.[0])} className="text-sm font-medium text-mute" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Description
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} className="rounded-[10px] border border-[#333] bg-black px-3 py-3 font-medium" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        X link
        <input value={xUrl} onChange={(event) => setXUrl(event.target.value)} placeholder="https://x.com/" className="rounded-[10px] border border-[#333] bg-black px-3 py-3 font-medium" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Dev buy in SOL
        <input value={devBuy} onChange={(event) => setDevBuy(event.target.value)} inputMode="decimal" placeholder="0" className="rounded-[10px] border border-[#333] bg-black px-3 py-3 font-mono" />
        <span className="font-medium text-mute">Optional. SOL swaps to CARDS, then buys the coin. Extra CARDS stays in your wallet.</span>
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Vanity suffix
        <input value={vanity} onChange={(event) => setVanity(event.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2))} className="rounded-[10px] border border-[#333] bg-black px-3 py-3 font-mono" />
        <span className="font-medium text-mute">Optional. One or two characters at the end of the mint.</span>
      </label>
      <button type="submit" disabled={busy} className="rounded-[10px] bg-acc px-5 py-3.5 font-extrabold text-black disabled:opacity-60">
        {busy ? "Building" : wallet.address ? "Sign and launch" : "Connect Phantom and launch"}
      </button>
      {note ? <p className="text-sm text-acc">{note}</p> : null}
    </form>
  );
};
