import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About OFFside",
  description: "The story of OFFside — jerseys for the 12th man, made in Bangladesh with love for the game.",
};

export default function AboutPage() {
  return <AboutContent />;
}
