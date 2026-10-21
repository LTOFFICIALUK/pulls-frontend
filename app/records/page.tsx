import type { Metadata } from "next";
import { RecordsView } from "@/components/records-view";

export const metadata: Metadata = { title: "Records" };

const Page = () => <RecordsView />;

export default Page;
