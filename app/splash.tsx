import { Ionicons } from "@expo/vector-icons"; // 1. Impor Ionicons
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function SplashScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (done) {
    return <Redirect href="/(auth)/" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#0F172A]">
      <View
        className="h-20 w-20 items-center justify-center rounded-[24px]"
        style={{ backgroundColor: "#EAF8F0" }}
      >
        <Ionicons name="wallet" size={40} color="#2FB36F" />
      </View>

      <Text className="mt-6 text-3xl font-poppins-bold text-white">
        Expense
        <Text className="text-[#2FB36F]"> Tracker</Text>
      </Text>
    </View>
  );
}
