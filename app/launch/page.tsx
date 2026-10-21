import type { Metadata } from "next";
import { LaunchForm } from "@/components/launch-form";

export const metadata: Metadata = { title: "Launch" };

const Page = () => <LaunchForm />;

export default Page;
