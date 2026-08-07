import type { Product, Review, Size } from "./types";

export const ALL_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export const CUSTOMIZATION_PRICE = 15;

export const PRODUCTS: Product[] = [
  {
    id: "p01",
    slug: "crimson-fc-home-2026",
    team: "Crimson FC",
    name: "Home Jersey 2026",
    category: "club",
    price: 89,
    badge: "new",
    number: 10,
    colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
    altColors: { body: "#111111", sleeve: "#b3122f", accent: "#b3122f", text: "#ffffff" },
    rating: 4.8,
    reviewCount: 214,
    description:
      "The 2026 home shirt in deep crimson with breathable knit zones, an athletic cut and a woven crest. Made from 100% recycled polyester with sweat-wicking finish — built for the stands and the street.",
    soldOutSizes: [],
  },
  {
    id: "p02",
    slug: "royal-madrid-home-2026",
    team: "Royal Madrid",
    name: "Home Jersey 2026",
    category: "club",
    price: 94,
    number: 7,
    colors: { body: "#f4f4f4", sleeve: "#e8e8e8", accent: "#1c3f94", text: "#1c3f94" },
    rating: 4.9,
    reviewCount: 388,
    description:
      "All-white with royal blue detailing. A clean, iconic silhouette with a ribbed V-neck collar and heat-pressed crest. The kit of kings.",
    soldOutSizes: ["XS"],
  },
  {
    id: "p03",
    slug: "azure-city-away-2026",
    team: "Azure City",
    name: "Away Jersey 2026",
    category: "club",
    price: 89,
    salePrice: 71,
    badge: "sale",
    number: 9,
    colors: { body: "#0e1b2c", sleeve: "#132c4a", accent: "#00b7ff", text: "#00b7ff" },
    rating: 4.7,
    reviewCount: 156,
    description:
      "Midnight navy with electric blue trim. Engineered mesh side panels keep you cool whether you're in the away end or on the pitch.",
    soldOutSizes: ["XXL"],
  },
  {
    id: "p04",
    slug: "north-forest-home-2026",
    team: "North Forest",
    name: "Home Jersey 2026",
    category: "club",
    price: 85,
    number: 11,
    colors: { body: "#0c5132", sleeve: "#083d26", accent: "#ffd200", text: "#ffd200" },
    rating: 4.6,
    reviewCount: 98,
    description:
      "Forest green with gold accents — a nod to the club's golden era. Soft-touch jacquard fabric with a two-button retro collar.",
    soldOutSizes: [],
  },
  {
    id: "p05",
    slug: "albiceleste-home-2026",
    team: "Argentina",
    name: "National Team Home 2026",
    category: "national",
    price: 99,
    badge: "new",
    number: 10,
    colors: { body: "#9fd7f5", sleeve: "#ffffff", accent: "#1a2a6c", text: "#1a2a6c" },
    rating: 5.0,
    reviewCount: 512,
    description:
      "Sky blue and white stripes with three stars above the crest. The shirt of champions, cut for fans with premium double-knit fabric.",
    soldOutSizes: ["S"],
  },
  {
    id: "p06",
    slug: "seleccao-home-2026",
    team: "Brazil",
    name: "National Team Home 2026",
    category: "national",
    price: 99,
    number: 10,
    colors: { body: "#ffdc02", sleeve: "#f7c800", accent: "#009739", text: "#009739" },
    rating: 4.9,
    reviewCount: 431,
    description:
      "The famous canary yellow with green trim. Lightweight, fast-drying and unmistakable — samba football in shirt form.",
    soldOutSizes: [],
  },
  {
    id: "p07",
    slug: "les-bleus-home-2026",
    team: "France",
    name: "National Team Home 2026",
    category: "national",
    price: 99,
    salePrice: 79,
    badge: "sale",
    number: 10,
    colors: { body: "#16214a", sleeve: "#0e1633", accent: "#e63946", text: "#ffffff" },
    rating: 4.8,
    reviewCount: 267,
    description:
      "Deep navy with tricolore accents and a gold-embroidered rooster crest. Elegant, modern, and built to win.",
    soldOutSizes: ["XS", "XXL"],
  },
  {
    id: "p08",
    slug: "crimson-fc-retro-1999",
    team: "Crimson FC",
    name: "Retro Jersey 1999",
    category: "retro",
    price: 109,
    number: 7,
    colors: { body: "#8f0f26", sleeve: "#ffffff", accent: "#ffffff", text: "#ffffff" },
    rating: 4.9,
    reviewCount: 189,
    description:
      "A faithful remake of the treble-season classic — embroidered crest, lace-up collar and heavyweight 220gsm fabric like they used to make.",
    soldOutSizes: ["M"],
  },
  {
    id: "p09",
    slug: "azzurri-retro-1994",
    team: "Italia",
    name: "Retro Jersey 1994",
    category: "retro",
    price: 105,
    salePrice: 84,
    badge: "sale",
    number: 10,
    colors: { body: "#1f4fa3", sleeve: "#173d80", accent: "#ffffff", text: "#ffffff" },
    rating: 4.7,
    reviewCount: 143,
    description:
      "Azzurri blue from the summer of '94. Boxy nineties fit, shadow-stripe fabric and the tricolore on the collar.",
    soldOutSizes: [],
  },
  {
    id: "p10",
    slug: "offside-training-top-2026",
    team: "OFFside Pro",
    name: "Training Top 2026",
    category: "training",
    price: 59,
    number: 26,
    colors: { body: "#1c1c1e", sleeve: "#2c2c2e", accent: "#ff3b30", text: "#ffffff" },
    rating: 4.5,
    reviewCount: 77,
    description:
      "Quarter-zip training top in stealth black with reflective red piping. Thumb loops, stretch fabric, zero distractions.",
    soldOutSizes: [],
  },
  {
    id: "p11",
    slug: "crimson-fc-kids-home-2026",
    team: "Crimson FC",
    name: "Kids Home Kit 2026",
    category: "kids",
    price: 64,
    badge: "new",
    number: 10,
    colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
    rating: 4.8,
    reviewCount: 121,
    description:
      "The full home kit scaled down — shirt, shorts and socks. Softer fabric, easy-pull collar, and room to grow into greatness.",
    soldOutSizes: ["XL", "XXL"],
  },
  {
    id: "p12",
    slug: "portugal-home-2026",
    team: "Portugal",
    name: "National Team Home 2026",
    category: "national",
    price: 99,
    number: 7,
    colors: { body: "#a4161a", sleeve: "#7a1013", accent: "#0f6b3c", text: "#ffffff" },
    rating: 4.9,
    reviewCount: 356,
    description:
      "Rich scarlet with emerald green trim and a gold crest. Worn by legends, made for the next generation of believers.",
    soldOutSizes: [],
  },
];

export const REVIEWS: Review[] = [
  { name: "Marcus T.", quote: "Feels exactly like the ones players wear. Print quality is unreal.", rating: 5 },
  { name: "Ayesha K.", quote: "Ordered Friday, wore it to the derby Sunday. Instant classic.", rating: 5 },
  { name: "Diego R.", quote: "The retro '99 shirt made my dad tear up. Worth every penny.", rating: 5 },
  { name: "Lena M.", quote: "Custom name and number came out perfect. True to size.", rating: 4 },
  { name: "Sam O.", quote: "Fabric is breathable even in summer. Best kit I own.", rating: 5 },
  { name: "Rafi H.", quote: "Fast shipping and the colors pop way more in person.", rating: 5 },
  { name: "Julia P.", quote: "Bought matching kids kits for my twins. Adorable and durable.", rating: 5 },
  { name: "Kwame A.", quote: "The 12th man lives in this shirt. Matchday essential.", rating: 5 },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  const sameCategory = PRODUCTS.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  );
  const others = PRODUCTS.filter(
    (candidate) => candidate.id !== product.id && candidate.category !== product.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}

export function getEffectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}
