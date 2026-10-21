"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJson, type RecordRow } from "@/lib/api";
import { short, solscanAccount, solscanTx } from "@/lib/format";

export const RecordsView = () => {
  const [records, setRecords] = useState<RecordRow[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const body = await getJson<{ records: RecordRow[] }>("/v1/records");
        setRecords(body.records);
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
      <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-acc">Records</h1>
      <p className="mt-3 max-w-xl text-mute">Every pack. Memo, roll, seed, snapshot, and winner, so the draw can be checked.</p>
      {offline ? <p className="mt-8 text-mute">Records load from the server. They show up here when it answers.</p> : null}
      {records && records.length === 0 ? (
        <p className="mt-8 text-mute">No packs yet. Memo, roll, seed, snapshot, and winner show up here.</p>
      ) : null}
      <ul className="mt-8 grid gap-4">
        {(records || []).map((record) => (
          <li key={record.id} id={record.memo} className="border border-line p-4 font-mono text-xs leading-6">
            <p>
              <Link href={`/coin/${record.mint}`} className="font-sans text-sm font-extrabold">
                ${record.symbol}
              </Link>{" "}
              <span className="text-acc">{record.grade || record.status}</span>
            </p>
            <p className="text-mute">Memo {record.memo}</p>
            <p>Roll {record.roll || "Pending"}</p>
            <p className="break-all">Seed {record.seed || "Pending"}</p>
            <p>Snapshot {record.snapshot?.length ? `${record.snapshot.length} holders` : "Pending"}</p>
            {record.snapshot?.length ? (
              <details className="mt-1">
                <summary>Holder list</summary>
                <ul className="mt-1 max-h-40 overflow-auto">
                  {record.snapshot.map((holder) => (
                    <li key={holder.wallet}>
                      {holder.wallet} {holder.amount}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            <p>Winner {record.winner ? <a href={solscanAccount(record.winner)}>{short(record.winner)}</a> : "Pending"}</p>
            <p>
              {record.paySignature ? <a href={solscanTx(record.paySignature)}>Payment</a> : "Payment pending"} ·{" "}
              {record.openSignature ? <a href={solscanTx(record.openSignature)}>Open</a> : "Open pending"} ·{" "}
              {record.transferSignature ? <a href={solscanTx(record.transferSignature)}>Transfer</a> : "Transfer pending"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
