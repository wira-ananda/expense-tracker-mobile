import { LogoutModal } from "@/components/logout-modal";
import { useGlobalContext } from "@/hooks/use-global-context";
import { useTransactionHistoryByMonthQuery } from "@/hooks/use-transaction";
import {
  TransactionHistoryItem,
  formatRupiah,
  formatSignedRupiah,
  getAppVisual,
} from "@/middleware/constants";
import errorMiddleware from "@/middleware/error-middleware";
import { appShadows } from "@/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatTransactionDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonthYearLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function SummaryCard({
  label,
  amount,
  type,
}: {
  label: string;
  amount: number;
  type: "income" | "expense";
}) {
  const isIncome = type === "income";

  return (
    <View
      className="flex-1 rounded-[22px] bg-white px-4 py-4"
      style={appShadows.homeCard}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${
            isIncome ? "bg-[#EEF7D2]" : "bg-[#FBE8E6]"
          }`}
        >
          <Ionicons
            name={isIncome ? "arrow-down" : "arrow-up"}
            size={18}
            color={isIncome ? "#A3D714" : "#F1635D"}
          />
        </View>

        <View>
          <Text className="font-poppins text-[13px] text-[#8E92A0]">
            {label}
          </Text>
          <Text className="font-poppins-semibold text-[12px] text-[#1F2A44]">
            {formatRupiah(amount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function TransactionRow({ item }: { item: TransactionHistoryItem }) {
  const isExpense = item.type === "expense";
  const visual = getAppVisual(item.category.categoryname, item.type);

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-1 flex-row items-center pr-3">
        <View
          className="mr-4 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: visual.iconBg }}
        >
          <Ionicons name={visual.icon} size={20} color={visual.iconColor} />
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-[14px] text-[#1F2A44]"
          >
            {item.category.categoryname}
          </Text>
          <Text
            numberOfLines={1}
            className="font-poppins text-[11px] text-[#7F8AA3]"
          >
            {item.note ?? formatTransactionDate(item.transactionDate)}
          </Text>
        </View>
      </View>

      <Text
        className={`font-poppins-semibold text-[13px] ${
          isExpense ? "text-[#FF5D52]" : "text-[#37C871]"
        }`}
      >
        {formatSignedRupiah(item.amount, item.type)}
      </Text>
    </View>
  );
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function clampDate(date: Date, minDate: Date, maxDate: Date) {
  if (date < minDate) return minDate;
  if (date > maxDate) return maxDate;
  return date;
}

export default function HomeScreen() {
  const { logout, user } = useGlobalContext();

  const [isLogoutVisible, setIsLogoutVisible] = useState(false);

  const now = useMemo(() => new Date(), []);
  const maxAllowedDate = useMemo(() => getMonthStart(now), [now]);

  const minAllowedDate = useMemo(() => {
    if (!user?.createdAt) return maxAllowedDate;
    return getMonthStart(new Date(user.createdAt));
  }, [user?.createdAt, maxAllowedDate]);

  const [selectedDate, setSelectedDate] = useState(() =>
    clampDate(getMonthStart(new Date()), minAllowedDate, maxAllowedDate),
  );

  useEffect(() => {
    setSelectedDate((prev) =>
      clampDate(getMonthStart(prev), minAllowedDate, maxAllowedDate),
    );
  }, [minAllowedDate, maxAllowedDate]);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;

  const { data, isLoading, isFetching, error } =
    useTransactionHistoryByMonthQuery({
      year: selectedYear,
      month: selectedMonth,
    });

  useEffect(() => {
    if (error) {
      errorMiddleware(error);
    }
  }, [error]);

  const currentData = useMemo(
    () => ({
      year: selectedYear,
      month: selectedMonth,
      income: data?.income ?? 0,
      expense: data?.expense ?? 0,
      balance: data?.balance ?? 0,
      transactions: data?.transactions ?? [],
    }),
    [data, selectedYear, selectedMonth],
  );

  const monthLabel = useMemo(() => {
    return formatMonthYearLabel(new Date(selectedYear, selectedMonth - 1, 1));
  }, [selectedYear, selectedMonth]);

  const isAtMinMonth = useMemo(
    () => isSameMonth(selectedDate, minAllowedDate),
    [selectedDate, minAllowedDate],
  );

  const isAtMaxMonth = useMemo(
    () => isSameMonth(selectedDate, maxAllowedDate),
    [selectedDate, maxAllowedDate],
  );

  const handlePrevMonth = () => {
    if (isAtMinMonth) return;

    setSelectedDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return clampDate(next, minAllowedDate, maxAllowedDate);
    });
  };

  const handleNextMonth = () => {
    if (isAtMaxMonth) return;

    setSelectedDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return clampDate(next, minAllowedDate, maxAllowedDate);
    });
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F3F3F5]">
        <ActivityIndicator size="large" color="#070707" />
        <Text className="mt-3 font-poppins text-[14px] text-[#6B7280]">
          Memuat transaksi...
        </Text>
      </SafeAreaView>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const greeting = getGreeting();

  return (
    <SafeAreaView className="flex-1 bg-[#F3F3F5]">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="mx-4 mt-4 rounded-[36px] bg-[#070707] px-5 pb-16 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/profile")}
                className="mr-3 h-14 w-14 items-center justify-center rounded-full border-2 border-[#C9FF1A] bg-[#25324A]"
              >
                <Ionicons name="person-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              <View>
                <Text className="font-poppins text-[14px] text-[#B9BEC8]">
                  {greeting},
                </Text>
                <Text className="font-poppins-bold text-[18px] text-white">
                  {user?.username ?? "User"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsLogoutVisible(true)} // Buka modal
              className="h-12 w-12 items-center justify-center rounded-full bg-[#1B1B1D]"
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View
            id="perbaikiIni"
            className="mt-6 flex-row items-center justify-between rounded-[24px] bg-[#151517] border border-[#252528] px-2 py-2"
          >
            {/* Tombol Back */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePrevMonth}
              disabled={isAtMinMonth}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isAtMinMonth ? "opacity-20" : "bg-[#1B1B1D]"
              }`}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isAtMinMonth ? "#B2B8C3" : "#C9FF1A"}
              />
            </TouchableOpacity>

            {/* Label Bulan */}
            <View className="items-center px-4">
              <Text className="font-poppins-bold text-[16px] tracking-tight text-white">
                {monthLabel}
              </Text>
              {isFetching ? (
                <View className="absolute -bottom-5">
                  <ActivityIndicator size="small" color="#C9FF1A" />
                </View>
              ) : (
                <Text className="font-poppins text-[10px] uppercase tracking-[1px] text-[#5E6678]">
                  Transaction Period
                </Text>
              )}
            </View>

            {/* Tombol Next */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNextMonth}
              disabled={isAtMaxMonth}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isAtMaxMonth ? "opacity-20" : "bg-[#1B1B1D]"
              }`}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isAtMaxMonth ? "#B2B8C3" : "#C9FF1A"}
              />
            </TouchableOpacity>
          </View>

          <View className="mt-7 items-center">
            <Text className="font-poppins text-[14px] text-[#C6CBD5]">
              Total Balance
            </Text>
            <Text className="mt-1 font-poppins-bold text-[30px] text-[#FFF2D7]">
              {formatRupiah(currentData.balance)}
            </Text>
          </View>
        </View>

        <View className="mx-6 -mt-8 flex-row gap-4">
          <SummaryCard
            label="Income"
            amount={currentData.income}
            type="income"
          />
          <SummaryCard
            label="Expense"
            amount={currentData.expense}
            type="expense"
          />
        </View>

        <View className="mt-4 px-6">
          <View className="flex-row items-center justify-between px-2">
            <Text className="font-poppins-semibold text-[20px] text-[#1F2A44] ">
              Recent Transactions
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/history")}
            >
              <Text className="font-poppins-medium text-[14px] text-[#7E8AA2]">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="mt-2 rounded-[24px] bg-white px-5 py-2"
            style={appShadows.homeCard}
          >
            {currentData.transactions.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="receipt-outline" size={28} color="#9CA3AF" />
                <Text className="mt-3 font-poppins-semibold text-[15px] text-[#4B5563]">
                  Belum ada transaksi
                </Text>
                <Text className="mt-1 font-poppins text-[12px] text-[#9CA3AF]">
                  Tidak ada riwayat transaksi pada bulan ini.
                </Text>
              </View>
            ) : (
              currentData.transactions.slice(0, 3).map((item, index, array) => (
                <View key={item.id}>
                  <TransactionRow item={item} />
                  {index !== array.length - 1 && (
                    <View className="h-[1px] bg-[#F1F3F7]" />
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <LogoutModal
        visible={isLogoutVisible}
        onClose={() => setIsLogoutVisible(false)}
        onConfirm={() => {
          setIsLogoutVisible(false);
          logout(); // Panggil fungsi logout beneran
        }}
      />
    </SafeAreaView>
  );
}
