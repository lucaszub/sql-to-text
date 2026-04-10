export type OrderStatus = "Completed" | "Pending" | "Refunded" | "Cancelled" | "Processing";
export type PaymentStatus = "Paid" | "Unpaid" | "Refunded";

export interface Order {
  order_id: string;
  customer_name: string;
  order_date: string;
  status: OrderStatus;
  total_amount: number;
  payment_status: PaymentStatus;
}

export interface Product {
  product_id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  country: string;
  total_orders: number;
  total_spent: number;
  status: "VIP" | "Active" | "Inactive";
}

export const ORDERS: Order[] = [
  { order_id: "#ORD1008", customer_name: "Esther Klein",     order_date: "2024-12-17", status: "Pending",    total_amount: 10.50,   payment_status: "Unpaid" },
  { order_id: "#ORD1007", customer_name: "Denise Kuhn",      order_date: "2024-12-16", status: "Pending",    total_amount: 100.50,  payment_status: "Unpaid" },
  { order_id: "#ORD1006", customer_name: "Clint Hoppe",      order_date: "2024-12-16", status: "Completed",  total_amount: 60.56,   payment_status: "Paid" },
  { order_id: "#ORD1005", customer_name: "Darin Deckow",     order_date: "2024-12-16", status: "Refunded",   total_amount: 640.50,  payment_status: "Paid" },
  { order_id: "#ORD1004", customer_name: "Jacquelyn Robel",  order_date: "2024-12-15", status: "Completed",  total_amount: 38.50,   payment_status: "Paid" },
  { order_id: "#ORD1003", customer_name: "Clint Hoppe",      order_date: "2024-12-15", status: "Completed",  total_amount: 29.50,   payment_status: "Paid" },
  { order_id: "#ORD1002", customer_name: "Erin Bira",        order_date: "2024-12-16", status: "Completed",  total_amount: 120.35,  payment_status: "Paid" },
  { order_id: "#ORD1001", customer_name: "Gretchen Gutz",    order_date: "2024-12-14", status: "Refunded",   total_amount: 123.50,  payment_status: "Paid" },
  { order_id: "#ORD1000", customer_name: "Stewart Kuler",    order_date: "2024-12-13", status: "Completed",  total_amount: 87.00,   payment_status: "Paid" },
  { order_id: "#ORD0999", customer_name: "Maria Santos",     order_date: "2024-12-13", status: "Pending",    total_amount: 215.00,  payment_status: "Unpaid" },
  { order_id: "#ORD0998", customer_name: "James Fowler",     order_date: "2024-12-12", status: "Completed",  total_amount: 54.99,   payment_status: "Paid" },
  { order_id: "#ORD0997", customer_name: "Anna Schmidt",     order_date: "2024-12-12", status: "Cancelled",  total_amount: 320.00,  payment_status: "Refunded" },
  { order_id: "#ORD0996", customer_name: "Yuki Tanaka",      order_date: "2024-12-11", status: "Completed",  total_amount: 189.00,  payment_status: "Paid" },
  { order_id: "#ORD0995", customer_name: "Lucas Morel",      order_date: "2024-12-11", status: "Processing", total_amount: 75.00,   payment_status: "Unpaid" },
  { order_id: "#ORD0994", customer_name: "Priya Patel",      order_date: "2024-12-10", status: "Completed",  total_amount: 43.20,   payment_status: "Paid" },
  { order_id: "#ORD0993", customer_name: "Marcus Webb",      order_date: "2024-12-10", status: "Pending",    total_amount: 299.99,  payment_status: "Unpaid" },
  { order_id: "#ORD0992", customer_name: "Sofia Reyes",      order_date: "2024-12-09", status: "Completed",  total_amount: 156.75,  payment_status: "Paid" },
  { order_id: "#ORD0991", customer_name: "Tom Nielsen",      order_date: "2024-12-09", status: "Cancelled",  total_amount: 89.50,   payment_status: "Refunded" },
  { order_id: "#ORD0990", customer_name: "Claire Dupont",    order_date: "2024-12-08", status: "Completed",  total_amount: 234.00,  payment_status: "Paid" },
  { order_id: "#ORD0989", customer_name: "Alex Park",        order_date: "2024-12-08", status: "Refunded",   total_amount: 67.30,   payment_status: "Paid" },
];

