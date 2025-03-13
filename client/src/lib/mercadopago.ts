import { Product } from "@shared/schema";
import { apiRequest } from "./queryClient";

export async function createPreference(product: Product) {
  const response = await apiRequest("POST", "/api/create-preference", {
    title: product.name,
    price: product.price,
    quantity: 1,
  });
  return response.id;
}

export function initMercadoPago() {
  if (!import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY) {
    console.error('Missing MercadoPago public key');
    return null;
  }

  // @ts-ignore - MercadoPago is loaded from CDN
  return new MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
}