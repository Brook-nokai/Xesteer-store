import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"),
  discordId: text("discord_id").unique(),
  googleId: text("google_id").unique(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"), 
  displayOrder: integer("display_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  images: text("images").array().notNull(),
  categoryId: integer("category_id").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  features: jsonb("features").notNull().default({}),
  level: integer("level"),
  race: text("race"), 
  hasGodhuman: boolean("has_godhuman").default(false),
  hasSoulGuitar: boolean("has_soul_guitar").default(false),
  hasCdk: boolean("has_cdk").default(false),
  discountPercentage: integer("discount_percentage"),
  originalPrice: integer("original_price"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  status: text("status").notNull().default("pending"),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  deliveryDetails: text("delivery_details"),
  approvedBy: integer("approved_by"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  mercadoPagoAccessToken: text("mercadopago_access_token"),
  mercadoPagoWebhookSecret: text("mercadopago_webhook_secret"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, deliveredAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;