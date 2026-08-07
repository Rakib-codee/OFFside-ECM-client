import type { Metadata } from "next";
import AccountContent from "./AccountContent";

export const metadata: Metadata = {
  title: "Account",
  description: "Track orders and manage your OFFside account.",
};

export default function AccountPage() {
  return <AccountContent />;
}
