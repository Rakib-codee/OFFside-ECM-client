import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getCatalog } from "@/lib/catalog";
import { PRODUCTS } from "@/lib/products";

/** Static params come from the built-in catalog; admin-added products render on demand. */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.find((entry) => entry.slug === slug);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: `${product.team} ${product.name}`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.find((entry) => entry.slug === slug);
  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1400px] px-5 pb-20 pt-24 md:px-8 md:pt-32">
      <ProductDetail product={product} />
      <RelatedProducts product={product} />
    </main>
  );
}
