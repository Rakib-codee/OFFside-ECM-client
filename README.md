# OFFside — Premium Football Jersey Store

A dark-mode-first, animation-heavy e-commerce storefront for authentic football jerseys.
Built with Next.js App Router, GSAP and Lenis — every interaction is designed to feel
alive: magnetic buttons, 3D tilt cards, pinned horizontal scroll, scramble hovers and
buttery smooth scrolling.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom CSS animations |
| Animations | GSAP + ScrollTrigger |
| Smooth scroll | Lenis |
| State | Zustand (cart, UI) |
| Product visuals | Parametric SVG jersey renderer (zero image assets) |
| Hosting | Vercel-ready |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Features

### Homepage
- **Tunnel Walk hero** — staggered word reveal, floodlight backdrop, magnetic CTA,
  animated scroll cue
- **Matchday Live banner** — dismissible, slides in below the nav (toggle in
  `src/lib/site.ts`)
- **The Lineup** — five category panels in a pinned horizontal scroll with parallax
  jerseys (snap carousel on mobile)
- **The Starting XI** — featured product grid with 3D tilt cards, quick-add and badges
- **Make It Yours** — live jersey customizer: name, number and five colorways with a
  slot-machine price
- **The 12th Man** — dual-direction review marquee, pauses on hover
- **Join the Squad** — newsletter with validation and a morphing success button

### Commerce
- **Shop** — category/team/size/price filters (sidebar + mobile bottom sheet),
  instant search, sorting, removable filter chips, show-more pagination
- **Product page** — gallery with crossfade, drag-to-flip and zoom lightbox; size
  pills with sold-out states; debounced live customization preview; morphing
  add-to-cart; interactive sizing guide; reviews breakdown; related kits
- **Cart** — animated drawer (side panel on desktop, bottom sheet on mobile) with
  quantity steppers and free-delivery threshold (৳2,500)
- **Checkout** — four steps built for Bangladesh: BD phone validation, Inside/Outside
  Dhaka delivery zones, **Cash on Delivery**, **bKash/Nagad Send Money** (with
  transaction ID) and optional **SSLCommerz** online payment
- **Orders** — validated and repriced server-side, saved to Supabase, emailed to the
  shop, and handed to the customer's WhatsApp/Messenger from the success page
- **Admin** — password-protected `/admin` dashboard: orders with status flow,
  stats, filters and CSV export, plus a **catalog editor** — add/edit/delete
  products, upload photos, set prices and delivery charges without touching code

### Craft
- Custom lerp cursor with clickable/drag states (fine pointers only)
- Page transitions: squeeze-exit and rise-enter, no white flash
- Scroll progress bar, staggered scroll reveals everywhere
- `prefers-reduced-motion` respected across every animation
- Visible focus rings, ARIA labels, semantic markup
- Fully responsive from 375px up, with a thumb-zone bottom tab bar on mobile

## Project Structure

```
src/
  app/               # Routes: home, shop, product/[slug], checkout, success, account
  components/
    cart/            # Drawer, quantity stepper
    checkout/        # Steps, floating fields, order summary
    fx/              # Animation primitives (cursor, reveals, transitions, marquee…)
    home/            # Homepage sections
    layout/          # Navbar, footer, mobile nav
    product/         # Jersey SVG renderer, cards, gallery, tabs
    shop/            # Filters and collection grid
  lib/               # Product catalog, stores, motion helpers, formatting
```

## Adding Your Products

The easiest way: open **/admin → Products** and manage everything there (add,
edit, hide, delete, upload photos). Products save to Supabase and the site
updates within seconds. Use "Import built-in catalog" once to start from the
12 sample jerseys. Delivery charges live in **/admin → Settings**.

The built-in fallback catalog lives in `src/lib/products.ts` — the site uses it
whenever the database is unconfigured or empty, so the shop can never be blank.

- **Without photos**: the SVG jersey renderer draws the product from its colors —
  no assets needed.
- **With real photos**: drop images in `public/products/` and add
  `images: ["/products/my-jersey-front.jpg", "/products/my-jersey-back.jpg"]` to the
  product. Cards and the gallery switch to photos automatically.

## Going Live — Environment Variables

Copy `.env.example` to `.env.local` (or set these in Vercel). Everything is optional;
features unlock as you add them:

| Variable | Unlocks |
|---|---|
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Orders saved to the database |
| `ADMIN_PASSWORD` | The `/admin` order dashboard |
| `RESEND_API_KEY` | Emails: a branded confirmation to the customer + `ORDER_NOTIFY_EMAIL` notification to the shop. Verify a domain in Resend and set `ORDER_EMAIL_FROM` to deliver to real customers |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | "Send order on WhatsApp" button (e.g. `8801XXXXXXXXX`) |
| `NEXT_PUBLIC_BKASH_NUMBER` / `NEXT_PUBLIC_NAGAD_NUMBER` | Send Money numbers at checkout |
| `NEXT_PUBLIC_SSLCOMMERZ_ENABLED` + `SSLCOMMERZ_STORE_ID`/`SSLCOMMERZ_STORE_PASSWORD` | Online payment option |

Without any of these, checkout still works: the order is validated, gets an order
number, and the customer is guided to Messenger/WhatsApp to confirm it.

### Supabase setup (once)

Create a free project at [supabase.com](https://supabase.com), open the SQL editor and run:

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_no text not null,
  customer jsonb not null,
  items jsonb not null,
  subtotal int not null,
  shipping int not null,
  total int not null,
  payment_method text not null,
  payment_ref text,
  status text not null default 'new',
  locale text
);
alter table orders enable row level security;
-- No public policies: the site talks to this table only with the service-role key.

-- Catalog managed from /admin (products + delivery charges):
create table products (
  id text primary key,
  sort_order int not null default 0,
  is_active boolean not null default true,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table products enable row level security;

create table settings (
  id int primary key,
  data jsonb not null
);
alter table settings enable row level security;
```

Then copy the project URL and the `service_role` key (Settings → API) into your env.

### Go-live checklist

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new)
2. Add the env variables above in Vercel
3. Set a strong `ADMIN_PASSWORD` and bookmark `/admin`
4. Replace placeholder products with real jerseys, photos and prices
5. Test one Cash-on-Delivery order end to end
6. (Later) register an SSLCommerz merchant account for automated online payment