export const PRODUCTS: Product[] = [
  { product_id: "P001", name: "Wireless Headphones Pro",   category: "Electronics",    price: 129.99, stock: 245, rating: 4.7 },
  { product_id: "P002", name: "Running Shoes X1",           category: "Sports",         price: 89.50,  stock: 512, rating: 4.5 },
  { product_id: "P003", name: "Coffee Maker Deluxe",        category: "Home & Kitchen", price: 74.99,  stock: 89,  rating: 4.3 },
  { product_id: "P004", name: "Yoga Mat Premium",           category: "Sports",         price: 34.99,  stock: 320, rating: 4.8 },
  { product_id: "P005", name: "USB-C Hub 7-in-1",           category: "Electronics",    price: 49.99,  stock: 0,   rating: 4.6 },
  { product_id: "P006", name: 'Novel: "The Last Star"',     category: "Books",          price: 14.99,  stock: 150, rating: 4.2 },
  { product_id: "P007", name: "Protein Powder Vanilla",     category: "Health",         price: 59.99,  stock: 78,  rating: 4.4 },
  { product_id: "P008", name: "Desk Lamp LED",              category: "Home & Kitchen", price: 39.99,  stock: 200, rating: 4.1 },
  { product_id: "P009", name: "Bluetooth Speaker",          category: "Electronics",    price: 79.99,  stock: 34,  rating: 4.9 },
  { product_id: "P010", name: "Winter Jacket",              category: "Clothing",       price: 199.00, stock: 0,   rating: 4.6 },
];

export const CUSTOMERS: Customer[] = [
  { customer_id: "C001", name: "Esther Klein",  email: "esther.k@mail.com",  country: "Germany", total_orders: 12, total_spent: 1240.50, status: "VIP" },
  { customer_id: "C002", name: "James Fowler",  email: "j.fowler@mail.com",  country: "USA",     total_orders: 8,  total_spent: 876.00,  status: "Active" },
  { customer_id: "C003", name: "Maria Santos",  email: "m.santos@mail.com",  country: "Brazil",  total_orders: 3,  total_spent: 215.00,  status: "Active" },
  { customer_id: "C004", name: "Clint Hoppe",   email: "c.hoppe@mail.com",   country: "USA",     total_orders: 22, total_spent: 3450.00, status: "VIP" },
  { customer_id: "C005", name: "Anna Schmidt",  email: "a.schmidt@mail.com", country: "Germany", total_orders: 1,  total_spent: 320.00,  status: "Inactive" },
  { customer_id: "C006", name: "Yuki Tanaka",   email: "y.tanaka@mail.com",  country: "Japan",   total_orders: 15, total_spent: 2100.00, status: "VIP" },
  { customer_id: "C007", name: "Lucas Morel",   email: "l.morel@mail.com",   country: "France",  total_orders: 6,  total_spent: 540.00,  status: "Active" },
  { customer_id: "C008", name: "Priya Patel",   email: "p.patel@mail.com",   country: "India",   total_orders: 4,  total_spent: 380.00,  status: "Active" },
];

// KPIs
export const KPIS = {
  total_orders: 240,
  pending_orders: 20,
  shipped_orders: 180,
  refunded_orders: 10,
  total_revenue: 48320,
  avg_basket: 201.33,
  active_customers: 98,
  top_product: "Wireless Headphones Pro",
};

// Pre-mapped demo queries
export type QueryKey =
  | "top10orders"
  | "out_of_stock"
  | "vip_customers"
  | "revenue_by_category"
  | "pending_unpaid";

export interface QueryResult {
  sql: string;
  naturalAnswer: string;
  columns: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[];
  rowCount: number;
  durationMs: number;
}

