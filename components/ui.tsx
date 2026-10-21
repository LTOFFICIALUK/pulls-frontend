import type { ReactNode } from "react";
import { Mark } from "@/components/mark";

export const TEAR =
  "polygon(0 0,5% 100%,10% 0,15% 100%,20% 0,25% 100%,30% 0,35% 100%,40% 0,45% 100%,50% 0,55% 100%,60% 0,65% 100%,70% 0,75% 100%,80% 0,85% 100%,90% 0,95% 100%,100% 0)";

export const fieldClass =
  "w-full rounded-[10px] border border-[#333] bg-black px-3 py-3 text-ink outline-none placeholder:text-[#555]";

export const PageHead = ({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) => (
  <header>
    <p className="font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-acc">▶ {kicker}</p>
    <h1 className="mt-4 font-[family-name:var(--font-pixel)] text-xl leading-relaxed text-ink md:text-[28px]">{title}</h1>
    {children ? <p className="mt-4 max-w-xl text-lg leading-snug text-mute">{children}</p> : null}
  </header>
);

export const Dialogue = ({ children, plain = false }: { children: ReactNode; plain?: boolean }) => (
  <div
    className={
      plain
        ? "border-[3px] border-[#eee] bg-[#0a0a0a] p-4 text-base leading-relaxed text-[#eee] shadow-[inset_0_0_0_3px_#000,inset_0_0_0_5px_#555]"
        : "border-[3px] border-[#eee] bg-[#0a0a0a] p-4 font-[family-name:var(--font-pixel)] text-[11px] leading-loose text-[#eee] shadow-[inset_0_0_0_3px_#000,inset_0_0_0_5px_#555]"
    }
  >
    {children}
  </div>
);

export const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="border border-line border-t-[3px] border-t-acc bg-black p-4">
    <p className="font-[family-name:var(--font-pixel)] text-[10px] text-acc">{label}</p>
    <p className="mt-3 font-mono text-xl text-ink md:text-2xl">{value}</p>
    {hint ? <p className="mt-1 font-mono text-xs text-mute">{hint}</p> : null}
  </div>
);

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="grid gap-2">
    <span className="font-[family-name:var(--font-pixel)] text-[10px] text-acc">{label}</span>
    {children}
    {hint ? <span className="text-sm leading-snug text-mute">{hint}</span> : null}
  </label>
);

export const PackFace = ({ title = "pulls", caption = "1 GRADED SLAB INSIDE" }: { title?: string; caption?: string }) => (
  <div className="relative h-[390px] w-[270px] -rotate-6 overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#1a1a1a,#2c2c2c_40%,#111)] shadow-[0_30px_80px_rgba(0,0,0,.8),inset_0_0_0_2px_#333]">
    <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,.05)_18px_20px)]" />
    <div className="relative h-[26px] bg-[repeating-linear-gradient(90deg,#3a3a3a_0_6px,#222_6px_12px)]" />
    <div className="absolute left-0 right-0 top-[26px] h-[14px] bg-acc" style={{ clipPath: TEAR }} />
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Mark className="h-[100px] w-[90px]" />
      <span className="text-[30px] font-extrabold leading-none">{title}</span>
      <span className="font-mono text-xs text-[#888]">{caption}</span>
    </div>
  </div>
);

export const Slab = ({
  grade,
  note,
  image,
  alt,
}: {
  grade: string;
  note?: string;
  image?: string | null;
  alt?: string;
}) => (
  <article className="rounded-[10px] bg-[linear-gradient(160deg,#e9e9ea,#bdbdc2)] p-[7px] shadow-[0_18px_40px_rgba(0,0,0,.6),inset_0_0_0_1px_rgba(255,255,255,.6)]">
    <div className="flex items-center justify-between gap-1.5 rounded border-t-[3px] border-acc bg-white px-1.5 py-1 font-mono text-[9px] text-[#111]">
      <span className="truncate">{grade}</span>
      <span className="shrink-0 text-[#666]">{note || "GRADED"}</span>
    </div>
    <div className="relative mt-[7px] aspect-[63/88] overflow-hidden rounded border-[5px] border-[#f3e7a6] bg-black">
      {image ? (
        <img src={image} alt={alt || grade} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Mark className="h-16 w-14" />
        </div>
      )}
    </div>
  </article>
);
