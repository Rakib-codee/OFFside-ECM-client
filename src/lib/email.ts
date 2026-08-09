import nodemailer, { type Transporter } from "nodemailer";
import type { OrderRecord } from "./orders";

/**
 * Transactional email: a branded, bilingual order-confirmation for the
 * customer plus a plain-text notification for the shop. Sends through
 * AWS SES via SMTP (nodemailer). Both are best-effort — never block an order.
 *
 * Note: SES only sends from verified identities (SES → Identities), and a
 * sandbox account can only deliver TO verified addresses until production
 * access is granted. Set ORDER_EMAIL_FROM ("Name <email>") to choose the
 * sender; it falls back to ORDER_NOTIFY_EMAIL.
 */

const COPY = {
  en: {
    subject: (orderNo: string) => `Order confirmed ${orderNo} — OFFside`,
    preheader: "Your jersey is being prepared. We'll call you shortly to confirm.",
    title: "Order Confirmed!",
    sub: "Thanks for backing the badge. We'll call you shortly to confirm your order.",
    orderLabel: "ORDER",
    itemsHeading: "Your kit",
    printLabel: "PRINT",
    subtotal: "Subtotal",
    delivery: "Delivery",
    free: "Free",
    total: "Total",
    deliveryHeading: "Delivering to",
    zoneDhaka: "Inside Dhaka · 1–2 working days",
    zoneOutside: "Outside Dhaka · 2–4 working days",
    paymentHeading: "Payment",
    cod: "Cash on Delivery",
    codNote: (total: string) => `Please keep ${total} ready for the delivery man.`,
    bkash: "bKash Send Money",
    nagad: "Nagad Send Money",
    manualNote: (ref: string) => `Transaction ID ${ref} — we'll verify it before shipping.`,
    online: "Paid online",
    trackCta: "Track your order",
    whatsappCta: "WhatsApp us",
    messengerCta: "Messenger",
    footerHours: "Support: every day, 10 AM – 10 PM (Bangladesh time)",
    footerNote: "You received this email because you placed an order at OFFside.",
    footerBrand: "OFFside · Dhaka, Bangladesh · Made for fans",
  },
  bn: {
    subject: (orderNo: string) => `অর্ডার কনফার্ম ${orderNo} — OFFside`,
    preheader: "আপনার জার্সি প্রস্তুত হচ্ছে। কনফার্ম করতে আমরা শিগগিরই ফোন করব।",
    title: "অর্ডার কনফার্ম হয়েছে!",
    sub: "সাথে থাকার জন্য ধন্যবাদ। অর্ডার কনফার্ম করতে আমরা শিগগিরই ফোন করব।",
    orderLabel: "অর্ডার",
    itemsHeading: "আপনার কিট",
    printLabel: "প্রিন্ট",
    subtotal: "সাবটোটাল",
    delivery: "ডেলিভারি",
    free: "ফ্রি",
    total: "মোট",
    deliveryHeading: "ডেলিভারি ঠিকানা",
    zoneDhaka: "ঢাকার ভিতরে · ১–২ কর্মদিবস",
    zoneOutside: "ঢাকার বাইরে · ২–৪ কর্মদিবস",
    paymentHeading: "পেমেন্ট",
    cod: "ক্যাশ অন ডেলিভারি",
    codNote: (total: string) => `ডেলিভারি ম্যানের জন্য ${total} প্রস্তুত রাখুন।`,
    bkash: "বিকাশ সেন্ড মানি",
    nagad: "নগদ সেন্ড মানি",
    manualNote: (ref: string) => `ট্রানজেকশন আইডি ${ref} — শিপিংয়ের আগে আমরা যাচাই করব।`,
    online: "অনলাইনে পরিশোধিত",
    trackCta: "অর্ডার ট্র্যাক করুন",
    whatsappCta: "হোয়াটসঅ্যাপ",
    messengerCta: "মেসেঞ্জার",
    footerHours: "সাপোর্ট: প্রতিদিন সকাল ১০টা – রাত ১০টা",
    footerNote: "OFFside-এ অর্ডার করায় আপনি এই ইমেইলটি পেয়েছেন।",
    footerBrand: "OFFside · ঢাকা, বাংলাদেশ · ভক্তদের জন্য তৈরি",
  },
};

