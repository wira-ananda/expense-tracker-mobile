import {
  TransactionHistoryItem,
  TransactionType,
  useTransactionsQuery,
} from "@/hooks/use-transaction";
import errorMiddleware from "@/middleware/error-middleware";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOrder = "latest" | "oldest";
type FilterType = "all" | TransactionType;

type TransactionSection = {
  title: string;
  data: TransactionHistoryItem[];
};

const TYPE_TABS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTransactionTime(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatSectionDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function parseDateInput(value: string) {
  const input = value.trim();

  if (!input) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [day, month, year] = input.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getStartOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function getEndOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function isToday(date: Date) {
  const now = new Date();

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function isYesterday(date: Date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

function getSectionTitle(dateString: string) {
  const date = new Date(dateString);

  if (isToday(date)) return "TODAY";
  if (isYesterday(date)) return "YESTERDAY";

  return formatSectionDate(date);
}

function getTransactionVisual(item: TransactionHistoryItem): {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
} {
  const category = item.category.categoryname.toLowerCase();
  const isIncome = item.type === "income";

  if (category.includes("makan") || category.includes("food")) {
    return {
      icon: "restaurant",
      iconBg: "#FFF3E8",
      iconColor: "#F29C4B",
    };
  }

  if (
    category.includes("belanja") ||
    category.includes("shopping") ||
    category.includes("grocery")
  ) {
    return {
      icon: "cart",
      iconBg: "#FDECEC",
      iconColor: "#FF5D52",
    };
  }

  if (
    category.includes("transport") ||
    category.includes("travel") ||
    category.includes("bensin")
  ) {
    return {
      icon: "bus",
      iconBg: "#EAF1FF",
      iconColor: "#4F8DF7",
    };
  }

  if (
    category.includes("gaji") ||
    category.includes("bonus") ||
    category.includes("salary")
  ) {
    return {
      icon: "trending-up",
      iconBg: "#EAF8F0",
      iconColor: "#2FB36F",
    };
  }

  if (category.includes("listrik")) {
    return {
      icon: "flash",
      iconBg: "#FFF3E8",
      iconColor: "#F29C4B",
    };
  }

  if (category.includes("internet")) {
    return {
      icon: "wifi",
      iconBg: "#EAF1FF",
      iconColor: "#4F8DF7",
    };
  }

  if (category.includes("hiburan")) {
    return {
      icon: "game-controller",
      iconBg: "#F4EEFF",
      iconColor: "#8B5CF6",
    };
  }

  return {
    icon: isIncome ? "trending-up" : "wallet",
    iconBg: isIncome ? "#EAF8F0" : "#FDECEC",
    iconColor: isIncome ? "#2FB36F" : "#FF5D52",
  };
}

function buildSections(items: TransactionHistoryItem[]): TransactionSection[] {
  const grouped = new Map<string, TransactionHistoryItem[]>();

  items.forEach((item) => {
    const title = getSectionTitle(item.transactionDate);
    const current = grouped.get(title) ?? [];
    current.push(item);
    grouped.set(title, current);
  });

  return Array.from(grouped.entries()).map(([title, data]) => ({
    title,
    data,
  }));
}

function formatDisplayDate(date: Date | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function FilterDateInput({
  value,
  onChange,
  placeholder,
  maximumDate,
  minimumDate,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder: string;
  maximumDate?: Date;
  minimumDate?: Date;
}) {
  const [isVisible, setIsVisible] = useState(false);

  const displayValue = useMemo(() => formatDisplayDate(value), [value]);

  const openPicker = () => setIsVisible(true);
  const closePicker = () => setIsVisible(false);

  const handleConfirm = (date: Date) => {
    onChange(date);
    closePicker();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openPicker}
        className="flex-1 flex-row items-center rounded-[16px] bg-[#F0F1F4] px-4"
      >
        <Text
          className={`flex-1 py-1 font-poppins-medium text-[14px] ${
            displayValue ? "text-[#1F2A44]" : "text-[#7C8699]"
          }`}
        >
          {displayValue || placeholder}
        </Text>

        <Ionicons name="calendar-outline" size={18} color="#9AA1AE" />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        date={value ?? new Date()}
        onConfirm={handleConfirm}
        onCancel={closePicker}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
    </>
  );
}

function SummaryBar({ income, expense }: { income: number; expense: number }) {
  return (
    <View className="mt-4 rounded-[18px] bg-[#2FB36F] px-5 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-poppins-medium text-sm text-gray-200">
            Total Income
          </Text>
          <Text className="mt-0.5 font-poppins-bold text-md text-white">
            {formatRupiah(income)}
          </Text>
        </View>

        <View className="h-12 w-[1px] bg-[#49C394]" />

        <View className="flex-1 pl-4">
          <Text className="text-right font-poppins-medium text-sm text-gray-200">
            Total Expense
          </Text>
          <Text className="mt-0.5 text-right font-poppins-bold text-md text-white">
            {formatRupiah(expense)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function TransactionCard({ item }: { item: TransactionHistoryItem }) {
  const isExpense = item.type === "expense";
  const visual = getTransactionVisual(item);
  const title = item.note?.trim() ? item.note : item.category.categoryname;
  const subtitle = `${item.category.categoryname} • ${formatTransactionTime(
    item.transactionDate,
  )}`;

  return (
    <View
      style={styles.cardShadow}
      className="rounded-[18px] bg-white px-4 py-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center pr-4">
          <View
            className="mr-4 h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: visual.iconBg }}
          >
            <Ionicons name={visual.icon} size={22} color={visual.iconColor} />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-poppins-bold text-sm text-[#101828]"
            >
              {title}
            </Text>
            <Text
              numberOfLines={1}
              className="mt-1 font-poppins text-sm text-[#7B8497]"
            >
              {subtitle}
            </Text>
          </View>
        </View>

        <Text
          className={`font-poppins-bold text-md ${
            isExpense ? "text-[#FF5D52]" : "text-[#2FB36F]"
          }`}
        >
          {isExpense ? "-" : "+"}
          {formatRupiah(item.amount)}
        </Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { data, isLoading, isRefetching, error, refetch } =
    useTransactionsQuery();

  const [search, setSearch] = useState("");
  const [startDateInput, setStartDateInput] = useState<Date | null>(null);
  const [endDateInput, setEndDateInput] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");

  useEffect(() => {
    if (error) {
      errorMiddleware(error);
    }
  }, [error]);

  const categories = useMemo(() => {
    const categoryList = (data ?? []).map((item) => item.category.categoryname);
    const uniqueCategories = Array.from(new Set(categoryList));

    return ["All", ...uniqueCategories];
  }, [data]);

  const startDate = startDateInput;
  const endDate = endDateInput;

  const startTimestamp = startDate ? getStartOfDay(startDate).getTime() : null;
  const endTimestamp = endDate ? getEndOfDay(endDate).getTime() : null;

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = (data ?? []).filter((item) => {
      const transactionTime = new Date(item.transactionDate).getTime();

      const matchesSearch =
        !keyword ||
        item.category.categoryname.toLowerCase().includes(keyword) ||
        item.type.toLowerCase().includes(keyword) ||
        (item.note?.toLowerCase().includes(keyword) ?? false);

      const matchesStart =
        startTimestamp === null || transactionTime >= startTimestamp;
      const matchesEnd =
        endTimestamp === null || transactionTime <= endTimestamp;

      const matchesCategory =
        selectedCategory === "All" ||
        item.category.categoryname.toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesType = selectedType === "all" || item.type === selectedType;

      return (
        matchesSearch &&
        matchesStart &&
        matchesEnd &&
        matchesCategory &&
        matchesType
      );
    });

    result.sort((a, b) => {
      const left = new Date(a.transactionDate).getTime();
      const right = new Date(b.transactionDate).getTime();

      return sortOrder === "latest" ? right - left : left - right;
    });

    return result;
  }, [
    data,
    search,
    startTimestamp,
    endTimestamp,
    selectedCategory,
    selectedType,
    sortOrder,
  ]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [filteredTransactions]);

  const sections = useMemo(
    () => buildSections(filteredTransactions),
    [filteredTransactions],
  );

  const resetFilters = () => {
    setSearch("");
    setStartDateInput(null);
    setEndDateInput(null);
    setSelectedCategory("All");
    setSelectedType("all");
    setSortOrder("latest");
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F6F6F8]">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#27B07D" />
        <Text className="mt-3 font-poppins text-[14px] text-[#6B7280]">
          Memuat riwayat transaksi...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F6F6F8]">
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#27B07D"
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-poppins-bold text-2xl text-[#111827]">
            Transactions
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={resetFilters}
            style={styles.iconButtonShadow}
            className="h-12 w-12 items-center justify-center rounded-full bg-[#F0F1F4]"
          >
            <Ionicons name="options-outline" size={20} color="#5E6678" />
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row items-center rounded-[18px] bg-[#F0F1F4] px-4">
          <Ionicons name="search-outline" size={20} color="#9AA1AE" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions..."
            placeholderTextColor="#A0A7B4"
            className="ml-3 h-14 flex-1 font-poppins text-md text-[#1F2A44]"
          />
        </View>

        <View className="mt-5 flex-row gap-3">
          <FilterDateInput
            value={startDateInput}
            onChange={setStartDateInput}
            placeholder="Start Date"
            maximumDate={endDateInput ?? new Date()}
          />
          <FilterDateInput
            value={endDateInput}
            onChange={setEndDateInput}
            placeholder="End Date"
            minimumDate={startDateInput ?? undefined}
            maximumDate={new Date()}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 14, paddingRight: 10 }}
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.85}
                onPress={() => setSelectedCategory(category)}
                className={`mr-3 rounded-full px-5 py-2 ${
                  isActive ? "bg-[#27C081]" : "bg-[#ECEDEF]"
                }`}
              >
                <Text
                  className={`font-poppins-medium text-sm ${
                    isActive ? "text-white" : "text-[#5F6677]"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="flex-1 flex-row rounded-[16px] bg-[#ECEDEF] p-1">
            {TYPE_TABS.map((tab) => {
              const isActive = selectedType === tab.value;

              return (
                <TouchableOpacity
                  key={tab.value}
                  activeOpacity={0.85}
                  onPress={() => setSelectedType(tab.value)}
                  className={`flex-1 rounded-[12px] px-3 py-3 ${
                    isActive ? "bg-white" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-center font-poppins-medium text-[14px] ${
                      isActive ? "text-[#111827]" : "text-[#5F6677]"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleSortOrder}
            className="flex-row items-center rounded-[16px] bg-[#ECEDEF] px-4 py-4"
          >
            <Ionicons name="swap-vertical-outline" size={18} color="#5E6678" />
            <Text className="ml-2 font-poppins-medium text-[14px] text-[#5E6678]">
              Sort
            </Text>
          </TouchableOpacity>
        </View>

        <SummaryBar income={totalIncome} expense={totalExpense} />

        {sections.length === 0 ? (
          <View className="mt-8 items-center rounded-[22px] bg-white px-6 py-10">
            <Ionicons name="receipt-outline" size={30} color="#A0A7B4" />
            <Text className="mt-4 font-poppins-semibold text-[16px] text-[#1F2A44]">
              Tidak ada transaksi
            </Text>
            <Text className="mt-1 text-center font-poppins text-[13px] text-[#8B93A6]">
              Coba ubah pencarian, tanggal, kategori, atau tipe transaksi.
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.title} className="mt-6">
              <Text className="font-poppins-semibold text-sm tracking-[1.2px] text-[#8B93A6]">
                {section.title}
              </Text>

              <View className="mt-3">
                {section.data.map((item, index) => (
                  <View key={item.id} className={index === 0 ? "" : "mt-3"}>
                    <TransactionCard item={item} />
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconButtonShadow: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
