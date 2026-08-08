import type { Product, Review, Size } from "./types";

export const ALL_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export const CUSTOMIZATION_PRICE = 150;

export const PRODUCTS: Product[] = [
  {
    id: "p01",
    slug: "crimson-fc-home-2026",
    team: "Crimson FC",
    teamBn: "ক্রিমসন এফসি",
    name: "Home Jersey 2026",
    nameBn: "হোম জার্সি ২০২৬",
    category: "club",
    price: 549,
    badge: "new",
    number: 10,
    colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
    altColors: { body: "#111111", sleeve: "#b3122f", accent: "#b3122f", text: "#ffffff" },
    rating: 4.8,
    reviewCount: 214,
    description:
      "The 2026 home shirt in deep crimson with breathable knit zones, an athletic cut and a woven crest. Made from 100% recycled polyester with sweat-wicking finish — built for the stands and the street.",
    descriptionBn:
      "গাঢ় ক্রিমসন রঙের ২০২৬ হোম শার্ট — ব্রিদেবল নিট জোন, অ্যাথলেটিক কাট আর বোনা ক্রেস্ট। ১০০% রিসাইকেলড পলিয়েস্টারে তৈরি, ঘাম শুষে নেওয়া ফিনিশ — গ্যালারি থেকে রাস্তা, সবখানের জন্য।",
    soldOutSizes: [],
  },
  {
    id: "p02",
    slug: "royal-madrid-home-2026",
    team: "Royal Madrid",
    teamBn: "রয়্যাল মাদ্রিদ",
    name: "Home Jersey 2026",
    nameBn: "হোম জার্সি ২০২৬",
    category: "club",
    price: 599,
    number: 7,
    colors: { body: "#f4f4f4", sleeve: "#e8e8e8", accent: "#1c3f94", text: "#1c3f94" },
    rating: 4.9,
    reviewCount: 388,
    description:
      "All-white with royal blue detailing. A clean, iconic silhouette with a ribbed V-neck collar and heat-pressed crest. The kit of kings.",
    descriptionBn:
      "রয়্যাল ব্লু ডিটেইলিং সহ ধবধবে সাদা। রিবড ভি-নেক কলার আর হিট-প্রেসড ক্রেস্ট সহ পরিচ্ছন্ন, আইকনিক সিলুয়েট। রাজাদের কিট।",
    soldOutSizes: ["XS"],
  },
  {
    id: "p03",
    slug: "azure-city-away-2026",
    team: "Azure City",
    teamBn: "অ্যাজিউর সিটি",
    name: "Away Jersey 2026",
    nameBn: "অ্যাওয়ে জার্সি ২০২৬",
    category: "club",
    price: 549,
    salePrice: 449,
    badge: "sale",
    number: 9,
    colors: { body: "#0e1b2c", sleeve: "#132c4a", accent: "#00b7ff", text: "#00b7ff" },
    rating: 4.7,
    reviewCount: 156,
    description:
      "Midnight navy with electric blue trim. Engineered mesh side panels keep you cool whether you're in the away end or on the pitch.",
    descriptionBn:
      "ইলেকট্রিক ব্লু ট্রিম সহ মিডনাইট নেভি। ইঞ্জিনিয়ার্ড মেশ সাইড প্যানেল আপনাকে ঠান্ডা রাখে — অ্যাওয়ে গ্যালারিতে হোক বা মাঠে।",
    soldOutSizes: ["XXL"],
  },
  {
    id: "p04",
    slug: "north-forest-home-2026",
    team: "North Forest",
    teamBn: "নর্থ ফরেস্ট",
    name: "Home Jersey 2026",
    nameBn: "হোম জার্সি ২০২৬",
    category: "club",
    price: 529,
    number: 11,
    colors: { body: "#0c5132", sleeve: "#083d26", accent: "#ffd200", text: "#ffd200" },
    rating: 4.6,
    reviewCount: 98,
    description:
      "Forest green with gold accents — a nod to the club's golden era. Soft-touch jacquard fabric with a two-button retro collar.",
    descriptionBn:
      "সোনালি অ্যাকসেন্ট সহ ফরেস্ট গ্রিন — ক্লাবের সোনালি যুগের প্রতি শ্রদ্ধা। সফট-টাচ জ্যাকার্ড ফ্যাব্রিক আর টু-বাটন রেট্রো কলার।",
    soldOutSizes: [],
  },
  {
    id: "p05",
    slug: "albiceleste-home-2026",
    team: "Argentina",
    teamBn: "আর্জেন্টিনা",
    name: "National Team Home 2026",
    nameBn: "জাতীয় দলের হোম ২০২৬",
    category: "national",
    price: 649,
    badge: "new",
    number: 10,
    colors: { body: "#9fd7f5", sleeve: "#ffffff", accent: "#1a2a6c", text: "#1a2a6c" },
    rating: 5.0,
    reviewCount: 512,
    description:
      "Sky blue and white stripes with three stars above the crest. The shirt of champions, cut for fans with premium double-knit fabric.",
    descriptionBn:
      "ক্রেস্টের ওপর তিন তারা সহ আকাশি-সাদা ডোরা। চ্যাম্পিয়নদের শার্ট, প্রিমিয়াম ডাবল-নিট ফ্যাব্রিকে ভক্তদের জন্য তৈরি।",
    soldOutSizes: ["S"],
  },
  {
    id: "p06",
    slug: "seleccao-home-2026",
    team: "Brazil",
    teamBn: "ব্রাজিল",
    name: "National Team Home 2026",
    nameBn: "জাতীয় দলের হোম ২০২৬",
    category: "national",
    price: 649,
    number: 10,
    colors: { body: "#ffdc02", sleeve: "#f7c800", accent: "#009739", text: "#009739" },
    rating: 4.9,
    reviewCount: 431,
    description:
      "The famous canary yellow with green trim. Lightweight, fast-drying and unmistakable — samba football in shirt form.",
    descriptionBn:
      "সবুজ ট্রিম সহ বিখ্যাত ক্যানারি হলুদ। হালকা, দ্রুত শুকায় আর এক নজরেই চেনা যায় — শার্টের রূপে সাম্বা ফুটবল।",
    soldOutSizes: [],
  },
  {
    id: "p07",
    slug: "les-bleus-home-2026",
    team: "France",
    teamBn: "ফ্রান্স",
    name: "National Team Home 2026",
    nameBn: "জাতীয় দলের হোম ২০২৬",
    category: "national",
    price: 649,
    salePrice: 519,
    badge: "sale",
    number: 10,
    colors: { body: "#16214a", sleeve: "#0e1633", accent: "#e63946", text: "#ffffff" },
    rating: 4.8,
    reviewCount: 267,
    description:
      "Deep navy with tricolore accents and a gold-embroidered rooster crest. Elegant, modern, and built to win.",
    descriptionBn:
      "ত্রিরঙা অ্যাকসেন্ট আর সোনালি সুতোয় বোনা মোরগ ক্রেস্ট সহ গাঢ় নেভি। মার্জিত, আধুনিক, জয়ের জন্য তৈরি।",
    soldOutSizes: ["XS", "XXL"],
  },
  {
    id: "p08",
    slug: "crimson-fc-retro-1999",
    team: "Crimson FC",
    teamBn: "ক্রিমসন এফসি",
    name: "Retro Jersey 1999",
    nameBn: "রেট্রো জার্সি ১৯৯৯",
    category: "retro",
    price: 899,
    number: 7,
    colors: { body: "#8f0f26", sleeve: "#ffffff", accent: "#ffffff", text: "#ffffff" },
    rating: 4.9,
    reviewCount: 189,
    description:
      "A faithful remake of the treble-season classic — embroidered crest, lace-up collar and heavyweight 220gsm fabric like they used to make.",
    descriptionBn:
      "ট্রেবল মৌসুমের ক্লাসিকের বিশ্বস্ত রিমেক — এমব্রয়ডারি করা ক্রেস্ট, লেস-আপ কলার আর আগেকার দিনের মতো ভারী ২২০ জিএসএম ফ্যাব্রিক।",
    soldOutSizes: ["M"],
  },
  {
    id: "p09",
    slug: "azzurri-retro-1994",
    team: "Italia",
    teamBn: "ইতালিয়া",
    name: "Retro Jersey 1994",
    nameBn: "রেট্রো জার্সি ১৯৯৪",
    category: "retro",
    price: 949,
    salePrice: 759,
    badge: "sale",
    number: 10,
    colors: { body: "#1f4fa3", sleeve: "#173d80", accent: "#ffffff", text: "#ffffff" },
    rating: 4.7,
    reviewCount: 143,
    description:
      "Azzurri blue from the summer of '94. Boxy nineties fit, shadow-stripe fabric and the tricolore on the collar.",
    descriptionBn:
      "'৯৪-এর গ্রীষ্মের আজ্জুরি নীল। নব্বইয়ের ঢিলেঢালা ফিট, শ্যাডো-স্ট্রাইপ ফ্যাব্রিক আর কলারে ত্রিরঙা।",
    soldOutSizes: [],
  },
  {
    id: "p10",
    slug: "offside-training-top-2026",
    team: "OFFside Pro",
    teamBn: "OFFside প্রো",
    name: "Training Top 2026",
    nameBn: "ট্রেনিং টপ ২০২৬",
    category: "training",
    price: 649,
    number: 26,
    colors: { body: "#1c1c1e", sleeve: "#2c2c2e", accent: "#ff3b30", text: "#ffffff" },
    rating: 4.5,
    reviewCount: 77,
    description:
      "Quarter-zip training top in stealth black with reflective red piping. Thumb loops, stretch fabric, zero distractions.",
    descriptionBn:
      "রিফ্লেক্টিভ লাল পাইপিং সহ স্টেলথ ব্ল্যাক কোয়ার্টার-জিপ ট্রেনিং টপ। থাম্ব লুপ, স্ট্রেচ ফ্যাব্রিক, মনোযোগ শুধু খেলায়।",
    soldOutSizes: [],
  },
  {
    id: "p11",
    slug: "crimson-fc-kids-home-2026",
    team: "Crimson FC",
    teamBn: "ক্রিমসন এফসি",
    name: "Kids Home Kit 2026",
    nameBn: "কিডস হোম কিট ২০২৬",
    category: "kids",
    price: 449,
    badge: "new",
    number: 10,
    colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
    rating: 4.8,
    reviewCount: 121,
    description:
      "The full home kit scaled down — shirt, shorts and socks. Softer fabric, easy-pull collar, and room to grow into greatness.",
    descriptionBn:
      "পুরো হোম কিট ছোটদের মাপে — শার্ট, শর্টস আর মোজা। নরম ফ্যাব্রিক, সহজে পরার কলার, আর বড় হয়ে ওঠার জায়গা।",
    soldOutSizes: ["XL", "XXL"],
  },
  {
    id: "p12",
    slug: "portugal-home-2026",
    team: "Portugal",
    teamBn: "পর্তুগাল",
    name: "National Team Home 2026",
    nameBn: "জাতীয় দলের হোম ২০২৬",
    category: "national",
    price: 649,
    number: 7,
    colors: { body: "#a4161a", sleeve: "#7a1013", accent: "#0f6b3c", text: "#ffffff" },
    rating: 4.9,
    reviewCount: 356,
    description:
      "Rich scarlet with emerald green trim and a gold crest. Worn by legends, made for the next generation of believers.",
    descriptionBn:
      "এমারেল্ড সবুজ ট্রিম আর সোনালি ক্রেস্ট সহ গাঢ় লাল। কিংবদন্তিদের পরা, পরের প্রজন্মের বিশ্বাসীদের জন্য তৈরি।",
    soldOutSizes: [],
  },
];

