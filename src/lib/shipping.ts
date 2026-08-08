/** Delivery pricing shared by the cart UI and the server-side order API. */

export const FREE_SHIPPING_THRESHOLD = 2500;
export const DHAKA_SHIPPING_RATE = 70;
export const OUTSIDE_DHAKA_SHIPPING_RATE = 130;

export type DeliveryZone = "dhaka" | "outside";

interface ShippingRates {
  dhakaRate: number;
  outsideRate: number;
  freeShippingThreshold: number;
}

const DEFAULT_RATES: ShippingRates = {
  dhakaRate: DHAKA_SHIPPING_RATE,
  outsideRate: OUTSIDE_DHAKA_SHIPPING_RATE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
};

export function shippingFor(
  zone: DeliveryZone,
  subtotal: number,
  rates: ShippingRates = DEFAULT_RATES,
): number {
  if (subtotal === 0 || subtotal >= rates.freeShippingThreshold) {
    return 0;
  }
  return zone === "dhaka" ? rates.dhakaRate : rates.outsideRate;
}
