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
import { useLocale, useT } from "@/lib/i18n/locale";
import { localizedNameById, localizedTeamById } from "@/lib/i18n/localize";
import { shippingFor, type DeliveryZone } from "@/lib/shipping";
import { BKASH_NUMBER, IS_SSLCOMMERZ_ENABLED, NAGAD_NUMBER } from "@/lib/site";
import { useCartStore } from "@/lib/store/cart";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BD_PHONE_PATTERN = /^01[3-9]\d{8}$/;
export const ORDER_STORAGE_KEY = "offside-order";

type PaymentMethod = "cod" | "bkash" | "nagad" | "sslcommerz";

interface InfoForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
}

const EMPTY_INFO: InfoForm = { name: "", phone: "", email: "", address: "", district: "" };

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
  const [zone, setZone] = useState<DeliveryZone>("dhaka");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [trxId, setTrxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingCost = shippingFor(zone, subtotal);
  const total = subtotal + shippingCost;
  const isManualPayment = paymentMethod === "bkash" || paymentMethod === "nagad";

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
    if (info.name.trim().length < 2) nextErrors.name = t("checkout.required");
    if (!BD_PHONE_PATTERN.test(info.phone.replace(/[\s-]/g, ""))) {
      nextErrors.phone = t("checkout.validPhone");
    }
    if (info.email.trim() && !EMAIL_PATTERN.test(info.email.trim())) {
      nextErrors.email = t("checkout.validEmail");
    }
    if (info.address.trim().length < 5) nextErrors.address = t("checkout.required");
    if (info.district.trim().length < 2) nextErrors.district = t("checkout.required");
    if (Object.keys(nextErrors).length > 0) {
      failValidation(nextErrors);
      return false;
    }
    return true;
  };

  const goToStep = (nextStep: number) => {
    setErrors({});
    setSubmitError("");
    setStep(nextStep);
    window.scrollTo({ top: 0 });
  };

  const buildPayload = () => ({
    customer: {
      name: info.name.trim(),
      phone: info.phone.replace(/[\s-]/g, ""),
      email: info.email.trim() || undefined,
      address: info.address.trim(),
      district: info.district.trim(),
    },
    zone,
    paymentMethod,
    paymentRef: isManualPayment ? trxId.trim() : undefined,
    items: items.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      customName: item.customName,
      customNumber: item.customNumber,
    })),
    locale,
  });

  const placeOrder = async () => {
    if (isManualPayment && trxId.trim().length < 4) {
      failValidation({ trxId: t("checkout.validTrx") });
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (paymentMethod === "sslcommerz") {
        const response = await fetch("/api/payment/sslcommerz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const session = (await response.json()) as { gatewayUrl?: string; error?: string };
        if (!response.ok || !session.gatewayUrl) {
          throw new Error(session.error || "gateway");
        }
        window.location.assign(session.gatewayUrl);
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const result = (await response.json()) as {
        orderNo?: string;
        total?: number;
        error?: string;
      };
      if (!response.ok || !result.orderNo) {
        throw new Error(result.error || "order");
      }

      const summary = items
        .map(
          (item) =>
            `${item.quantity}× ${item.team} ${item.name} (${item.size}` +
            `${item.customName ? `, ${item.customName}` : ""}` +
            `${item.customNumber ? ` #${item.customNumber}` : ""})`,
        )
        .join("; ");
      sessionStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify({
          number: result.orderNo,
          email: info.email.trim(),
          total: result.total ?? total,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          summary,
        }),
      );
      clearCart();
      router.push("/checkout/success");
    } catch {
      setSubmitError(t("checkout.orderFailed"));
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
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
    "h-14 w-full rounded-lg bg-cta font-medium text-cta-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60";
  const backButtonClass =
    "h-14 rounded-lg border border-line px-6 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary";

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold md:text-4xl">{t("checkout.title")}</h1>
      <ProgressSteps currentStep={step} />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[60%_1fr]">
        <div>
          {step === 0 ? (
            <section aria-label={t("checkout.review")}>
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
                      <p className="text-xs uppercase tracking-wider text-secondary">
                        {localizedTeamById(item.productId, item.team, locale)}
                      </p>
                      <p className="truncate font-medium">
                        {localizedNameById(item.productId, item.name, locale)}
                      </p>
                      <p className="text-xs text-muted">
                        {t("cart.size")} {item.size}
                        {item.customName ? ` · ${item.customName}` : ""}
                        {item.customNumber ? ` #${item.customNumber}` : ""}
                      </p>
                    </div>
                    <QtyStepper
                      value={item.quantity}
                      onChange={(next) => setQuantity(item.key, next)}
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
            <section aria-label={t("checkout.yourInfo")}>
              <h2 className="mb-6 font-display text-2xl font-semibold">{t("checkout.yourInfo")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FloatingField
                  label={t("checkout.fullName")}
                  autoComplete="name"
                  value={info.name}
                  onChange={(event) => updateInfo("name", event.target.value)}
                  error={errors.name}
                  errorNonce={errorNonce}
                  className="sm:col-span-2"
                />
                <FloatingField
                  label={t("checkout.phone")}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={info.phone}
                  onChange={(event) => updateInfo("phone", event.target.value)}
                  error={errors.phone}
                  errorNonce={errorNonce}
                />
                <FloatingField
                  label={t("checkout.emailOpt")}
                  type="email"
                  autoComplete="email"
                  value={info.email}
                  onChange={(event) => updateInfo("email", event.target.value)}
                  error={errors.email}
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
                  label={t("checkout.district")}
                  autoComplete="address-level2"
                  value={info.district}
                  onChange={(event) => updateInfo("district", event.target.value)}
                  error={errors.district}
                  errorNonce={errorNonce}
                  className="sm:col-span-2"
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => goToStep(0)} className={backButtonClass}>
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
            <section aria-label={t("checkout.shippingTitle")}>
              <h2 className="mb-6 font-display text-2xl font-semibold">
                {t("checkout.shippingTitle")}
              </h2>
              <div className="flex flex-col gap-3" role="radiogroup" aria-label={t("checkout.shippingTitle")}>
                {(
                  [
                    { key: "dhaka" as const, title: t("checkout.insideDhaka"), detail: t("checkout.etaInside") },
                    { key: "outside" as const, title: t("checkout.outsideDhaka"), detail: t("checkout.etaOutside") },
                  ]
                ).map((option) => {
                  const cost = shippingFor(option.key, subtotal);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={zone === option.key}
                      onClick={() => setZone(option.key)}
                      className={`flex items-center justify-between rounded-xl border p-5 text-left transition-colors ${
                        zone === option.key
                          ? "border-accent bg-accent/5"
                          : "border-line bg-card hover:border-muted"
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{option.title}</span>
                        <span className="block text-sm text-secondary">{option.detail}</span>
                      </span>
                      <span className="font-medium tnum">
                        {cost === 0 ? t("cart.free") : formatPrice(cost)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => goToStep(1)} className={backButtonClass}>
                  {t("checkout.back")}
                </button>
                <button type="button" onClick={() => goToStep(3)} className={continueButtonClass}>
                  {t("checkout.contPayment")}
                </button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section aria-label={t("checkout.paymentTitle")}>
              <h2 className="mb-6 font-display text-2xl font-semibold">
                {t("checkout.paymentTitle")}
              </h2>
              <div className="flex flex-col gap-3" role="radiogroup" aria-label={t("checkout.paymentTitle")}>
                <PaymentOption
                  isSelected={paymentMethod === "cod"}
                  onSelect={() => setPaymentMethod("cod")}
                  title={t("checkout.payCod")}
                  detail={t("checkout.payCodDetail")}
                />
                <PaymentOption
                  isSelected={paymentMethod === "bkash"}
                  onSelect={() => setPaymentMethod("bkash")}
                  title={t("checkout.payBkash")}
                  detail={t("checkout.payManualDetail")}
                />
                <PaymentOption
                  isSelected={paymentMethod === "nagad"}
                  onSelect={() => setPaymentMethod("nagad")}
                  title={t("checkout.payNagad")}
                  detail={t("checkout.payManualDetail")}
                />
                {IS_SSLCOMMERZ_ENABLED ? (
                  <PaymentOption
                    isSelected={paymentMethod === "sslcommerz"}
                    onSelect={() => setPaymentMethod("sslcommerz")}
                    title={t("checkout.payOnline")}
                    detail={t("checkout.payOnlineDetail")}
                  />
                ) : null}
              </div>

              {isManualPayment ? (
                <div className="mt-5 rounded-xl border border-line bg-card p-5">
                  <p className="mb-3 text-sm text-secondary">
                    {t("checkout.sendTo")}:{" "}
                    <strong className="text-primary tnum">
                      {(paymentMethod === "bkash" ? BKASH_NUMBER : NAGAD_NUMBER) || "01XXX-XXXXXX"}
                    </strong>{" "}
                    · <span className="tnum">{formatPrice(total)}</span>
                  </p>
                  <FloatingField
                    label={t("checkout.trxId")}
                    value={trxId}
                    onChange={(event) => {
                      setTrxId(event.target.value);
                      if (errors.trxId) {
                        setErrors((current) => ({ ...current, trxId: undefined }));
                      }
                    }}
                    error={errors.trxId}
                    errorNonce={errorNonce}
                  />
                </div>
              ) : null}

              {submitError ? (
                <p role="alert" className="mt-4 text-sm text-accent">
                  {submitError}
                </p>
              ) : null}

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => goToStep(2)} className={backButtonClass}>
                  {t("checkout.back")}
                </button>
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={isSubmitting}
                  className={continueButtonClass}
                >
                  {isSubmitting
                    ? t("checkout.placing")
                    : `${t("checkout.placeOrder")} — ${formatPrice(total)}`}
                </button>
              </div>
            </section>
          ) : null}
        </div>

        <OrderSummary shippingCost={shippingCost} />
      </div>
    </div>
  );
}

function PaymentOption({
  isSelected,
  onSelect,
  title,
  detail,
}: {
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`flex items-center justify-between rounded-xl border p-5 text-left transition-colors ${
        isSelected ? "border-accent bg-accent/5" : "border-line bg-card hover:border-muted"
      }`}
    >
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-secondary">{detail}</span>
      </span>
      <span
        aria-hidden="true"
        className={`h-5 w-5 rounded-full border-2 transition-colors ${
          isSelected ? "border-accent bg-accent" : "border-line"
        }`}
      />
    </button>
  );
}
