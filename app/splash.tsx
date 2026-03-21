import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

export default function SplashScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (done) {
    return <Redirect href="/welcome" />;
  }

  return (
    <View className="flex-1 items-center justify-center">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-600">
        <Image
          source={require("../assets/images/logo.svg")}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </View>

      <Text className="mt-5 text-3xl font-poppins-bold text-white">
        Expense
        <Text className="text-primary-600">Tracker</Text>
      </Text>
    </View>
  );
}