const taka = (amount: number) => `৳${amount.toLocaleString("en-IN")}`;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** One row per item: a jersey chip in the item's colors + details + price. */
function itemRowsHtml(record: OrderRecord, L: (typeof COPY)["en"]): string {
  return record.items
    .map((item) => {
      const isCustomized = Boolean(item.customName || item.customNumber);
      const chipNumber = escapeHtml(item.customNumber ?? "");
      const printPill = isCustomized
        ? `<div style="display:inline-block;margin-top:6px;padding:3px 10px;border-radius:6px;background:rgba(255,59,48,0.12);border:1px solid rgba(255,59,48,0.4);color:#ff3b30;font-size:11px;font-weight:700;letter-spacing:1px;">
             🖨 ${L.printLabel}: ${escapeHtml(item.customName ?? "")}${item.customNumber ? ` #${chipNumber}` : ""}
           </div>`
        : "";
      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;vertical-align:top;width:52px;">
          <div style="width:44px;height:56px;border-radius:8px;background:linear-gradient(160deg,#22222a,#151517);border:1px solid #2a2a2a;text-align:center;line-height:56px;font-size:${item.customNumber ? "18px" : "22px"};color:#ff3b30;font-weight:800;">
            ${item.customNumber ? escapeHtml(item.customNumber) : "👕"}
          </div>
        </td>
        <td style="padding:12px 12px;border-bottom:1px solid #2a2a2a;vertical-align:top;">
          <div style="color:#ffffff;font-size:14px;font-weight:600;">${item.quantity}× ${escapeHtml(item.team)} ${escapeHtml(item.name)}</div>
          <div style="color:#a0a0a0;font-size:12px;margin-top:2px;">Size ${escapeHtml(item.size)}</div>
          ${printPill}
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #2a2a2a;vertical-align:top;color:#ffffff;font-size:14px;font-weight:600;white-space:nowrap;">
          ${taka(item.unitPrice * item.quantity)}
        </td>
      </tr>`;
    })
    .join("");
}

export function renderCustomerOrderEmail(record: OrderRecord, origin: string): {
  subject: string;
  html: string;
} {
  const L = COPY[record.locale === "bn" ? "bn" : "en"];
  const whatsappDigits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits.startsWith("88") ? whatsappDigits : `88${whatsappDigits}`}`
    : null;

  const paymentLine =
    record.payment_method === "cod"
      ? `<div style="color:#ffffff;font-size:14px;font-weight:600;">${L.cod}</div>
         <div style="color:#a0a0a0;font-size:12px;margin-top:4px;">${L.codNote(taka(record.total))}</div>`
      : record.payment_method === "sslcommerz"
        ? `<div style="color:#ffffff;font-size:14px;font-weight:600;">${L.online}</div>`
        : `<div style="color:#ffffff;font-size:14px;font-weight:600;">${record.payment_method === "bkash" ? L.bkash : L.nagad}</div>
           <div style="color:#a0a0a0;font-size:12px;margin-top:4px;">${L.manualNote(escapeHtml(record.payment_ref ?? ""))}</div>`;

  const button = (href: string, label: string, bg: string) =>
    `<a href="${href}" target="_blank"
        style="display:inline-block;margin:0 5px 10px;padding:13px 22px;border-radius:10px;background:${bg};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
       ${label}</a>`;

  const html = `<!DOCTYPE html>
<html lang="${record.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<style>
  @keyframes op-pop { 0% { transform: scale(0.5); opacity: 0; } 65% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes op-ring { 0% { box-shadow: 0 0 0 0 rgba(52,199,89,0.55); } 100% { box-shadow: 0 0 0 24px rgba(52,199,89,0); } }
  @keyframes op-shimmer { 0% { background-position: -300% 0; } 100% { background-position: 300% 0; } }
  .op-check { animation: op-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) both, op-ring 1.6s ease-out 0.5s 3; }
  .op-bar { background-size: 300% 100% !important; animation: op-shimmer 3s linear infinite; }