export function runDemoQuery(userQuestion: string): QueryResult {
  const q = userQuestion.toLowerCase();

  if (q.includes("récentes") || q.includes("recentes") || q.includes("recent") || q.includes("dernières") || q.includes("dernieres")) {
    return {
      sql: "SELECT * FROM ORDERS\nORDER BY order_date DESC\nLIMIT 10;",
      naturalAnswer: "Voici les 10 commandes les plus récentes. La dernière commande est **#ORD1008** passée par Esther Klein le 17 déc. pour 10,50 $.",
      columns: ["order_id", "customer_name", "order_date", "status", "total_amount", "payment_status"],
      rows: ORDERS.slice(0, 10),
      rowCount: 10,
      durationMs: 820,
    };
  }

  if (q.includes("rupture") || q.includes("stock") || q.includes("out of stock")) {
    const outOfStock = PRODUCTS.filter((p) => p.stock === 0);
    return {
      sql: "SELECT * FROM PRODUCTS\nWHERE stock = 0\nORDER BY name;",
      naturalAnswer: `Il y a **${outOfStock.length} produits** en rupture de stock : ${outOfStock.map((p) => p.name).join(" et ")}.`,
      columns: ["product_id", "name", "category", "price", "stock", "rating"],
      rows: outOfStock,
      rowCount: outOfStock.length,
      durationMs: 430,
    };
  }

  if (q.includes("vip") || q.includes("client")) {
    const vips = CUSTOMERS.filter((c) => c.status === "VIP").sort((a, b) => b.total_spent - a.total_spent);
    return {
      sql: "SELECT * FROM CUSTOMERS\nWHERE status = 'VIP'\nORDER BY total_spent DESC;",
      naturalAnswer: `Il y a **${vips.length} clients VIP**. Le meilleur client est **${vips[0].name}** avec ${vips[0].total_spent.toLocaleString("fr-FR", { style: "currency", currency: "USD" })} dépensés.`,
      columns: ["customer_id", "name", "email", "country", "total_orders", "total_spent", "status"],
      rows: vips,
      rowCount: vips.length,
      durationMs: 550,
    };
  }

  if (q.includes("catégorie") || q.includes("categorie") || q.includes("category") || q.includes("ca par") || q.includes("chiffre")) {
    const byCategory = [
      { category: "Electronics",    total_revenue: 18450, order_count: 145, avg_price: 127.24 },
      { category: "Sports",         total_revenue: 9820,  order_count: 98,  avg_price: 100.20 },
      { category: "Home & Kitchen", total_revenue: 7340,  order_count: 82,  avg_price: 89.51 },
      { category: "Clothing",       total_revenue: 6200,  order_count: 31,  avg_price: 200.00 },
      { category: "Health",         total_revenue: 4180,  order_count: 70,  avg_price: 59.71 },
      { category: "Books",          total_revenue: 2330,  order_count: 156, avg_price: 14.94 },
    ];
    return {
      sql: "SELECT oi.category,\n  SUM(oi.subtotal) AS total_revenue,\n  COUNT(*) AS order_count,\n  AVG(oi.unit_price) AS avg_price\nFROM ORDER_ITEMS oi\nGROUP BY oi.category\nORDER BY total_revenue DESC;",
      naturalAnswer: "La catégorie **Electronics** génère le plus de revenus avec **18 450 $**, suivie de Sports (9 820 $) et Home & Kitchen (7 340 $).",
      columns: ["category", "total_revenue", "order_count", "avg_price"],
      rows: byCategory,
      rowCount: byCategory.length,
      durationMs: 910,
    };
  }

  if (q.includes("pending") || q.includes("en attente") || q.includes("non payé") || q.includes("non paye")) {
    const pending = ORDERS.filter((o) => o.status === "Pending" && o.payment_status === "Unpaid");
    return {
      sql: "SELECT * FROM ORDERS\nWHERE status = 'Pending'\n  AND payment_status = 'Unpaid'\nORDER BY order_date DESC;",
      naturalAnswer: `Il y a **${pending.length} commandes** en statut Pending et non payées. Le montant total en attente est **${pending.reduce((s, o) => s + o.total_amount, 0).toFixed(2)} $**.`,
      columns: ["order_id", "customer_name", "order_date", "status", "total_amount", "payment_status"],
      rows: pending,
      rowCount: pending.length,
      durationMs: 670,
    };
  }

  // Default: return all orders
  return {
    sql: "SELECT * FROM ORDERS\nORDER BY order_date DESC\nLIMIT 20;",
    naturalAnswer: `J'ai cherché dans les données pour : **"${userQuestion}"**. Voici les commandes les plus récentes en réponse.`,
    columns: ["order_id", "customer_name", "order_date", "status", "total_amount", "payment_status"],
    rows: ORDERS.slice(0, 20),
    rowCount: ORDERS.length,
    durationMs: 750,
  };
}
