export const SITE_NAME = "OFFside";

export const NAV_LINKS = [
  { labelKey: "nav.shop", href: "/shop" },
  { labelKey: "nav.teams", href: "/shop?cat=national" },
  { labelKey: "nav.new", href: "/shop?tag=new" },
  { labelKey: "nav.sale", href: "/shop?tag=sale" },
  { labelKey: "nav.custom", href: "/#customize" },
] as const;

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61592579166791" },
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "X", href: "#" },
] as const;

export const NAV_SOLID_SCROLL_Y = 100;

/** The client's Facebook page inbox. */
export const MESSENGER_URL = "https://m.me/61592579166791";

/* Contact/payment numbers — set in .env.local / Vercel env, safe to expose. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "";
export const NAGAD_NUMBER = process.env.NEXT_PUBLIC_NAGAD_NUMBER ?? "";
export const IS_SSLCOMMERZ_ENABLED = process.env.NEXT_PUBLIC_SSLCOMMERZ_ENABLED === "true";
