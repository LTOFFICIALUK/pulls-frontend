"use client";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialogue, Field, PackFace, Slab, fieldClass } from "@/components/ui";
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
  const ticker = symbol.trim().toUpperCase();

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
    <div className="grid items-start gap-10 px-6 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-12">
      <div>
        <p className="font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-acc">▶ PAIRED WITH CARDS</p>
        <h1 className="mt-4 font-[family-name:var(--font-pixel)] text-xl leading-relaxed text-ink md:text-[28px]">Launch a coin</h1>
        <p className="mt-4 max-w-md text-lg leading-snug text-mute">Creator fees go to the vault and rip graded packs for holders.</p>
        <div className="mt-10 flex justify-center lg:justify-start">
          {image ? (
            <div className="w-[220px] rotate-[6deg]">
              <Slab grade={ticker ? `$${ticker}` : "COIN"} note="PREVIEW" image={image} alt={name || "Coin image"} />
            </div>
          ) : (
            <PackFace caption={ticker ? `$${ticker}` : "1 GRADED SLAB INSIDE"} />
          )}
        </div>
      </div>
      <form
        className="grid gap-5 border border-line bg-[#0a0a0a] p-5 md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleLaunch();
        }}
      >
        <Field label="Name">
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={32} required className={fieldClass} />
        </Field>
        <Field label="Ticker">
          <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} maxLength={13} required className={`${fieldClass} font-mono`} />
        </Field>
        <Field label="Image">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="text-sm text-mute file:mr-3 file:rounded-[10px] file:border-0 file:bg-acc file:px-3 file:py-2 file:font-extrabold file:text-black"
          />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={4} className={fieldClass} />
        </Field>
        <Field label="X link">
          <input value={xUrl} onChange={(event) => setXUrl(event.target.value)} placeholder="https://x.com/" className={fieldClass} />
        </Field>
        <Field label="Dev buy in SOL" hint="Optional. SOL swaps to CARDS, then buys the coin. Extra CARDS stays in your wallet.">
          <input value={devBuy} onChange={(event) => setDevBuy(event.target.value)} inputMode="decimal" placeholder="0" className={`${fieldClass} font-mono`} />
        </Field>
        <Field label="Vanity suffix" hint="Optional. One or two characters at the end of the mint.">
          <input
            value={vanity}
            onChange={(event) => setVanity(event.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2))}
            className={`${fieldClass} font-mono`}
          />
        </Field>
        <button type="submit" disabled={busy} className="rounded-[10px] bg-acc px-5 py-3.5 font-extrabold text-black disabled:opacity-60">
          {busy ? "Building the pack" : wallet.address ? "Sign and launch" : "Connect Phantom and launch"}
        </button>
        {note ? <Dialogue plain>{note}</Dialogue> : null}
      </form>
    </div>
  );
};
