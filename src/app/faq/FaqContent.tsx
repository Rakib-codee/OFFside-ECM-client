"use client";

import InfoShell from "@/components/layout/InfoShell";
import TransitionLink from "@/components/fx/TransitionLink";
import { useLocale } from "@/lib/i18n/locale";
import { MESSENGER_URL } from "@/lib/site";

const COPY = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Quick answers to what fans ask us the most.",
    faqs: [
      {
        q: "Are your jerseys original?",
        a: "We sell premium fan-version jerseys — high-quality replicas with the same designs, colors and crests as the official kits, at a price every fan can afford. Fabric quality, stitching and prints are the best available in this class.",
      },
      {
        q: "Which size should I order?",
        a: "Our jerseys follow standard Bangladeshi sizing with a regular fit. Check the Size Guide page for exact chest and length measurements. Between two sizes? Go one size up.",
      },
      {
        q: "How long does delivery take?",
        a: "Inside Dhaka: 1–2 working days. Outside Dhaka: 2–4 working days. Customized jerseys need 1–2 extra days for printing before shipping.",
      },
      {
        q: "How can I pay?",
        a: "Cash on Delivery anywhere in Bangladesh, or bKash/Nagad Send Money at checkout — just enter your transaction ID and we verify it before shipping.",
      },
      {
        q: "Can I put my own name and number on a jersey?",
        a: "Yes! Use the customization option on any product page — type your name and number and see a live preview on the jersey. Custom printing costs ৳150 extra.",
      },
      {
        q: "What if the size doesn't fit?",
        a: "Exchange within 7 days — the jersey must be unworn with tags on, and you only pay the courier cost. Customized jerseys can't be exchanged unless the fault is ours.",
      },
      {
        q: "How do I track my order?",
        a: "Use the Track Your Order page with your order number (OFF-XXXXXX) and the phone number you ordered with — you'll see the live status instantly.",
      },
      {
        q: "Do you take team or bulk orders?",
        a: "Absolutely — full team sets with individual names and numbers are our specialty. Message us on Facebook with your quantity and we'll send a special quote within a day.",
      },
    ],
    moreHeading: "Didn't find your answer?",
    moreCta: "Message us on Facebook",
    sizeGuideLink: "Open the Size Guide",
    trackLink: "Track your order",
  },
  bn: {
    title: "সাধারণ প্রশ্নোত্তর",
    subtitle: "ভক্তরা যা সবচেয়ে বেশি জিজ্ঞেস করেন — এক জায়গায় উত্তর।",
    faqs: [
      {
        q: "আপনাদের জার্সি কি অরিজিনাল?",
        a: "আমরা প্রিমিয়াম ফ্যান-ভার্সন জার্সি বিক্রি করি — অফিসিয়াল কিটের একই ডিজাইন, রং আর ক্রেস্টের উন্নত মানের রেপ্লিকা, প্রতিটি ভক্তের সাধ্যের দামে। এই ক্লাসে ফ্যাব্রিক, সেলাই ও প্রিন্টের মান সেরা।",
      },
      {
        q: "কোন সাইজ নেব?",
        a: "আমাদের জার্সি বাংলাদেশি স্ট্যান্ডার্ড সাইজে, রেগুলার ফিট। সঠিক বুক ও লম্বার মাপ সাইজ গাইড পেজে দেখুন। দুই সাইজের মাঝামাঝি হলে বড়টা নিন।",
      },
      {
        q: "ডেলিভারি কতদিনে পাব?",
        a: "ঢাকার ভিতরে ১–২ কর্মদিবস, ঢাকার বাইরে ২–৪ কর্মদিবস। কাস্টমাইজড জার্সিতে প্রিন্টিংয়ের জন্য ১–২ দিন বাড়তি লাগে।",
      },
      {
        q: "পেমেন্ট কীভাবে করব?",
        a: "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি, অথবা চেকআউটে বিকাশ/নগদ সেন্ড মানি — ট্রানজেকশন আইডি দিলেই শিপিংয়ের আগে আমরা যাচাই করে নিই।",
      },
      {
        q: "জার্সিতে নিজের নাম-নম্বর দেওয়া যাবে?",
        a: "অবশ্যই! যেকোনো প্রোডাক্ট পেজে কাস্টমাইজেশন অপশনে নাম ও নম্বর লিখুন — জার্সিতে লাইভ প্রিভিউ দেখবেন। কাস্টম প্রিন্টিংয়ে ৳১৫০ বাড়তি লাগে।",
      },
      {
        q: "সাইজ না মিললে কী হবে?",
        a: "৭ দিনের মধ্যে এক্সচেঞ্জ — জার্সি অব্যবহৃত ও ট্যাগসহ থাকতে হবে, শুধু কুরিয়ার খরচ আপনার। কাস্টমাইজড জার্সি আমাদের ভুল ছাড়া এক্সচেঞ্জ হয় না।",
      },
      {
        q: "অর্ডার কীভাবে ট্র্যাক করব?",
        a: "অর্ডার ট্র্যাক পেজে অর্ডার নম্বর (OFF-XXXXXX) আর যে ফোনে অর্ডার করেছিলেন সেটি দিন — সাথে সাথে লাইভ স্ট্যাটাস দেখবেন।",
      },
      {
        q: "টিম বা বাল্ক অর্ডার নেন?",
        a: "অবশ্যই — প্রত্যেকের আলাদা নাম-নম্বরসহ পুরো টিম সেট আমাদের স্পেশালিটি। পরিমাণ লিখে ফেসবুকে মেসেজ করুন, এক দিনের মধ্যে স্পেশাল কোটেশন পাবেন।",
      },
    ],
    moreHeading: "উত্তর পাননি?",
    moreCta: "ফেসবুকে মেসেজ করুন",
    sizeGuideLink: "সাইজ গাইড দেখুন",
    trackLink: "অর্ডার ট্র্যাক করুন",
  },
};

export default function FaqContent() {
  const locale = useLocale();
  const L = COPY[locale];

  return (
    <InfoShell title={L.title} subtitle={L.subtitle}>
      <div className="flex flex-col gap-3">
        {L.faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-2xl border border-line bg-card open:border-accent/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="text-secondary transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-secondary">{faq.a}</p>
          </details>
        ))}
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <p className="mb-3 font-medium">{L.moreHeading}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent-alt px-4 py-2 font-medium text-white transition-transform hover:scale-[1.02]"
          >
            {L.moreCta}
          </a>
          <TransitionLink
            href="/size-guide"
            className="rounded-lg border border-line px-4 py-2 font-medium transition-colors hover:border-primary"
          >
            {L.sizeGuideLink}
          </TransitionLink>
          <TransitionLink
            href="/track-order"
            className="rounded-lg border border-line px-4 py-2 font-medium transition-colors hover:border-primary"
          >
            {L.trackLink}
          </TransitionLink>
        </div>
      </div>
    </InfoShell>
  );
}
