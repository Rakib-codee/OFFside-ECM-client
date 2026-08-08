import type { Metadata } from "next";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about sizing, delivery, payment, customization and exchanges.",
};

export default function FaqPage() {
  return <FaqContent />;
}
