"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingField from "./FloatingField";
import OrderSummary from "./OrderSummary";
import ProgressSteps from "./ProgressSteps";
import QtyStepper from "@/components/cart/QtyStepper";
import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE, useCartStore } from "@/lib/store/cart";
import { useLocale, useT } from "@/lib/i18n/locale";
import { localizedNameById, localizedTeamById } from "@/lib/i18n/localize";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPRESS_SHIPPING_RATE = 15;
export const ORDER_STORAGE_KEY = "offside-order";

type ShippingMethod = "standard" | "express";

interface InfoForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postal: string;
  country: string;
}

const EMPTY_INFO: InfoForm = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postal: "",
  country: "",
};

function detectCardType(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\s/g, "");
  if (/^4/.test(digits)) return "VISA";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "AMEX";
  return null;
}

export default function CheckoutClient() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clearCart = useCartStore((state) => state.clear);

  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<InfoForm>(EMPTY_INFO);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [errorNonce, setErrorNonce] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const standardShipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const shippingCost = shippingMethod === "express" ? EXPRESS_SHIPPING_RATE : standardShipping;
  const cardType = detectCardType(card.number);

  const updateInfo = (field: keyof InfoForm, value: string) => {
    setInfo((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const failValidation = (nextErrors: Record<string, string>) => {
    setErrors(nextErrors);
    setErrorNonce((nonce) => nonce + 1);
  };

  const validateInfo = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!EMAIL_PATTERN.test(info.email.trim())) nextErrors.email = t("checkout.validEmail");
    if (!info.firstName.trim()) nextErrors.firstName = t("checkout.required");
    if (!info.lastName.trim()) nextErrors.lastName = t("checkout.required");
    if (!info.address.trim()) nextErrors.address = t("checkout.required");
    if (!info.city.trim()) nextErrors.city = t("checkout.required");
    if (!info.postal.trim()) nextErrors.postal = t("checkout.required");
    if (!info.country.trim()) nextErrors.country = t("checkout.required");
    if (Object.keys(nextErrors).length > 0) {
      failValidation(nextErrors);
      return false;
    }
    return true;
  };

  const validateCard = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!card.name.trim()) nextErrors.cardName = t("checkout.required");
    if (card.number.replace(/\s/g, "").length < 15) nextErrors.cardNumber = t("checkout.validCard");
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) nextErrors.cardExpiry = "MM/YY";
    if (card.cvc.length < 3) nextErrors.cardCvc = t("checkout.validCvc");
    if (Object.keys(nextErrors).length > 0) {
      failValidation(nextErrors);
      return false;
    }
    return true;
  };

  const goToStep = (nextStep: number) => {
    setErrors({});
    setStep(nextStep);
    window.scrollTo({ top: 0 });
  };

  const placeOrder = () => {
    setIsPlacingOrder(true);
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    sessionStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({
        number: orderNumber,
        email: info.email,
        total: subtotal + shippingCost,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      }),
    );
    clearCart();
    router.push("/checkout/success");
  };

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <div className="w-28 opacity-25">
          <JerseyGraphic
            colors={{ body: "#2a2a2a", sleeve: "#1a1a1a", accent: "#666666", text: "#666666" }}
          />
        </div>
        <p className="text-lg font-medium">{t("cart.empty")}</p>
        <TransitionLink
          href="/shop"
          className="mt-2 rounded-lg bg-cta px-8 py-3 font-medium text-cta-text transition-colors hover:bg-accent hover:text-white"
        >
          {t("cart.continue")}
        </TransitionLink>
      </div>
    );
  }

  const continueButtonClass =
    "h-14 w-full rounded-lg bg-cta font-medium text-cta-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95";

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold md:text-4xl">{t("checkout.title")}</h1>
      <ProgressSteps currentStep={step} />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[60%_1fr]">
        <div>
          {step === 0 ? (
            <section aria-label="Review cart">
              <h2 className="mb-6 font-display text-2xl font-semibold">{t("checkout.review")}</h2>
              <ul className="mb-8 flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.key} className="flex items-center gap-4 rounded-xl border border-line bg-card p-4">
                    <div className="h-20 w-16 shrink-0 rounded-lg bg-elevated p-1.5">
                      <JerseyGraphic
                        colors={item.colors}
                        view={item.customName || item.customNumber ? "back" : "front"}
                        name={item.customName}
                        number={item.customNumber}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wider text-secondary">{localizedTeamById(item.productId, item.team, locale)}</p>
                      <p className="truncate font-medium">{localizedNameById(item.productId, item.name, locale)}</p>
                      <p className="text-xs text-muted">
                        {t("cart.size")} {item.size}
                        {item.customName ? ` · ${item.customName}` : ""}
                        {item.customNumber ? ` #${item.customNumber}` : ""}
                      </p>
                    </div>
                    <QtyStepper
                      value={item.quantity}
                      onChange={(next) => setQuantity(item.key, next)}
                      label={`Quantity for ${item.team} ${item.name}`}
                    />
                    <span className="w-20 text-right font-medium tnum">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => goToStep(1)} className={continueButtonClass}>
                {t("checkout.contInfo")}
              </button>
            </section>
          ) : null}

          {step === 1 ? (
            <section aria-label="Contact and address">
              <h2 className="mb-6 font-display text-2xl font-semibold">{t("checkout.yourInfo")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FloatingField
                  label={t("checkout.email")}
                  type="email"
                  autoComplete="email"
                  value={info.email}
                  onChange={(event) => updateInfo("email", event.target.value)}
                  error={errors.email}
                  errorNonce={errorNonce}
                  className="sm:col-span-2"
                />
                <FloatingField
                  label={t("checkout.firstName")}
                  autoComplete="given-name"
                  value={info.firstName}
                  onChange={(event) => updateInfo("firstName", event.target.value)}
                  error={errors.firstName}
                  errorNonce={errorNonce}
                />
                <FloatingField
                  label={t("checkout.lastName")}
                  autoComplete="family-name"
                  value={info.lastName}
                  onChange={(event) => updateInfo("lastName", event.target.value)}
                  error={errors.lastName}
                  errorNonce={errorNonce}
                />
                <FloatingField
                  label={t("checkout.address")}
                  autoComplete="street-address"
                  value={info.address}
                  onChange={(event) => updateInfo("address", event.target.value)}
                  error={errors.address}
                  errorNonce={errorNonce}
                  className="sm:col-span-2"
                />
                <FloatingField
                  label={t("checkout.city")}
                  autoComplete="address-level2"
                  value={info.city}
                  onChange={(event) => updateInfo("city", event.target.value)}
                  error={errors.city}
                  errorNonce={errorNonce}
                />
                <FloatingField
                  label={t("checkout.postal")}
                  autoComplete="postal-code"
                  value={info.postal}
                  onChange={(event) => updateInfo("postal", event.target.value)}
                  error={errors.postal}
                  errorNonce={errorNonce}
                />
                <FloatingField
                  label={t("checkout.country")}
                  autoComplete="country-name"
                  value={info.country}
                  onChange={(event) => updateInfo("country", event.target.value)}
                  error={errors.country}
                  errorNonce={errorNonce}
                  className="sm:col-span-2"
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(0)}
                  className="h-14 rounded-lg border border-line px-6 text-sm font-medium text-secondary transition-colors hover:border-white hover:text-primary"
                >
                  {t("checkout.back")}
                </button>
                <button
                  type="button"
                  onClick={() => validateInfo() && goToStep(2)}
                  className={continueButtonClass}
                >
                  {t("checkout.contShipping")}
                </button>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section aria-label="Shipping method">
              <h2 className="mb-6 font-display text-2xl font-semibold">{t("checkout.shippingTitle")}</h2>
              <div className="flex flex-col gap-3" role="radiogroup" aria-label={t("checkout.shippingTitle")}>
                {(
                  [
                    {
                      key: "standard" as const,
                      title: t("checkout.standard"),
                      detail: t("checkout.standardEta"),
                      cost: standardShipping,
                    },
                    {
                      key: "express" as const,
                      title: t("checkout.express"),
                      detail: t("checkout.expressEta"),
                      cost: EXPRESS_SHIPPING_RATE,
                    },
                  ]
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={shippingMethod === option.key}
                    onClick={() => setShippingMethod(option.key)}
                    className={`flex items-center justify-between rounded-xl border p-5 text-left transition-colors ${
                      shippingMethod === option.key
                        ? "border-accent bg-accent/5"
                        : "border-line bg-card hover:border-muted"
                    }`}
                  >
                    <span>
                      <span className="block font-medium">{option.title}</span>
                      <span className="block text-sm text-secondary">{option.detail}</span>
                    </span>
                    <span className="font-medium tnum">
                      {option.cost === 0 ? t("cart.free") : formatPrice(option.cost)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="h-14 rounded-lg border border-line px-6 text-sm font-medium text-secondary transition-colors hover:border-white hover:text-primary"
                >
                  {t("checkout.back")}
                </button>
                <button type="button" onClick={() => goToStep(3)} className={continueButtonClass}>
                  {t("checkout.contPayment")}
                </button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section aria-label="Payment">
              <h2 className="mb-6 font-display text-2xl font-semibold">{t("checkout.paymentTitle")}</h2>
              <div className="mb-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={placeOrder}
                  className="h-14 rounded-lg bg-black font-semibold text-white ring-1 ring-line transition-transform hover:scale-[1.02]"
                >
                   Pay
                </button>
                <button
                  type="button"
                  onClick={placeOrder}
                  className="h-14 rounded-lg bg-cta font-semibold text-cta-text transition-transform hover:scale-[1.02]"
                >
                  G Pay
                </button>
              </div>
              <div className="mb-6 flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-line" />
                {t("checkout.orCard")}
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FloatingField
                  label={t("checkout.cardName")}
                  autoComplete="cc-name"
                  value={card.name}
                  onChange={(event) => setCard({ ...card, name: event.target.value })}
                  error={errors.cardName}
                  errorNonce={errorNonce}
                  className="sm:col-span-2"
                />
                <div className="relative sm:col-span-2">
                  <FloatingField
                    label={t("checkout.cardNumber")}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onChange={(event) =>
                      setCard({
                        ...card,
                        number: event.target.value
                          .replace(/[^\d]/g, "")
                          .slice(0, 16)
                          .replace(/(\d{4})(?=\d)/g, "$1 "),
                      })
                    }
                    error={errors.cardNumber}
                    errorNonce={errorNonce}
                  />
                  {cardType ? (
                    <span className="absolute right-4 top-[17px] rounded border border-line bg-elevated px-2 py-1 text-[10px] font-bold text-primary">
                      {cardType}
                    </span>
                  ) : null}
                </div>
                <FloatingField
                  label={t("checkout.expiry")}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={card.expiry}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/[^\d]/g, "").slice(0, 4);
                    const formatted =
                      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                    setCard({ ...card, expiry: formatted });
                  }}
                  error={errors.cardExpiry}
                  errorNonce={errorNonce}
                />
                <FloatingField
                  label={t("checkout.cvc")}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={card.cvc}
                  onChange={(event) =>
                    setCard({ ...card, cvc: event.target.value.replace(/[^\d]/g, "").slice(0, 4) })
                  }
                  error={errors.cardCvc}
                  errorNonce={errorNonce}
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="h-14 rounded-lg border border-line px-6 text-sm font-medium text-secondary transition-colors hover:border-white hover:text-primary"
                >
                  {t("checkout.back")}
                </button>
                <button
                  type="button"
                  onClick={() => validateCard() && placeOrder()}
                  className={continueButtonClass}
                >
                  {t("checkout.pay")} {formatPrice(subtotal + shippingCost)}
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-muted">
                {t("checkout.demo")}
              </p>
            </section>
          ) : null}
        </div>

        <OrderSummary shippingCost={shippingCost} />
      </div>
    </div>
  );
}
