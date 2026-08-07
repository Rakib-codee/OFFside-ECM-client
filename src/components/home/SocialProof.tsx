import Reveal from "@/components/fx/Reveal";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { PRODUCTS, REVIEWS } from "@/lib/products";
import type { Review } from "@/lib/types";

/** "The 12th Man" — infinite marquee of fan reviews and kit tiles. */
export default function SocialProof() {
  const firstRow = REVIEWS.slice(0, 4);
  const secondRow = REVIEWS.slice(4);

  return (
    <section className="overflow-hidden py-20 md:py-36" aria-label="Fan reviews">
      <Reveal className="mx-auto mb-12 max-w-[1400px] px-5 md:px-8">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">The 12th Man</h2>
        <p className="mt-2 text-secondary">Worn loud by fans everywhere.</p>
      </Reveal>
      <Reveal>
        <div className="marquee-left marquee-paused mb-4 overflow-hidden">
          <MarqueeRow reviews={firstRow} productOffset={0} />
        </div>
        <div className="marquee-right marquee-paused overflow-hidden">
          <MarqueeRow reviews={secondRow} productOffset={4} />
        </div>
      </Reveal>
    </section>
  );
}

function MarqueeRow({ reviews, productOffset }: { reviews: Review[]; productOffset: number }) {
  // Content is doubled so the -50% translate loops seamlessly
  return (
    <div className="marquee-track">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex gap-4" aria-hidden={copy === 1}>
          {reviews.map((review, index) => (
            <ReviewAndTile
              key={`${review.name}-${copy}`}
              review={review}
              productIndex={(productOffset + index) % PRODUCTS.length}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ReviewAndTile({ review, productIndex }: { review: Review; productIndex: number }) {
  const product = PRODUCTS[productIndex];
  return (
    <>
      <figure className="flex h-[200px] w-[260px] shrink-0 flex-col justify-between rounded-xl border border-line bg-card p-5 transition-transform duration-300 hover:scale-105">
        <blockquote className="text-sm leading-relaxed text-primary">“{review.quote}”</blockquote>
        <figcaption className="flex items-center justify-between">
          <span className="text-xs font-medium text-secondary">{review.name}</span>
          <span className="text-xs text-accent" aria-label={`${review.rating} out of 5 stars`}>
            {"★".repeat(review.rating)}
            <span className="text-muted">{"★".repeat(5 - review.rating)}</span>
          </span>
        </figcaption>
      </figure>
      <div className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-xl bg-elevated p-6 transition-transform duration-300 hover:scale-105">
        <JerseyGraphic colors={product.colors} className="h-full" />
      </div>
    </>
  );
}
