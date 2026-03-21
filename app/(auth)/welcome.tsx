import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthWelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 ">
      <View className="flex-1 items-center justify-center ">
        <View className="w-full flex-1 overflow-hidden rounded-[28px] bg-slate-200 shadow-card">
          <View className="flex-[0.45] items-center justify-center bg-slate-200">
            <Image
              source={require("../../assets/images/undraw-finance-illustration.svg")}
              style={{ width: 250, height: 250 }}
              contentFit="contain"
            />
          </View>

          <View className="flex-[0.55] rounded-t-[28px] bg-white px-6 justify-center">
            <Text className="text-center text-2xl font-poppins-bold leading-tight text-[#13213c]">
              Track Finance{"\n"}Easily & Quickly
            </Text>

            <Text className="mt-3 text-center text-sm font-poppins leading-normal text-[#7f8899]">
              Manage your daily expenses and{"\n"}income with our intuitive
              tracker.
            </Text>

            <Pressable
              onPress={() => router.push("/(auth)/register")}
              className="mt-7 h-[52px] items-center justify-center rounded-[14px] bg-primary-600"
            >
              <Text className="text-[14px] font-poppins-medium text-white">
                Register
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="mt-4 h-[52px] items-center justify-center rounded-[14px] border border-[#d9dde5] bg-transparent"
            >
              <Text className="text-[14px] font-poppins-medium text-[#13213c]">
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
