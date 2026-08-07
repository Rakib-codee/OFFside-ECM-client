import Reveal from "@/components/fx/Reveal";
import TransitionLink from "@/components/fx/TransitionLink";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/products";

const FEATURED_COUNT = 8;

/** "The Starting XI" — featured grid, swipeable carousel on mobile. */
export default function FeaturedProducts() {
  const featured = [...PRODUCTS]
    .sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)))
    .slice(0, FEATURED_COUNT);

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-36" aria-label="Featured products">
      <Reveal>
        <h2 className="mb-10 font-display text-3xl font-semibold md:text-4xl">The Starting XI</h2>
      </Reveal>
      <Reveal
        staggerChildren
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:snap-none md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-6 md:overflow-visible md:pb-0"
      >
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="min-w-[260px] snap-start md:min-w-0"
          />
        ))}
      </Reveal>
      <div className="mt-12 text-center">
        <TransitionLink
          href="/shop"
          className="footer-link !text-base font-medium !text-primary"
        >
          View all jerseys
        </TransitionLink>
      </div>
    </section>
  );
}
