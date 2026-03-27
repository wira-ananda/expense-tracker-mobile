import { Ionicons } from "@expo/vector-icons";

// --- 1. DATA TYPES ---
export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  userId: string;
  categoryname: string;
  type: TransactionType;
};

export type TransactionHistoryItem = {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  transactionDate: string;
  category: Category;
};

// --- 2. QUERY KEYS ---
export const transactionQueryKeys = {
  all: ["transactions"] as const,
  list: () => [...transactionQueryKeys.all, "list"] as const,
  history: () => [...transactionQueryKeys.all, "history"] as const,
  historyByMonth: (year: number, month: number) =>
    [...transactionQueryKeys.history(), "by-month", year, month] as const,
};

export const categoryQueryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryQueryKeys.all, "list"] as const,
  byType: (type: TransactionType) =>
    [...categoryQueryKeys.list(), "by-type", type] as const,
};

// --- 3. SHARED UI CONFIG ---
export const TRANSACTION_TABS: { label: string; value: TransactionType }[] = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

// --- 4. SHARED FORMATTERS ---
export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSignedRupiah(value: number, type: TransactionType) {
  const sign = type === "expense" ? "-" : "+";
  return `${sign}${formatRupiah(value)}`;
}

// --- 5. VISUAL CONFIG & MAPPING ---
export type VisualConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

export const VISUAL_MAPPING: Record<string, VisualConfig> = {
  makan: { icon: "restaurant", iconBg: "#FFF3E8", iconColor: "#F29C4B" },
  food: { icon: "restaurant", iconBg: "#FFF3E8", iconColor: "#F29C4B" },

  belanja: { icon: "cart", iconBg: "#FDECEC", iconColor: "#FF5D52" },
  shopping: { icon: "cart", iconBg: "#FDECEC", iconColor: "#FF5D52" },
  grocery: { icon: "cart", iconBg: "#FDECEC", iconColor: "#FF5D52" },

  transportasi: { icon: "bus", iconBg: "#EAF1FF", iconColor: "#4F8DF7" },
  travel: { icon: "bus", iconBg: "#EAF1FF", iconColor: "#4F8DF7" },
  bensin: { icon: "bus", iconBg: "#EAF1FF", iconColor: "#4F8DF7" },

  listrik: { icon: "flash", iconBg: "#FFF3E8", iconColor: "#F29C4B" },
  internet: { icon: "wifi", iconBg: "#EAF1FF", iconColor: "#4F8DF7" },

  hiburan: {
    icon: "game-controller",
    iconBg: "#F4EEFF",
    iconColor: "#8B5CF6",
  },

  gaji: { icon: "trending-up", iconBg: "#EAF8F0", iconColor: "#2FB36F" },
  salary: { icon: "trending-up", iconBg: "#EAF8F0", iconColor: "#2FB36F" },

  bonus: { icon: "gift", iconBg: "#EEF7FF", iconColor: "#3B82F6" },
  hadiah: { icon: "gift", iconBg: "#FFF4E6", iconColor: "#F59E0B" },

  investasi: {
    icon: "bar-chart",
    iconBg: "#F3EEFF",
    iconColor: "#8B5CF6",
  },

  penjualan: {
    icon: "storefront",
    iconBg: "#E8FBF3",
    iconColor: "#10B981",
  },
};

// --- 6. VISUAL FUNCTIONS ---
export function getAppVisual(
  name: string = "",
  type: string = "expense",
): VisualConfig {
  const lowerName = name.toLowerCase();
  const match = Object.keys(VISUAL_MAPPING).find((key) =>
    lowerName.includes(key),
  );

  if (match) return VISUAL_MAPPING[match];

  const isIncome = type === "income";

  return {
    icon: isIncome ? "trending-up" : "wallet",
    iconBg: isIncome ? "#EAF8F0" : "#FDECEC",
    iconColor: isIncome ? "#2FB36F" : "#FF5D52",
  };
}

export const getTransactionVisual = (item: TransactionHistoryItem) =>
  getAppVisual(item.category.categoryname, item.type);

export const getCategoryVisual = (name: string, type: TransactionType) =>
  getAppVisual(name, type);
