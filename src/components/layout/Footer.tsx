"use client";

import Logo from "./Logo";
import PaymentIcons from "./PaymentIcons";
import TransitionLink from "@/components/fx/TransitionLink";
import { useT } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/dictionary";
import { SOCIAL_LINKS } from "@/lib/site";

const SHOP_LINKS: { labelKey: MessageKey; href: string }[] = [
  { labelKey: "footer.allJerseys", href: "/shop" },
  { labelKey: "cat.club", href: "/shop?cat=club" },
  { labelKey: "cat.national", href: "/shop?cat=national" },
  { labelKey: "cat.retro", href: "/shop?cat=retro" },
  { labelKey: "cat.kids", href: "/shop?cat=kids" },
];

const SUPPORT_LINKS: MessageKey[] = [
  "footer.sizeGuide",
  "footer.shipping",
  "footer.tracking",
  "footer.faq",
  "footer.contact",
];

const COMPANY_LINKS: MessageKey[] = [
  "footer.about",
  "footer.stores",
  "footer.careers",
  "footer.press",
];

export default function Footer() {
  const t = useT();

  return (
    <footer className="mt-auto border-t border-line bg-card pb-24 md:pb-0">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("footer.shop")}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.labelKey}>
                <TransitionLink href={link.href} className="footer-link">
                  {t(link.labelKey)}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("footer.support")}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {SUPPORT_LINKS.map((labelKey) => (
              <li key={labelKey}>
                <a href="#" className="footer-link">
                  {t(labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("footer.company")}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {COMPANY_LINKS.map((labelKey) => (
              <li key={labelKey}>
                <a href="#" className="footer-link">
                  {t(labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            {t("footer.social")}
          </h3>
          <ul className="mb-6 flex flex-col gap-2.5">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="footer-link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <PaymentIcons />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted md:flex-row md:px-8">
          <Logo size="sm" />
          <p>
            © {new Date().getFullYear()} OFFside. {t("footer.madeForFans")}
          </p>
        </div>
      </div>
    </footer>
  );
}
