"use client";

import InfoShell from "@/components/layout/InfoShell";
import { useLocale } from "@/lib/i18n/locale";

const MEASUREMENTS = [
  { size: "XS", chest: 36, length: 26 },
  { size: "S", chest: 38, length: 27 },
  { size: "M", chest: 40, length: 28 },
  { size: "L", chest: 42, length: 29 },
  { size: "XL", chest: 44, length: 30 },
  { size: "XXL", chest: 46, length: 31 },
];

const COPY = {
  en: {
    title: "Size Guide",
    subtitle: "Every jersey, measured flat. Find your fit in under a minute.",
    tableHeading: "Jersey measurements",
    colSize: "Size",
    colChest: "Chest (inches)",
    colLength: "Length (inches)",
    tableNote:
      "Measurements are taken with the jersey laid flat, armpit to armpit (chest) and shoulder to hem (length). Allow ±0.5\" for handmade variation.",
    howHeading: "How to measure yourself",
    howSteps: [
      "Chest — wrap a measuring tape around the fullest part of your chest, keeping it level under your arms.",
      "Compare — your body chest measurement + 2–4 inches of breathing room = the jersey chest size to pick.",
      "Length — measure from the top of your shoulder straight down to where you want the jersey to end.",
    ],
    fitHeading: "Fit tips",
    fitTips: [
      "Our fan-version jerseys have a regular, relaxed fit — true to standard Bangladeshi sizing.",
      "Between two sizes? Size up — football jerseys look and feel better with a little room.",
      "Planning name & number printing? The fit doesn't change, print sits high on the back.",
      "Kids kits run one size generous so there's room to grow into greatness.",
    ],
    help: "Still unsure? Message us on Facebook or WhatsApp with your height and weight — we'll recommend a size within minutes.",
  },
  bn: {
    title: "সাইজ গাইড",
    subtitle: "প্রতিটি জার্সির মাপ — এক মিনিটেই নিজের সাইজ খুঁজে নিন।",
    tableHeading: "জার্সির মাপ",
    colSize: "সাইজ",
    colChest: "বুক (ইঞ্চি)",
    colLength: "লম্বা (ইঞ্চি)",
    tableNote:
      "জার্সি সমতলে বিছিয়ে মাপা — বগল থেকে বগল (বুক) এবং কাঁধ থেকে নিচ পর্যন্ত (লম্বা)। হাতে তৈরি হওয়ায় ±০.৫ ইঞ্চি তারতম্য হতে পারে।",
    howHeading: "নিজের মাপ যেভাবে নেবেন",
    howSteps: [
      "বুক — মেজারিং টেপ দিয়ে বুকের সবচেয়ে চওড়া অংশ মাপুন, টেপ যেন হাতের নিচে সমান থাকে।",
      "মিলিয়ে নিন — আপনার বুকের মাপ + ২–৪ ইঞ্চি আরামের জায়গা = আপনার জার্সির বুকের সাইজ।",
      "লম্বা — কাঁধের উপর থেকে সোজা নিচে যেখানে জার্সি শেষ হবে সে পর্যন্ত মাপুন।",
    ],
    fitHeading: "ফিট টিপস",
    fitTips: [
      "আমাদের ফ্যান-ভার্সন জার্সি রেগুলার, আরামদায়ক ফিট — বাংলাদেশি স্ট্যান্ডার্ড সাইজ অনুযায়ী।",
      "দুই সাইজের মাঝামাঝি? বড়টা নিন — ফুটবল জার্সি একটু ঢিলেঢালাই ভালো লাগে।",
      "নাম-নম্বর প্রিন্ট করালেও ফিট বদলায় না — প্রিন্ট পিঠের উপরের দিকে বসে।",
      "কিডস কিট এক সাইজ বড় করে বানানো — বেড়ে ওঠার জায়গা রেখে।",
    ],
    help: "তবুও দ্বিধায়? আপনার উচ্চতা ও ওজন লিখে ফেসবুক বা হোয়াটসঅ্যাপে মেসেজ করুন — কয়েক মিনিটেই সাইজ বলে দেব।",
  },
};

export default function SizeGuideContent() {
  const locale = useLocale();
  const L = COPY[locale];

  return (
    <InfoShell title={L.title} subtitle={L.subtitle}>
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.tableHeading}</h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-card">
                <th className="px-5 py-3 font-semibold">{L.colSize}</th>
                <th className="px-5 py-3 font-semibold">{L.colChest}</th>
                <th className="px-5 py-3 font-semibold">{L.colLength}</th>
              </tr>
            </thead>
            <tbody>
              {MEASUREMENTS.map((row) => (
                <tr key={row.size} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-medium">{row.size}</td>
                  <td className="px-5 py-3 text-secondary tnum">{row.chest}&quot;</td>
                  <td className="px-5 py-3 text-secondary tnum">{row.length}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">{L.tableNote}</p>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.howHeading}</h2>
        <ol className="flex flex-col gap-3">
          {L.howSteps.map((step, index) => (
            <li key={index} className="flex gap-4 rounded-xl border border-line bg-card p-4 text-sm text-secondary">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent tnum">
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.fitHeading}</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-secondary">
          {L.fitTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      <p className="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm leading-relaxed">
        {L.help}
      </p>
    </InfoShell>
  );
}
