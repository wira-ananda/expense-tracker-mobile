import { useGlobalContext } from "@/hooks/use-global-context";
import { useTransactionsQuery } from "@/hooks/use-transaction";
import errorMiddleware from "@/middleware/error-middleware";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function MenuItem({
  icon,
  title,
  iconBg,
  iconColor,
  textColor = "#101828",
  showChevron = true,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconBg: string;
  iconColor: string;
  textColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <Text
        className="flex-1 font-poppins-medium text-[15px]"
        style={{ color: textColor }}
      >
        {title}
      </Text>

      {showChevron ? (
        <Ionicons name="chevron-forward-outline" size={18} color="#A0A7B4" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  // Asumsi hook context-mu expose user dan logout.
  // Kalau nama function-nya beda, cukup ubah destructuring ini.
  const { user, logout } = useGlobalContext();

  const { data, isLoading, error } = useTransactionsQuery();

  useEffect(() => {
    if (error) {
      errorMiddleware(error);
    }
  }, [error]);

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();

    return (data ?? []).filter((item) => {
      const date = new Date(item.transactionDate);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [data]);

  const monthlySpend = useMemo(() => {
    return currentMonthTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [currentMonthTransactions]);

  const monthlyIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
  }, [currentMonthTransactions]);

  const savings = useMemo(() => {
    return monthlyIncome - monthlySpend;
  }, [monthlyIncome, monthlySpend]);

  const savingsColor = savings >= 0 ? "#2FB36F" : "#FF5D52";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handlePersonalInfo = () => {
    Alert.alert("Info", "Halaman Personal Info belum dibuat.");
  };

  const handleSecurity = () => {
    Alert.alert("Info", "Halaman Security belum dibuat.");
  };

  const handleExport = () => {
    Alert.alert("Info", "Fitur export data belum dibuat.");
  };

  const handleAbout = () => {
    Alert.alert(
      "About App",
      "Finance Tracker\nVersi 2.4.1\nDibuat oleh: Your Name",
    );
  };

  const handleSignOut = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }

      router.replace("/(auth)/login");
    } catch (signOutError) {
      errorMiddleware(signOutError);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEF0F3]">
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-3 overflow-hidden rounded-[8px] border border-[#D7D9DE] bg-white">
          <View className="flex-row items-center border-b border-[#ECEDEF] px-4 py-4">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleBack}
              style={styles.iconButtonShadow}
              className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F7]"
            >
              <Ionicons name="arrow-back" size={20} color="#3C4456" />
            </TouchableOpacity>

            <Text className="flex-1 font-poppins-bold text-[18px] text-[#101828]">
              Profile
            </Text>
          </View>

          <View className="bg-[#F3F4F6] px-4 py-4">
            <View className="rounded-[22px] bg-white px-4 py-4">
              <View className="flex-row items-center">
                <View className="mr-4 h-16 w-16 items-center justify-center rounded-full border-2 border-[#2FB36F] bg-[#E8F7EF]">
                  <Ionicons name="person" size={30} color="#2FB36F" />
                </View>

                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="font-poppins-bold text-[22px] text-[#111827]"
                  >
                    {user?.username ?? "User"}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="mt-1 font-poppins text-[14px] text-[#7C8699]"
                  >
                    {user?.email ?? "email@example.com"}
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-[18px] bg-[#F5F6F8] px-4 py-4">
                  <Text className="font-poppins text-[12px] text-[#98A2B3]">
                    Monthly Spend
                  </Text>

                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#111827"
                      style={{ marginTop: 10 }}
                    />
                  ) : (
                    <Text className="mt-2 font-poppins-bold text-xl text-[#111827]">
                      {formatRupiah(monthlySpend)}
                    </Text>
                  )}

                  <Text className="mt-2 font-poppins text-sm text-[#FF5D52]">
                    Bulan berjalan
                  </Text>
                </View>

                <View className="flex-1 rounded-[18px] bg-[#F5F6F8] px-4 py-4">
                  <Text className="font-poppins text-[12px] text-[#98A2B3]">
                    Savings
                  </Text>

                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#2FB36F"
                      style={{ marginTop: 10 }}
                    />
                  ) : (
                    <Text
                      className="mt-2 font-poppins-bold text-xl"
                      style={{ color: savingsColor }}
                    >
                      {formatRupiah(savings)}
                    </Text>
                  )}

                  <Text
                    className="mt-2 font-poppins text-sm"
                    style={{ color: savingsColor }}
                  >
                    Bulan berjalan
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 overflow-hidden rounded-[22px] bg-white">
              <MenuItem
                icon="person-outline"
                title="Personal Info"
                iconBg="#DDF5E8"
                iconColor="#2FB36F"
                onPress={handlePersonalInfo}
              />

              <View className="h-[1px] bg-[#ECEDEF]" />

              <MenuItem
                icon="lock-closed-outline"
                title="Security"
                iconBg="#DDF5E8"
                iconColor="#2FB36F"
                onPress={handleSecurity}
              />

              <View className="h-[1px] bg-[#ECEDEF]" />

              <MenuItem
                icon="download-outline"
                title="Export Data"
                iconBg="#DDF5E8"
                iconColor="#2FB36F"
                onPress={handleExport}
              />

              <View className="h-[1px] bg-[#ECEDEF]" />

              <MenuItem
                icon="information-circle-outline"
                title="About App"
                iconBg="#DDF5E8"
                iconColor="#2FB36F"
                onPress={handleAbout}
              />

              <View className="h-[1px] bg-[#ECEDEF]" />

              <MenuItem
                icon="log-out-outline"
                title="Sign Out"
                iconBg="#FFE9E7"
                iconColor="#FF5D52"
                textColor="#FF5D52"
                showChevron={false}
                onPress={handleSignOut}
              />
            </View>

            <Text className="mt-6 text-center font-poppins text-[12px] text-[#B4BAC6]">
              Finance Tracker v2.4.1
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconButtonShadow: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