</style>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans Bengali',sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${L.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:36px 14px;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

    <tr><td align="center" style="padding-bottom:22px;">
      <span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">OFF<span style="color:#ff3b30;">SIDE</span></span>
    </td></tr>

    <tr><td class="op-bar" style="height:4px;border-radius:4px;background:linear-gradient(90deg,#ff3b30,#ff8a80,#ff3b30);font-size:0;">&nbsp;</td></tr>

    <tr><td style="background:#121212;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 18px 18px;padding:38px 30px 30px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center">
          <div class="op-check" style="width:74px;height:74px;border-radius:50%;background:#34c759;color:#ffffff;font-size:36px;font-weight:800;line-height:74px;text-align:center;">✓</div>
          <h1 style="margin:22px 0 8px;color:#ffffff;font-size:27px;font-weight:800;">${L.title}</h1>
          <p style="margin:0 0 20px;color:#a0a0a0;font-size:14px;line-height:1.6;">${L.sub}</p>
          <div style="display:inline-block;padding:9px 20px;border-radius:999px;background:#1a1a1a;border:1px solid #2a2a2a;">
            <span style="color:#666666;font-size:11px;font-weight:700;letter-spacing:2px;">${L.orderLabel}</span>
            <span style="color:#ffffff;font-size:15px;font-weight:800;margin-left:8px;">${escapeHtml(record.order_no)}</span>
          </div>
        </td></tr>
      </table>

      <h2 style="margin:32px 0 4px;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.5px;">${L.itemsHeading}</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${itemRowsHtml(record, L)}
        <tr>
          <td colspan="2" style="padding:12px 12px 4px 0;color:#a0a0a0;font-size:13px;">${L.subtotal}</td>
          <td align="right" style="padding:12px 0 4px;color:#a0a0a0;font-size:13px;">${taka(record.subtotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 12px 4px 0;color:#a0a0a0;font-size:13px;">${L.delivery}</td>
          <td align="right" style="padding:4px 0;color:#a0a0a0;font-size:13px;">${record.shipping === 0 ? L.free : taka(record.shipping)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px 12px 0 0;color:#ffffff;font-size:17px;font-weight:800;border-top:1px solid #2a2a2a;">${L.total}</td>
          <td align="right" style="padding:10px 0 0;color:#ff3b30;font-size:19px;font-weight:800;border-top:1px solid #2a2a2a;">${taka(record.total)}</td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td style="width:50%;padding:16px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px 0 0 12px;vertical-align:top;">
            <div style="color:#666666;font-size:11px;font-weight:700;letter-spacing:1.5px;margin-bottom:8px;">${L.deliveryHeading.toUpperCase()}</div>
            <div style="color:#ffffff;font-size:13px;font-weight:600;">${escapeHtml(record.customer.name)}</div>
            <div style="color:#a0a0a0;font-size:12px;margin-top:3px;line-height:1.5;">${escapeHtml(record.customer.address)}, ${escapeHtml(record.customer.district)}</div>
            <div style="color:#a0a0a0;font-size:12px;margin-top:3px;">${record.customer.zone === "dhaka" ? L.zoneDhaka : L.zoneOutside}</div>
          </td>
          <td style="width:50%;padding:16px;background:#1a1a1a;border:1px solid #2a2a2a;border-left:none;border-radius:0 12px 12px 0;vertical-align:top;">
            <div style="color:#666666;font-size:11px;font-weight:700;letter-spacing:1.5px;margin-bottom:8px;">${L.paymentHeading.toUpperCase()}</div>
            ${paymentLine}
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
        <tr><td align="center">
          ${button(`${origin}/track-order`, L.trackCta, "#ff3b30")}
          ${whatsappHref ? button(whatsappHref, L.whatsappCta, "#25D366") : ""}
          ${button("https://m.me/61592579166791", L.messengerCta, "#007aff")}
        </td></tr>
      </table>

    </td></tr>

    <tr><td align="center" style="padding:24px 20px 8px;">
      <p style="margin:0 0 6px;color:#666666;font-size:12px;">${L.footerHours}</p>
      <p style="margin:0 0 6px;color:#666666;font-size:11px;">${L.footerNote}</p>
      <p style="margin:0;color:#444444;font-size:11px;">${L.footerBrand}</p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject: L.subject(record.order_no), html };
}

interface EmailSender {
  name?: string;
  email: string;
}

/** Parses ORDER_EMAIL_FROM ("Name <email>" or a bare address). */
function parseSender(rawInput: string): EmailSender | null {
  const raw = rawInput.trim().replace(/^"|"$/g, "");
  const withName = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+@[^>]+)>\s*$/);
  if (withName) {
    return { name: withName[1].trim() || undefined, email: withName[2].trim() };
  }
  const bare = raw.trim();
  return bare.includes("@") ? { email: bare } : null;
}

