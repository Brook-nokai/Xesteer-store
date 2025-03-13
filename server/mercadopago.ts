import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mercadopago = require('mercadopago');

import { storage } from "./storage";

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN");
}

// Initialize MercadoPago with the access token
try {
  mercadopago.configure({
    sandbox: true,
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
  console.log("MercadoPago successfully configured");
} catch (error) {
  console.error("Failed to configure MercadoPago:", error);
  throw error;
}

export async function createPaymentPreference(data: {
  title: string;
  price: number;
  quantity: number;
}) {
  try {
    const preference = {
      items: [
        {
          title: data.title,
          unit_price: data.price / 100, // Convert from cents to currency
          quantity: data.quantity,
        }
      ],
      back_urls: {
        success: `${process.env.APP_URL}/success`,
        failure: `${process.env.APP_URL}/failure`,
      },
      auto_return: "approved",
      notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
    };

    const response = await mercadopago.preferences.create(preference);
    console.log("Payment preference created:", response);
    return response;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error;
  }
}

export async function handleWebhook(data: any) {
  try {
    const paymentId = data.data.id;
    const payment = await mercadopago.payment.get(paymentId);

    console.log("Webhook payment data:", payment);

    if (payment.response.status === "approved") {
      const orderId = payment.response.external_reference;
      await storage.updateOrderStatus(parseInt(orderId), "approved");
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}