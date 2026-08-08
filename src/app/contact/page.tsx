import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach OFFside on Facebook Messenger or WhatsApp — replies within the hour.",
};

export default function ContactPage() {
  return <ContactContent />;
}
