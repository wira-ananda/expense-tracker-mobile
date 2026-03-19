import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    console.log({ username, email, password });
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 py-8">
            <View className="w-full max-w-[380px] rounded-[28px] bg-surface px-6 py-7 shadow-card">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mb-7 h-10 w-10 items-center justify-center rounded-full bg-surface-soft"
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={18} color="#1f2a44" />
              </TouchableOpacity>

              <Text className="text-[36px] font-bold text-text-primary">
                Create Account
              </Text>
              <Text className="mt-2 text-[14px] text-text-secondary">
                Start your financial journey today.
              </Text>

              <View className="mt-8 gap-y-4">
                <View>
                  <Text className="mb-2 text-[13px] font-medium text-text-primary">
                    Username
                  </Text>
                  <View className="flex-row items-center rounded-md bg-surface-soft px-4 py-4">
                    <Ionicons name="person-outline" size={18} color="#8d8991" />
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="johndoe"
                      placeholderTextColor="#b9b5bf"
                      className="ml-3 flex-1 text-[14px] text-text-primary"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-2 text-[13px] font-medium text-text-primary">
                    Email
                  </Text>
                  <View className="flex-row items-center rounded-md bg-surface-soft px-4 py-4">
                    <Ionicons name="mail-outline" size={18} color="#8d8991" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="john@example.com"
                      placeholderTextColor="#b9b5bf"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="ml-3 flex-1 text-[14px] text-text-primary"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-2 text-[13px] font-medium text-text-primary">
                    Password
                  </Text>
                  <View className="flex-row items-center rounded-md bg-surface-soft px-4 py-4">
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#8d8991"
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#b9b5bf"
                      secureTextEntry={!showPassword}
                      className="ml-3 flex-1 text-[14px] text-text-primary"
                    />
                    <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={18}
                        color="#8d8991"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                className="mt-8 rounded-md bg-[#c4fb22] py-4"
                activeOpacity={0.85}
              >
                <Text className="text-center text-[15px] font-bold text-black">
                  Sign Up
                </Text>
              </TouchableOpacity>

              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-[13px] text-text-secondary">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text className="text-[13px] font-semibold text-text-primary">
                    Log in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
