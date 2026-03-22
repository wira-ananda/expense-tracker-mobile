import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#F3F3F5]">
      <Text className="font-poppins-semibold text-lg text-[#1F2A44]">
        History Screen
      </Text>
    </SafeAreaView>
  );
}
