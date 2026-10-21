import { Dialogue, PackFace, PageHead } from "@/components/ui";

const steps = [
  "Launch a coin paired with CARDS. Each coin gets its own creator wallet, so its creator fees stay separate.",
  "Every 10 minutes that wallet claims its fees. The vault pays the network fee. Claimed CARDS move to the vault and swap to USDC.",
  "90 percent of each coin stays with that coin and rips packs for its holders. 10 percent goes to the platform.",
  "When a balance covers the cheapest open pack, the vault buys one real graded pack.",
  "One holder wins the card, weighted by balance. Wallets under 0.1 percent of supply sit out. The draw uses the pack payment signature. The holder list and seed stay public on Records.",
  "The winner keeps the card and can redeem the physical one on Collector Crypt, or cashes out within 72 hours.",
];

export const HowView = () => (
  <div className="px-6 py-10 md:px-12">
    <PageHead kicker="SIX STEPS" title="How it works">
      Open packs, not charts. Real cards. Real NFTs. Real USDC.
    </PageHead>
    <div className="mt-10 grid items-start gap-10 xl:grid-cols-[minmax(0,720px)_270px]">
      <ol className="grid gap-3">
        {steps.map((step, index) => (
          <li key={step}>
            <Dialogue plain>
              <p className="font-[family-name:var(--font-pixel)] text-[10px] text-acc">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-3 text-lg leading-snug">{step}</p>
            </Dialogue>
          </li>
        ))}
      </ol>
      <div className="hidden justify-center xl:flex">
        <PackFace />
      </div>
    </div>
  </div>
);
