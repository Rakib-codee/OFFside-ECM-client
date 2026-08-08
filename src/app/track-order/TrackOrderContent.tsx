"use client";

import { useState } from "react";
import FloatingField from "@/components/checkout/FloatingField";
import InfoShell from "@/components/layout/InfoShell";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/i18n/locale";
import { MESSENGER_URL } from "@/lib/site";

const STATUS_FLOW = ["new", "confirmed", "shipped", "delivered"] as const;

interface TrackedOrder {
  orderNo: string;
  status: string;
  placedAt: string;
  total: number;
  itemCount: number;
}

const COPY = {
  en: {
    title: "Track Your Order",
    subtitle: "Enter your order number and the phone number you ordered with.",
    orderNo: "Order number (OFF-123456)",
    phone: "Phone (01XXXXXXXXX)",
    submit: "Track order",
    searching: "Searching…",
    notFound: "No order found with that number and phone. Double-check both, or message us on Facebook.",
    unavailable: "Tracking is temporarily unavailable — please message us on Facebook and we'll check instantly.",
    invalid: "Please enter a valid order number (OFF-123456) and phone number.",
    resultHeading: "Order status",
    placed: "Placed",
    items: "items",
    total: "Total",
    cancelled: "This order was cancelled. If that's unexpected, message us and we'll sort it out.",
    statusLabels: { new: "Order received", confirmed: "Confirmed", shipped: "Shipped", delivered: "Delivered" },
    help: "Questions about your delivery?",
    helpCta: "Message us on Facebook",
  },
  bn: {
    title: "অর্ডার ট্র্যাক করুন",
    subtitle: "অর্ডার নম্বর আর যে ফোন নম্বরে অর্ডার করেছিলেন সেটি দিন।",
    orderNo: "অর্ডার নম্বর (OFF-123456)",
    phone: "মোবাইল নম্বর (01XXXXXXXXX)",
    submit: "ট্র্যাক করুন",
    searching: "খোঁজা হচ্ছে…",
    notFound: "এই নম্বর ও ফোনে কোনো অর্ডার পাওয়া যায়নি। দুটোই আবার দেখুন, বা ফেসবুকে মেসেজ করুন।",
    unavailable: "ট্র্যাকিং সাময়িকভাবে বন্ধ — ফেসবুকে মেসেজ করুন, সাথে সাথে দেখে দিচ্ছি।",
    invalid: "সঠিক অর্ডার নম্বর (OFF-123456) ও মোবাইল নম্বর দিন।",
    resultHeading: "অর্ডারের অবস্থা",
    placed: "অর্ডারের তারিখ",
    items: "টি পণ্য",
    total: "মোট",
    cancelled: "অর্ডারটি বাতিল হয়েছে। অপ্রত্যাশিত মনে হলে মেসেজ করুন — আমরা সমাধান করব।",
    statusLabels: { new: "অর্ডার গৃহীত", confirmed: "কনফার্মড", shipped: "শিপড", delivered: "ডেলিভারড" },
    help: "ডেলিভারি নিয়ে কোনো প্রশ্ন?",
    helpCta: "ফেসবুকে মেসেজ করুন",
  },
};

export default function TrackOrderContent() {
  const locale = useLocale();
  const L = COPY[locale];
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [errorNonce, setErrorNonce] = useState(0);
  const [result, setResult] = useState<TrackedOrder | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResult(null);
    setError("");
    const cleanOrderNo = orderNo.trim().toUpperCase();
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^OFF-\d{6}$/.test(cleanOrderNo) || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setError(L.invalid);
      setErrorNonce((nonce) => nonce + 1);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: cleanOrderNo, phone: cleanPhone }),
      });
      if (response.ok) {
        setResult((await response.json()) as TrackedOrder);
      } else if (response.status === 404) {
        setError(L.notFound);
      } else {
        setError(L.unavailable);
      }
    } catch {
      setError(L.unavailable);
    } finally {
      setIsSearching(false);
    }
  };

  const statusIndex = result ? STATUS_FLOW.indexOf(result.status as (typeof STATUS_FLOW)[number]) : -1;
  const isCancelled = result?.status === "cancelled";

  return (
    <InfoShell title={L.title} subtitle={L.subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-6">
        <FloatingField
          label={L.orderNo}
          value={orderNo}
          onChange={(event) => setOrderNo(event.target.value)}
          errorNonce={errorNonce}
        />
        <FloatingField
          label={L.phone}
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          errorNonce={errorNonce}
        />
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSearching}
          className="h-13 rounded-lg bg-cta py-3.5 font-medium text-cta-text transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
        >
          {isSearching ? L.searching : L.submit}
        </button>
      </form>

      {result ? (
        <section className="rounded-2xl border border-line bg-card p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">{result.orderNo}</h2>
            <span className="text-sm text-secondary">
              {L.placed}:{" "}
              {new Date(result.placedAt).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {isCancelled ? (
            <p className="rounded-xl border border-line bg-elevated p-4 text-sm text-secondary">
              {L.cancelled}
            </p>
          ) : (
            <ol className="flex flex-col gap-0">
              {STATUS_FLOW.map((step, index) => {
                const isDone = index <= statusIndex;
                const isCurrent = index === statusIndex;
                return (
                  <li key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          isDone
                            ? "border-success bg-success text-white"
                            : "border-line text-muted"
                        }`}
                      >
                        {isDone ? "✓" : index + 1}
                      </span>
                      {index < STATUS_FLOW.length - 1 ? (
                        <span className={`h-8 w-0.5 ${index < statusIndex ? "bg-success" : "bg-line"}`} />
                      ) : null}
                    </div>
                    <span
                      className={`pt-1.5 text-sm ${
                        isCurrent ? "font-semibold text-primary" : isDone ? "text-secondary" : "text-muted"
                      }`}
                    >
                      {L.statusLabels[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-6 flex justify-between border-t border-line pt-4 text-sm">
            <span className="text-secondary tnum">
              {result.itemCount} {L.items}
            </span>
            <span className="font-semibold tnum">
              {L.total}: {formatPrice(result.total)}
            </span>
          </div>
        </section>
      ) : null}

      <p className="text-sm text-secondary">
        {L.help}{" "}
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent-alt underline underline-offset-4"
        >
          {L.helpCta}
        </a>
      </p>
    </InfoShell>
  );
}
