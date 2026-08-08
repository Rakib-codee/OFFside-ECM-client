"use client";

import InfoShell from "@/components/layout/InfoShell";
import TransitionLink from "@/components/fx/TransitionLink";
import { useLocale } from "@/lib/i18n/locale";
import { MESSENGER_URL } from "@/lib/site";

const COPY = {
  en: {
    title: "About OFFside",
    subtitle: "Jerseys for the 12th man — because the game belongs to the fans.",
    storyHeading: "Our story",
    story1:
      "OFFside started the way most good football things do — with friends, a match on a small screen, and the feeling that wearing your team's colors shouldn't cost a fortune. We began by sourcing a handful of premium fan-version jerseys for people we knew. They told their friends. Their friends told theirs.",
    story2:
      "Today OFFside is a growing Bangladeshi jersey store serving fans across the country — club kits, national team shirts, retro classics and full team sets with custom names and numbers. Every jersey we ship is checked by hand, because we're fans first and sellers second.",
    valuesHeading: "What we stand for",
    values: [
      { title: "Fan-first pricing", detail: "Premium fan-version quality at prices real supporters can afford." },
      { title: "Honest quality", detail: "We photograph what we sell and hand-check every piece before shipping." },
      { title: "Made personal", detail: "Your name, your number, your kit — printed with care in 1–2 days." },
      { title: "All of Bangladesh", detail: "Dhaka to the districts — trusted courier delivery, cash on delivery everywhere." },
    ],
    storesHeading: "Our store",
    storesBody:
      "OFFside is an online-first store, born on Facebook and now living here. We operate from Dhaka and deliver across all 64 districts. No showroom rent means better prices for you — and if you're in Dhaka, same-area delivery often arrives the very next day.",
    storesCta: "Browse the collection",
    careersHeading: "Careers",
    careersBody:
      "We're a small squad with big plans — content creators, delivery coordinators and customer champions join us as we grow. No formal openings are posted right now, but genuine football people always get a reply: send your CV or portfolio through our Facebook page.",
    careersCta: "Introduce yourself",
    pressHeading: "Press & partnerships",
    pressBody:
      "Working on a story about football culture in Bangladesh? Want to collaborate on a team kit, a tournament or a creator drop? We're open to it — reach out through Messenger and mention 'press' or 'partnership' so the right person picks it up quickly.",
    pressCta: "Get in touch",
  },
  bn: {
    title: "OFFside সম্পর্কে",
    subtitle: "দ্বাদশ খেলোয়াড়ের জার্সি — কারণ খেলাটা আসলে ভক্তদেরই।",
    storyHeading: "আমাদের গল্প",
    story1:
      "OFFside-এর শুরুটা ফুটবলের আর সব ভালো গল্পের মতোই — কয়েকজন বন্ধু, ছোট স্ক্রিনে খেলা, আর একটা উপলব্ধি: প্রিয় দলের রং গায়ে জড়াতে এত দাম হওয়া উচিত না। পরিচিতদের জন্য অল্প কিছু প্রিমিয়াম ফ্যান-ভার্সন জার্সি আনা দিয়ে শুরু। তারা বলল বন্ধুদের, বন্ধুরা বলল আরও বন্ধুদের।",
    story2:
      "আজ OFFside সারা বাংলাদেশের ভক্তদের একটি ক্রমবর্ধমান জার্সি স্টোর — ক্লাব কিট, জাতীয় দলের শার্ট, রেট্রো ক্লাসিক আর কাস্টম নাম-নম্বরসহ পুরো টিম সেট। প্রতিটি জার্সি শিপ করার আগে হাতে ধরে দেখি — কারণ আমরা আগে ভক্ত, পরে বিক্রেতা।",
    valuesHeading: "আমাদের বিশ্বাস",
    values: [
      { title: "ভক্তদের সাধ্যের দাম", detail: "প্রিমিয়াম ফ্যান-ভার্সন মান, সত্যিকারের সমর্থকদের সাধ্যের মধ্যে।" },
      { title: "সৎ মান", detail: "যা বিক্রি করি তারই ছবি দিই, প্রতিটি পিস শিপিংয়ের আগে হাতে যাচাই হয়।" },
      { title: "একান্ত আপনার", detail: "আপনার নাম, আপনার নম্বর, আপনার কিট — ১–২ দিনে যত্নে প্রিন্ট।" },
      { title: "সারা বাংলাদেশ", detail: "ঢাকা থেকে জেলা শহর — বিশ্বস্ত কুরিয়ার, সব জায়গায় ক্যাশ অন ডেলিভারি।" },
    ],
    storesHeading: "আমাদের স্টোর",
    storesBody:
      "OFFside একটি অনলাইন-ফার্স্ট স্টোর — জন্ম ফেসবুকে, এখন এই ওয়েবসাইটে। আমরা ঢাকা থেকে পরিচালনা করি এবং ৬৪ জেলাতেই ডেলিভারি দিই। শোরুম ভাড়া নেই বলেই দাম আপনার নাগালে — ঢাকায় থাকলে অনেক সময় পরদিনই ডেলিভারি পৌঁছে যায়।",
    storesCta: "কালেকশন দেখুন",
    careersHeading: "ক্যারিয়ার",
    careersBody:
      "আমরা ছোট এক স্কোয়াড, স্বপ্ন বড় — কনটেন্ট ক্রিয়েটর, ডেলিভারি কো-অর্ডিনেটর আর কাস্টমার চ্যাম্পিয়নরা আমাদের সাথে যুক্ত হচ্ছেন। এই মুহূর্তে আনুষ্ঠানিক নিয়োগ বিজ্ঞপ্তি নেই, তবে সত্যিকারের ফুটবল-পাগল মানুষ সবসময় উত্তর পান — ফেসবুক পেজে সিভি বা পোর্টফোলিও পাঠান।",
    careersCta: "নিজের পরিচয় দিন",
    pressHeading: "প্রেস ও পার্টনারশিপ",
    pressBody:
      "বাংলাদেশের ফুটবল সংস্কৃতি নিয়ে কাজ করছেন? টিম কিট, টুর্নামেন্ট বা ক্রিয়েটর কোলাবে আগ্রহী? আমরা প্রস্তুত — মেসেঞ্জারে 'press' বা 'partnership' লিখে মেসেজ করুন, দ্রুত সঠিক মানুষের কাছে পৌঁছাবে।",
    pressCta: "যোগাযোগ করুন",
  },
};