export const REVIEWS: Review[] = [
  { name: "Marcus T.", quote: "Feels exactly like the ones players wear. Print quality is unreal.", quoteBn: "খেলোয়াড়রা যেটা পরে ঠিক সেটার মতোই লাগে। প্রিন্টের মান অসাধারণ।", rating: 5 },
  { name: "Ayesha K.", quote: "Ordered Friday, wore it to the derby Sunday. Instant classic.", quoteBn: "শুক্রবারে অর্ডার করলাম, রবিবারের ডার্বিতে পরলাম। এক কথায় ক্লাসিক।", rating: 5 },
  { name: "Diego R.", quote: "The retro '99 shirt made my dad tear up. Worth every penny.", quoteBn: "রেট্রো '৯৯ শার্ট দেখে বাবার চোখে পানি চলে এল। প্রতিটি টাকা উসুল।", rating: 5 },
  { name: "Lena M.", quote: "Custom name and number came out perfect. True to size.", quoteBn: "কাস্টম নাম আর নম্বর নিখুঁত হয়েছে। সাইজও একদম ঠিক।", rating: 4 },
  { name: "Sam O.", quote: "Fabric is breathable even in summer. Best kit I own.", quoteBn: "গরমেও ফ্যাব্রিক আরামদায়ক। আমার সেরা কিট এটাই।", rating: 5 },
  { name: "Rafi H.", quote: "Fast shipping and the colors pop way more in person.", quoteBn: "দ্রুত ডেলিভারি, আর রংগুলো বাস্তবে আরও বেশি উজ্জ্বল।", rating: 5 },
  { name: "Julia P.", quote: "Bought matching kids kits for my twins. Adorable and durable.", quoteBn: "যমজদের জন্য ম্যাচিং কিডস কিট নিলাম। কিউট আর টেকসই।", rating: 5 },
  { name: "Kwame A.", quote: "The 12th man lives in this shirt. Matchday essential.", quoteBn: "এই শার্টেই বাঁচে দ্বাদশ খেলোয়াড়। ম্যাচডের অপরিহার্য সঙ্গী।", rating: 5 },
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
