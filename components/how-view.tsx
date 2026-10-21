const steps = [
  "Launch a coin paired with CARDS. The vault is the creator, so creator fees arrive in CARDS.",
  "Every 10 minutes the vault claims those fees and swaps them to USDC.",
  "80 percent of each coin stays with that coin. 10 percent tops up $PULLS. 10 percent goes to the platform.",
  "When a coin balance covers the cheapest open pack, the vault buys one real graded pack.",
  "One holder wins the card, weighted by balance. Wallets under 0.1 percent of supply sit out. The draw uses the pack payment signature. The holder list and seed stay public on Records.",
  "The winner keeps the card and can redeem the physical one on Collector Crypt, or cashes out within 72 hours.",
];

export const HowView = () => (
  <div className="px-6 py-8 md:px-12">
    <h1 className="font-[family-name:var(--font-pixel)] text-2xl leading-relaxed text-acc md:text-3xl">How it works</h1>
    <p className="mt-4 max-w-xl text-lg text-mute">Open packs, not charts. Real cards. Real NFTs. Real USDC.</p>
    <ol className="mt-8 grid max-w-3xl gap-4">
      {steps.map((step, index) => (
        <li key={step} className="border border-line p-4">
          <p className="font-[family-name:var(--font-pixel)] text-[10px] text-acc">{String(index + 1).padStart(2, "0")}</p>
          <p className="mt-2 text-lg">{step}</p>
        </li>
      ))}
    </ol>
  </div>
);