export default function AboutContent() {
  const locale = useLocale();
  const L = COPY[locale];

  const external = (href: string, label: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-block rounded-lg border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary"
    >
      {label}
    </a>
  );

  return (
    <InfoShell title={L.title} subtitle={L.subtitle}>
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.storyHeading}</h2>
        <div className="space-y-4 text-sm leading-relaxed text-secondary md:text-base">
          <p>{L.story1}</p>
          <p>{L.story2}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">{L.valuesHeading}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {L.values.map((value) => (
            <div key={value.title} className="rounded-2xl border border-line bg-card p-5">
              <p className="font-medium">{value.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">{value.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stores" className="scroll-mt-28 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{L.storesHeading}</h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">{L.storesBody}</p>
        <TransitionLink
          href="/shop"
          className="mt-4 inline-block rounded-lg bg-cta px-5 py-2.5 text-sm font-medium text-cta-text transition-colors hover:bg-accent hover:text-white"
        >
          {L.storesCta}
        </TransitionLink>
      </section>

      <section id="careers" className="scroll-mt-28 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{L.careersHeading}</h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">{L.careersBody}</p>
        {external(MESSENGER_URL, L.careersCta)}
      </section>

      <section id="press" className="scroll-mt-28 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{L.pressHeading}</h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">{L.pressBody}</p>
        {external(MESSENGER_URL, L.pressCta)}
      </section>
    </InfoShell>
  );
}
