import Link from "next/link";
import { Dialogue, PageHead } from "@/components/ui";

const NotFound = () => (
  <div className="px-6 py-16 md:px-12">
    <PageHead kicker="MISSING PACK" title="This page is not on the board.">
      The coins, the vault, and the records are still here.
    </PageHead>
    <div className="mt-8 max-w-xl">
      <Dialogue>Head home, or launch a coin paired with CARDS.</Dialogue>
    </div>
    <Link href="/" className="mt-6 inline-block rounded-[10px] bg-acc px-5 py-3.5 font-extrabold text-black">
      Back to pulls
    </Link>
  </div>
);

export default NotFound;
