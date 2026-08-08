import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter, Oswald, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/fx/SmoothScroll";
import CustomCursor from "@/components/fx/CustomCursor";
import ScrollProgress from "@/components/fx/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import MobileTabBar from "@/components/layout/MobileTabBar";
import CartDrawer from "@/components/cart/CartDrawer";
import { CatalogProvider } from "@/components/CatalogProvider";
import { getCatalog, getSettings } from "@/lib/catalog";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

/** Applies the saved theme before first paint so there is no flash. */
const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("offside-theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export const metadata: Metadata = {
  title: {
    default: "OFFside — Wear the Game",
    template: "%s | OFFside",
  },
  description:
    "Authentic football jerseys. Bold designs. Built for the 12th man.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [products, settings] = await Promise.all([getCatalog(), getSettings()]);
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${oswald.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <CatalogProvider products={products} settings={settings}>
          <SmoothScroll />
          <CustomCursor />
          <ScrollProgress />
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
          <MobileMenu />
          <MobileTabBar />
        </CatalogProvider>
      </body>
    </html>
  );
}
