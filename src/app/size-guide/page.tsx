import type { Metadata } from "next";
import SizeGuideContent from "./SizeGuideContent";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "OFFside jersey measurements and how to pick your perfect fit.",
};

export default function SizeGuidePage() {
  return <SizeGuideContent />;
}
