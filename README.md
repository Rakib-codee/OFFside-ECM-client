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
  quantity steppers and free-shipping threshold
- **Checkout** — four steps with animated progress, floating-label validation,
  card-type detection, wallet buttons and a confetti order confirmation

> The checkout is a demo flow — no real payment is processed. Wire up Stripe (or a
> similar provider) before going live.

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

## Customizing the Catalog

All products live in `src/lib/products.ts` — each entry defines its colorway, pricing,
badge and stock. Jersey visuals are rendered from those colors by
`src/components/product/JerseyGraphic.tsx`, so adding a product needs no image assets.
To use real photography later, swap the `JerseyGraphic` usage inside
`ProductCard`/`Gallery` for `next/image`.
