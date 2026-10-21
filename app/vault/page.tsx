import type { Metadata } from "next";
import { VaultView } from "@/components/vault-view";

export const metadata: Metadata = { title: "Vault" };

const Page = () => <VaultView />;

export default Page;
