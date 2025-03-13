import type { Express } from "express";
import { createServer } from "http";
import passport from "passport";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertCategorySchema, insertSettingsSchema } from "@shared/schema";
import { createPaymentPreference, handleWebhook } from "./mercadopago";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express) {
  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "local-secret",
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  setupAuth();

  // Auth routes
  app.get("/api/auth/me", (req, res) => {
    res.json(req.user || null);
  });

  app.get("/api/auth/discord", passport.authenticate("discord"));

  app.get("/api/auth/discord/callback",
    passport.authenticate("discord", {
      successRedirect: "/",
      failureRedirect: "/login"
    })
  );

  app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login"
    })
  );

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    if (!req.user?.role || !["owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    if (!req.user?.role || !["owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const data = insertSettingsSchema.parse(req.body);
    const settings = await storage.updateSettings(data);
    res.json(settings);
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.user?.role || !["admin", "owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const data = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(data);
    res.json(product);
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.user?.role || !["admin", "owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const data = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(data);
    res.json(category);
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    if (!req.user?.role || !["admin", "owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  app.post("/api/orders/:id/approve", async (req, res) => {
    if (!req.user?.role || !["admin", "owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orderId = parseInt(req.params.id);
    const order = await storage.updateOrderStatus(orderId, "approved");
    res.json(order);
  });

  app.post("/api/orders/:id/reject", async (req, res) => {
    if (!req.user?.role || !["admin", "owner", "sub-owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orderId = parseInt(req.params.id);
    const order = await storage.updateOrderStatus(orderId, "rejected");
    res.json(order);
  });

  // MercadoPago Integration
  app.post("/api/create-preference", async (req, res) => {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      res.status(503).json({ message: "MercadoPago integration not configured" });
      return;
    }

    try {
      const preference = await createPaymentPreference(req.body);
      res.json(preference);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/webhooks/mercadopago", async (req, res) => {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || !process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      res.status(503).json({ message: "MercadoPago webhooks not configured" });
      return;
    }

    try {
      await handleWebhook(req.body);
      res.sendStatus(200);
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}