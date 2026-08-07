import Logo from "./Logo";
import PaymentIcons from "./PaymentIcons";
import TransitionLink from "@/components/fx/TransitionLink";
import { SOCIAL_LINKS } from "@/lib/site";

const SHOP_LINKS = [
  { label: "All Jerseys", href: "/shop" },
  { label: "Club Kits", href: "/shop?cat=club" },
  { label: "National Teams", href: "/shop?cat=national" },
  { label: "Retro", href: "/shop?cat=retro" },
  { label: "Kids", href: "/shop?cat=kids" },
];

const SUPPORT_LINKS = ["Size Guide", "Shipping & Returns", "Order Tracking", "FAQ", "Contact"];
const COMPANY_LINKS = ["About OFFside", "Stores", "Careers", "Press"];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-card pb-24 md:pb-0">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Shop</h3>
          <ul className="flex flex-col gap-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <TransitionLink href={link.href} className="footer-link">
                  {link.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Support</h3>
          <ul className="flex flex-col gap-2.5">
            {SUPPORT_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className="footer-link">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Company</h3>
          <ul className="flex flex-col gap-2.5">
            {COMPANY_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className="footer-link">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Social</h3>
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
          <Logo className="!text-base" />
          <p>
            © {new Date().getFullYear()} OFFside. Made for fans.
          </p>
        </div>
      </div>
    </footer>
  );
}
