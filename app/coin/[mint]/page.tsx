import { CoinView } from "@/components/coin-view";

const Page = async ({ params }: { params: Promise<{ mint: string }> }) => {
  const { mint } = await params;
  return <CoinView mint={mint} />;
};

export default Page;
