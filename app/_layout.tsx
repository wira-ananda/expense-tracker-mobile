import {
  GlobalContextProvider,
  useGlobalContext,
} from "@/hooks/use-global-context";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "../styles/global.css";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Komponen internal untuk menangani proteksi rute
function RootNavigation() {
  const { token, isLoading } = useGlobalContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log("TOKEN:", token);
    console.log("IS_LOADING:", isLoading);
    console.log("SEGMENTS:", segments);

    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/splash");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [fontsLoaded] = useFonts({
    PoppinsThin: require("../assets/fonts/Poppins-Thin.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsBlack: require("../assets/fonts/Poppins-Black.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <GlobalContextProvider>
      <ThemeProvider value={DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          {/* RootNavigation dipanggil di sini agar bisa akses data dari GlobalContextProvider */}
          <RootNavigation />
        </QueryClientProvider>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </GlobalContextProvider>
  );
}
