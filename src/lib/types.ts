export type Category = "club" | "national" | "retro" | "training" | "kids";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Badge = "new" | "sale";

/** Colorway used by the JerseyGraphic SVG renderer. */
export interface JerseyColors {
  body: string;
  sleeve: string;
  accent: string;
  text: string;
}

export interface Product {
  id: string;
  slug: string;
  team: string;
  name: string;
  category: Category;
  price: number;
  salePrice?: number;
  badge?: Badge;
  /** Big display number shown on the card and jersey back. */
  number: number;
  colors: JerseyColors;
  /** Optional alternate colorway selectable on the product page. */
  altColors?: JerseyColors;
  rating: number;
  reviewCount: number;
  description: string;
  soldOutSizes: Size[];
}

export interface Review {
  name: string;
  quote: string;
  rating: number;
}
