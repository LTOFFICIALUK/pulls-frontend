"use client";

import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { createContext, useCallback, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

type SolanaProvider = {
  isPhantom?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey?: { toString: () => string } } | void>;
  disconnect?: () => Promise<void>;
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  signAllTransactions?: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array } | Uint8Array>;
  publicKey?: { toString: () => string };
};

type WalletState = {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAll: (txs: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
  signMessage: (message: string) => Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);
const STORAGE = "pulls.wallet";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const read = () => (typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE));

const provider = (): SolanaProvider | null => {
  const w = window as unknown as { phantom?: { solana?: SolanaProvider }; solana?: SolanaProvider };
  return w.phantom?.solana || (w.solana?.isPhantom ? w.solana : null);
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const address = useSyncExternalStore(subscribe, read, () => null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    const phantom = provider();
    if (!phantom) throw new Error("Phantom is not installed in this browser.");
    setConnecting(true);
    try {
      const res = await phantom.connect();
      const next = res?.publicKey?.toString() || phantom.publicKey?.toString();
      if (!next) throw new Error("Phantom did not return an address.");
      new PublicKey(next);
      window.localStorage.setItem(STORAGE, next);
      emit();
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await provider()?.disconnect?.().catch(() => undefined);
    window.localStorage.removeItem(STORAGE);
    emit();
  }, []);

  const ready = useCallback(async () => {
    const phantom = provider();
    if (!phantom) throw new Error("Phantom is not installed in this browser.");
    if (!phantom.publicKey) await phantom.connect();
    return phantom;
  }, []);

  const signAll = useCallback(
    async (txs: (Transaction | VersionedTransaction)[]) => {
      const phantom = await ready();
      const signed: (Transaction | VersionedTransaction)[] = [];
      for (const tx of txs) signed.push(await phantom.signTransaction(tx));
      return signed;
    },
    [ready],
  );

  const signMessage = useCallback(
    async (message: string) => {
      const phantom = await ready();
      if (!phantom.signMessage) throw new Error("Phantom needs to sign this message.");
      const signed = await phantom.signMessage(new TextEncoder().encode(message));
      const bytes = signed instanceof Uint8Array ? signed : signed.signature;
      return bs58.encode(bytes);
    },
    [ready],
  );

  return (
    <WalletContext.Provider value={{ address, connecting, connect, disconnect, signAll, signMessage }}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const value = useContext(WalletContext);
  if (!value) throw new Error("Wallet is missing.");
  return value;
};
