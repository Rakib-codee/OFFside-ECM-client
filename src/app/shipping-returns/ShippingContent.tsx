"use client";

import InfoShell from "@/components/layout/InfoShell";
import { useSettings } from "@/components/CatalogProvider";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale";

const COPY = {
  en: {
    title: "Shipping & Returns",
    subtitle: "Nationwide delivery, honest timelines, easy exchanges.",
    deliveryHeading: "Delivery charges & timelines",
    zoneCampus: "Khulna University Campus",
    zoneCampusEta: "On-campus hand delivery",
    zoneDhaka: "Inside Khulna City",
    zoneDhakaEta: "1–2 working days",
    zoneOutside: "Outside Khulna",
    zoneOutsideEta: "2–4 working days",
    freeNote: (threshold: string) => `Delivery is FREE on every order of ${threshold} or more.`,
    processHeading: "How your order travels",
    processSteps: [
      "You place the order — we call or message you within a few hours to confirm.",
      "Customized jerseys go to printing (adds 1–2 days); ready stock ships the same or next day.",
      "Your parcel travels by trusted courier with your phone number on the label.",
      "Pay the courier on delivery (COD), or you've already paid via bKash/Nagad — either way, check your jersey before the courier leaves.",
    ],
    exchangeHeading: "Exchange policy",
    exchangePoints: [
      "Wrong size? Exchange within 7 days of delivery — free of extra product cost, you only bear courier charges.",
      "Jerseys must be unworn, unwashed, with tags attached.",
      "Customized (name/number printed) jerseys can't be exchanged unless the printing is our mistake — then we replace it free, including courier.",
      "Received a wrong or defective item? Message us with a photo within 48 hours and we'll fix it at our cost, no questions asked.",
    ],
    exchangeHow: "To start an exchange, message us on Facebook or WhatsApp with your order number.",
  },
  bn: {
    title: "শিপিং ও রিটার্ন",
    subtitle: "সারাদেশে ডেলিভারি, সঠিক সময়ের প্রতিশ্রুতি, সহজ এক্সচেঞ্জ।",
    deliveryHeading: "ডেলিভারি চার্জ ও সময়",
    zoneCampus: "খুলনা বিশ্ববিদ্যালয় ক্যাম্পাস",
    zoneCampusEta: "ক্যাম্পাসে হাতে হাতে ডেলিভারি",
    zoneDhaka: "খুলনা শহরের ভিতরে",
    zoneDhakaEta: "১–২ কর্মদিবস",
    zoneOutside: "খুলনার বাইরে",
    zoneOutsideEta: "২–৪ কর্মদিবস",
    freeNote: (threshold: string) => `${threshold} বা তার বেশি অর্ডারে ডেলিভারি সম্পূর্ণ ফ্রি।`,
    processHeading: "আপনার অর্ডার যেভাবে পৌঁছায়",
    processSteps: [
      "অর্ডার করার পর কয়েক ঘণ্টার মধ্যে আমরা ফোন বা মেসেজে কনফার্ম করি।",
      "কাস্টমাইজড জার্সি প্রিন্টিংয়ে যায় (১–২ দিন বাড়তি); রেডি স্টক ওই দিন বা পরদিনই শিপ হয়।",
      "বিশ্বস্ত কুরিয়ারে আপনার পার্সেল যায়, লেবেলে আপনার ফোন নম্বর থাকে।",
      "ডেলিভারিতে কুরিয়ারকে টাকা দিন (COD), বা বিকাশ/নগদে আগেই পেমেন্ট করা থাকলে শুধু বুঝে নিন — কুরিয়ার যাওয়ার আগে জার্সিটা দেখে নিন।",
    ],
    exchangeHeading: "এক্সচেঞ্জ পলিসি",
    exchangePoints: [
      "সাইজ ভুল? ডেলিভারির ৭ দিনের মধ্যে এক্সচেঞ্জ — পণ্যের বাড়তি দাম নেই, শুধু কুরিয়ার খরচ আপনার।",
      "জার্সি অবশ্যই অব্যবহৃত, না-ধোয়া এবং ট্যাগসহ থাকতে হবে।",
      "কাস্টমাইজড (নাম/নম্বর প্রিন্ট) জার্সি এক্সচেঞ্জ হয় না — তবে প্রিন্টে আমাদের ভুল থাকলে কুরিয়ারসহ সম্পূর্ণ ফ্রিতে বদলে দিই।",
      "ভুল বা ত্রুটিপূর্ণ পণ্য পেলে ৪৮ ঘণ্টার মধ্যে ছবি তুলে মেসেজ করুন — সম্পূর্ণ আমাদের খরচে সমাধান, কোনো প্রশ্ন ছাড়াই।",
    ],
    exchangeHow: "এক্সচেঞ্জ শুরু করতে অর্ডার নম্বরসহ ফেসবুক বা হোয়াটসঅ্যাপে মেসেজ করুন।",
  },
};

export default function ShippingContent() {
  const locale = useLocale();
  const settings = useSettings();
  const L = COPY[locale];

  const zones = [
    { name: L.zoneCampus, eta: L.zoneCampusEta, cost: 0 },
    { name: L.zoneDhaka, eta: L.zoneDhakaEta, cost: settings.dhakaRate },
    { name: L.zoneOutside, eta: L.zoneOutsideEta, cost: settings.outsideRate },
  ];

  return (
    <InfoShell title={L.title} subtitle={L.subtitle}>
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.deliveryHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {zones.map((zone) => (
            <div key={zone.name} className="rounded-2xl border border-line bg-card p-5">
              <p className="font-medium">{zone.name}</p>
              <p className="mt-1 text-sm text-secondary">{zone.eta}</p>
              <p className={`mt-3 font-display text-2xl font-semibold tnum ${zone.cost === 0 ? "text-success" : ""}`}>
                {zone.cost === 0 ? "FREE" : formatPrice(zone.cost)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm font-medium text-success">
          {L.freeNote(formatPrice(settings.freeShippingThreshold))}
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.processHeading}</h2>
        <ol className="flex flex-col gap-3">
          {L.processSteps.map((step, index) => (
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
        <h2 className="mb-4 font-display text-xl font-semibold">{L.exchangeHeading}</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-secondary">
          {L.exchangePoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        <p className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm leading-relaxed">
          {L.exchangeHow}
        </p>
      </section>
    </InfoShell>
  );
}