/** ORDER_EMAIL_FROM wins; otherwise fall back to the shop's own notify address. */
function resolveSender(fallbackName: string): EmailSender | null {
  const configured = process.env.ORDER_EMAIL_FROM;
  if (configured) {
    return parseSender(configured);
  }
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL;
  return notifyEmail ? { name: fallbackName, email: notifyEmail } : null;
}

interface EmailMessage {
  fromName: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/** Reused across warm serverless invocations to skip repeat SMTP handshakes. */
let cachedTransport: Transporter | null = null;
let cachedGmailTransport: Transporter | null = null;

/** Gmail SMTP — Google's own servers, so mail lands in the inbox without a
 *  custom domain. Preferred whenever GMAIL_USER + GMAIL_APP_PASSWORD are set. */
function gmailTransport(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return null;
  }
  if (!cachedGmailTransport) {
    cachedGmailTransport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return cachedGmailTransport;
}

export function emailProvider(): "gmail" | "ses" | null {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return "gmail";
  }
  if (
    process.env.AWS_SES_ACCESS_KEY_ID &&
    process.env.AWS_SES_SECRET_ACCESS_KEY &&
    process.env.AWS_SES_REGION
  ) {
    return "ses";
  }
  return null;
}

function sesTransport(): Transporter | null {
  const user = process.env.AWS_SES_ACCESS_KEY_ID;
  const pass = process.env.AWS_SES_SECRET_ACCESS_KEY;
  const region = process.env.AWS_SES_REGION;
  if (!user || !pass || !region) {
    return null;
  }
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: `email-smtp.${region}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: { user, pass },
    });
  }
  return cachedTransport;
}

async function sendEmail(message: EmailMessage): Promise<void> {
  const gmail = gmailTransport();
  if (gmail) {
    try {
      await gmail.sendMail({
        from: { name: message.fromName, address: process.env.GMAIL_USER! },
        to: message.to,
        subject: message.subject,
        ...(message.html ? { html: message.html } : {}),
        ...(message.text ? { text: message.text } : {}),
      });
    } catch (error) {
      console.error("Gmail send error:", error);
    }
    return;
  }
  await sendViaSes(message);
}

async function sendViaSes(message: EmailMessage): Promise<void> {
  const transport = sesTransport();
  if (!transport) {
    console.warn(
      "[email] No email provider configured — set GMAIL_USER + GMAIL_APP_PASSWORD (easiest) or the AWS SES vars, then restart.",
    );
    return;
  }
  const sender = resolveSender(message.fromName);
  if (!sender) {
    console.warn("[email] No sender address — set ORDER_EMAIL_FROM or ORDER_NOTIFY_EMAIL.");
    return;
  }
  try {
    await transport.sendMail({
      from: { name: sender.name ?? message.fromName, address: sender.email },
      to: message.to,
      subject: message.subject,
      ...(message.html ? { html: message.html } : {}),
      ...(message.text ? { text: message.text } : {}),
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

/** The pretty confirmation to the customer — only when they gave an email. */
export async function sendCustomerOrderEmail(record: OrderRecord, origin: string): Promise<void> {
  if (!record.customer.email) {
    return;
  }
  const { subject, html } = renderCustomerOrderEmail(record, origin);
  await sendEmail({ fromName: "OFFside", to: record.customer.email, subject, html });
}

/** Plain-text heads-up to the shop owner. */
export async function sendShopOrderEmail(record: OrderRecord): Promise<void> {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!to) {
    return;
  }
  const lines = record.items.map(
    (item) =>
      `- ${item.team} ${item.name} · ${item.size} × ${item.quantity}` +
      (item.customName ? ` · ${item.customName}` : "") +
      (item.customNumber ? ` #${item.customNumber}` : ""),
  );
  const text = [
    `New order ${record.order_no}`,
    "",
    `Customer: ${record.customer.name}`,
    `Phone: ${record.customer.phone}`,
    `Address: ${record.customer.address}, ${record.customer.district} (${record.customer.zone})`,
    "",
    ...lines,
    "",
    `Subtotal: ৳${record.subtotal}`,
    `Shipping: ৳${record.shipping}`,
    `Total: ৳${record.total}`,
    `Payment: ${record.payment_method}${record.payment_ref ? ` (${record.payment_ref})` : ""}`,
  ].join("\n");

  await sendEmail({
    fromName: "OFFside Orders",
    to,
    subject: `New order ${record.order_no} — ৳${record.total}`,
    text,
  });
}
