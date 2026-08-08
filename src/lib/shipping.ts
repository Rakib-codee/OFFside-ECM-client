/** Delivery pricing shared by the cart UI and the server-side order API. */

export const FREE_SHIPPING_THRESHOLD = 2500;
export const DHAKA_SHIPPING_RATE = 70;
export const OUTSIDE_DHAKA_SHIPPING_RATE = 130;

export type DeliveryZone = "dhaka" | "outside";

export function shippingFor(zone: DeliveryZone, subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return zone === "dhaka" ? DHAKA_SHIPPING_RATE : OUTSIDE_DHAKA_SHIPPING_RATE;
}
