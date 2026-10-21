"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dialogue, PageHead } from "@/components/ui";
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
    <div className="px-6 py-10 md:px-12">
      <PageHead kicker="PUBLIC DRAWS" title="Records">
        Every pack. Memo, roll, seed, snapshot, and winner, so the draw can be checked.
      </PageHead>
      {!records && !offline ? (
        <div className="mt-8 max-w-3xl">
          <Dialogue>Records load from the server.</Dialogue>
        </div>
      ) : null}
      {offline ? (
        <div className="mt-8 max-w-3xl">
          <Dialogue>Records load from the server. They show up here when it answers.</Dialogue>
        </div>
      ) : null}
      {records && records.length === 0 ? (
        <div className="mt-8 max-w-3xl">
          <Dialogue>No packs yet. Memo, roll, seed, snapshot, and winner show up here.</Dialogue>
        </div>
      ) : null}
      <ul className="mt-8 grid max-w-4xl gap-4">
        {(records || []).map((record) => (
          <li key={record.id} id={record.memo}>
            <Dialogue plain>
              <p className="font-[family-name:var(--font-pixel)] text-[11px] leading-loose">
                <Link href={`/coin/${record.mint}`} className="text-acc">
                  ${record.symbol}
                </Link>{" "}
                <span className="text-[#eee]">{record.grade || record.status}</span>
              </p>
              <dl className="mt-3 grid gap-1 font-mono text-xs leading-6 text-[#bbb]">
                <div>Memo {record.memo}</div>
                <div>Roll {record.roll || "Pending"}</div>
                <div className="break-all">Seed {record.seed || "Pending"}</div>
                <div>Snapshot {record.snapshot?.length ? `${record.snapshot.length} holders` : "Pending"}</div>
                {record.snapshot?.length ? (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-acc">Holder list</summary>
                    <ul className="mt-1 max-h-40 overflow-auto text-[#888]">
                      {record.snapshot.map((holder) => (
                        <li key={holder.wallet}>
                          {holder.wallet} {holder.amount}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                <div>
                  Winner{" "}
                  {record.winner ? (
                    <a href={solscanAccount(record.winner)} className="text-[#eee] hover:text-acc">
                      {short(record.winner)}
                    </a>
                  ) : (
                    "Pending"
                  )}
                </div>
                <div>
                  {record.paySignature ? (
                    <a href={solscanTx(record.paySignature)} className="hover:text-acc">
                      Payment
                    </a>
                  ) : (
                    "Payment pending"
                  )}
                  {" · "}
                  {record.openSignature ? (
                    <a href={solscanTx(record.openSignature)} className="hover:text-acc">
                      Open
                    </a>
                  ) : (
                    "Open pending"
                  )}
                  {" · "}
                  {record.transferSignature ? (
                    <a href={solscanTx(record.transferSignature)} className="hover:text-acc">
                      Transfer
                    </a>
                  ) : (
                    "Transfer pending"
                  )}
                </div>
              </dl>
            </Dialogue>
          </li>
        ))}
      </ul>
    </div>
  );
};
