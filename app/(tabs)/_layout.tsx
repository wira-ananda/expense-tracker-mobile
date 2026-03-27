import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";

function FloatingAddButton({ onPress }: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress ?? undefined}
      className="items-center justify-center"
    >
      <View
        className="h-16 w-16 -mt-10 items-center justify-center rounded-full bg-[#C9FF1A]"
        style={{
          // Shadow lebih dramatis untuk Floating Button
          shadowColor: "#C9FF1A",
          shadowOpacity: 0.4,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
          borderWidth: 4,
          borderColor: "#070707", // Border agar tidak "nempel" dengan background hitam
        }}
      >
        <Ionicons name="add" size={35} color="#000" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C9FF1A", // Warna Neon/Lime kamu
        tabBarInactiveTintColor: "#5E6678",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Poppins-Medium",
          marginBottom: Platform.OS === "ios" ? 0 : 12,
        },
        tabBarStyle: {
          // --- ROUNDED ATAS SAJA ---
          height: Platform.OS === "ios" ? 94 : 78,
          backgroundColor: "#151517", // Abu-abu gelap agar lekukan terlihat di atas hitam pekat
          borderTopLeftRadius: 32, // Lekukan kiri atas
          borderTopRightRadius: 32, // Lekukan kanan atas
          borderTopWidth: 0, // Hilangkan garis standar

          // Shadow agar bagian atas yang melengkung terlihat "berjarak" dari konten
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -8 },
          elevation: 20,

          // Posisi tetap di bawah (bukan floating melayang)
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,

          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 32 : 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"} // Menggunakan icon grid agar lebih modern
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <FloatingAddButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"} // Icon receipt lebih cocok untuk expense tracker
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
