import { 
  User, InsertUser, 
  Product, InsertProduct,
  Category, InsertCategory,
  Order, InsertOrder,
  Settings, InsertSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Orders
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private orders: Map<number, Order>;
  private settings: Settings | undefined;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.orders = new Map();
    this.currentId = { users: 1, products: 1, categories: 1, orders: 1 };
  }

  // Users
  async getUser(id: number) {
    return this.users.get(id);
  }

  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserByDiscordId(discordId: string) {
    return Array.from(this.users.values()).find(u => u.discordId === discordId);
  }

  async getUserByGoogleId(googleId: string) {
    return Array.from(this.users.values()).find(u => u.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      id,
      email: insertUser.email,
      name: insertUser.name,
      role: insertUser.role || "user",
      avatar: insertUser.avatar || null,
      discordId: insertUser.discordId || null,
      googleId: insertUser.googleId || null
    };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getAllProducts() {
    return Array.from(this.products.values());
  }

  async getProduct(id: number) {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const product: Product = {
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      images: insertProduct.images,
      categoryId: insertProduct.categoryId,
      inStock: insertProduct.inStock ?? true,
      features: insertProduct.features || {},
      level: insertProduct.level || null,
      race: insertProduct.race || null,
      hasGodhuman: insertProduct.hasGodhuman || false,
      hasSoulGuitar: insertProduct.hasSoulGuitar || false,
      hasCdk: insertProduct.hasCdk || false,
      discountPercentage: insertProduct.discountPercentage || null,
      originalPrice: insertProduct.originalPrice || null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>) {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");

    const updated = { ...product, ...data };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number) {
    this.products.delete(id);
  }

  // Categories
  async getAllCategories() {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number) {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const category: Category = {
      id,
      name: insertCategory.name,
      slug: insertCategory.slug,
      icon: insertCategory.icon || null,
      displayOrder: insertCategory.displayOrder || 0
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>) {
    const category = this.categories.get(id);
    if (!category) throw new Error("Category not found");

    const updated = { ...category, ...data };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number) {
    this.categories.delete(id);
  }

  // Orders
  async getAllOrders() {
    const orders = Array.from(this.orders.values());
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const product = await this.getProduct(order.productId);
        const user = await this.getUser(order.userId);
        return {
          ...order,
          product,
          user
        };
      })
    );
    return ordersWithDetails;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId.orders++;
    const order: Order = {
      id,
      userId: insertOrder.userId,
      productId: insertOrder.productId,
      status: "pending",
      paymentId: insertOrder.paymentId || null,
      createdAt: new Date(),
      deliveredAt: null,
      deliveryDetails: null,
      approvedBy: null
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number) {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: number, status: string) {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");

    const updated: Order = { 
      ...order, 
      status,
      deliveredAt: status === "approved" ? new Date() : null
    };
    this.orders.set(id, updated);
    return updated;
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(settings: InsertSettings): Promise<Settings> {
    this.settings = {
      id: 1,
      mercadoPagoAccessToken: settings.mercadoPagoAccessToken,
      mercadoPagoWebhookSecret: settings.mercadoPagoWebhookSecret
    };
    return this.settings;
  }
}

export const storage = new MemStorage();