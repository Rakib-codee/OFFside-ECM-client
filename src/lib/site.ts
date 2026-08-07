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
