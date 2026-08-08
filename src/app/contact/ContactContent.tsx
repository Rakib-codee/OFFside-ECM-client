"use client";

import InfoShell from "@/components/layout/InfoShell";
import { useLocale } from "@/lib/i18n/locale";
import { MESSENGER_URL, WHATSAPP_NUMBER } from "@/lib/site";

const COPY = {
  en: {
    title: "Contact Us",
    subtitle: "Real people, fast replies — usually within the hour.",
    messengerTitle: "Facebook Messenger",
    messengerDetail: "The fastest way to reach us — order help, size advice, team orders, anything.",
    messengerCta: "Open Messenger",
    whatsappTitle: "WhatsApp",
    whatsappDetail: "Message or call us on WhatsApp for quick order confirmation.",
    whatsappCta: "Chat on WhatsApp",
    hoursTitle: "Support hours",
    hours: "Every day, 10:00 AM – 10:00 PM (Bangladesh time)",
    hoursNote: "Messages outside these hours get answered first thing next morning.",
    topicsTitle: "What we can help with",
    topics: [
      "Order status and delivery updates",
      "Size recommendations before you buy",
      "Custom name & number printing questions",
      "Team and bulk order quotations",
      "Exchange requests within 7 days of delivery",
    ],
  },
  bn: {
    title: "যোগাযোগ",
    subtitle: "সত্যিকারের মানুষ, দ্রুত উত্তর — সাধারণত এক ঘণ্টার মধ্যেই।",
    messengerTitle: "ফেসবুক মেসেঞ্জার",
    messengerDetail: "আমাদের সাথে যোগাযোগের দ্রুততম পথ — অর্ডার, সাইজ, টিম অর্ডার, যেকোনো প্রয়োজনে।",
    messengerCta: "মেসেঞ্জার খুলুন",
    whatsappTitle: "হোয়াটসঅ্যাপ",
    whatsappDetail: "দ্রুত অর্ডার কনফার্মেশনের জন্য হোয়াটসঅ্যাপে মেসেজ বা কল করুন।",
    whatsappCta: "হোয়াটসঅ্যাপে চ্যাট করুন",
    hoursTitle: "সাপোর্টের সময়",
    hours: "প্রতিদিন সকাল ১০টা – রাত ১০টা (বাংলাদেশ সময়)",
    hoursNote: "এর বাইরের মেসেজের উত্তর পরদিন সকালে সবার আগে দেওয়া হয়।",
    topicsTitle: "যেসব বিষয়ে সাহায্য করি",
    topics: [
      "অর্ডারের অবস্থা ও ডেলিভারি আপডেট",
      "কেনার আগে সাইজ পরামর্শ",
      "কাস্টম নাম-নম্বর প্রিন্টিং সংক্রান্ত প্রশ্ন",
      "টিম ও বাল্ক অর্ডারের কোটেশন",
      "ডেলিভারির ৭ দিনের মধ্যে এক্সচেঞ্জ",
    ],
  },
};

export default function ContactContent() {
  const locale = useLocale();
  const L = COPY[locale];
  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`
    : null;

  return (
    <InfoShell title={L.title} subtitle={L.subtitle}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold">{L.messengerTitle}</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{L.messengerDetail}</p>
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 rounded-lg bg-accent-alt py-3 text-center font-medium text-white transition-transform hover:scale-[1.02]"
          >
            {L.messengerCta}
          </a>
        </div>
        <div className="flex flex-col rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold">{L.whatsappTitle}</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{L.whatsappDetail}</p>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 rounded-lg bg-[#25D366] py-3 text-center font-medium text-white transition-transform hover:scale-[1.02]"
            >
              {L.whatsappCta}
            </a>
          ) : (
            <a
              href={MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 rounded-lg border border-line py-3 text-center font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              {L.messengerCta}
            </a>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-lg font-semibold">{L.hoursTitle}</h2>
        <p className="mt-2 font-medium">{L.hours}</p>
        <p className="mt-1 text-sm text-secondary">{L.hoursNote}</p>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.topicsTitle}</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-secondary">
          {L.topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
      </section>
    </InfoShell>
  );
}
