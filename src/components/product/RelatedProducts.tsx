import Reveal from "@/components/fx/Reveal";
import ProductCard from "./ProductCard";
import { getRelatedProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

/** "Complete the look" — horizontally scrollable related kits. */
export default function RelatedProducts({ product }: { product: Product }) {
  const related = getRelatedProducts(product);
  if (related.length === 0) {
    return null;
  }

  return (
    <section className="mt-24" aria-label="Related products">
      <Reveal>
        <h2 className="mb-8 font-display text-2xl font-semibold md:text-3xl">Complete the look</h2>
      </Reveal>
      <Reveal
        staggerChildren
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2"
      >
        {related.map((relatedProduct) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            className="min-w-[260px] max-w-[300px] flex-1 snap-start"
          />
        ))}
      </Reveal>
    </section>
  );
}
