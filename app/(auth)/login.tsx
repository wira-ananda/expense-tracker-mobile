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

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const hasError = true;

  const handleLogin = () => {
    console.log({ usernameOrEmail, password });
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
                Welcome Back
              </Text>
              <Text className="mt-2 text-[14px] text-text-secondary">
                Log in to manage your finances.
              </Text>

              {hasError && (
                <View className="mt-5 flex-row items-center rounded-md border border-[#f6c7c0] bg-[#fff5f3] px-4 py-3">
                  <Ionicons name="alert-circle" size={16} color="#ff6b57" />
                  <Text className="ml-2 text-[13px] text-danger-500">
                    Invalid username or password.
                  </Text>
                </View>
              )}

              <View className="mt-6 gap-y-4">
                <View>
                  <Text className="mb-2 text-[13px] font-medium text-text-primary">
                    Username or Email
                  </Text>
                  <View className="flex-row items-center rounded-md border border-[#f6b8b0] bg-surface px-4 py-4">
                    <Ionicons name="person-outline" size={18} color="#8d8991" />
                    <TextInput
                      value={usernameOrEmail}
                      onChangeText={setUsernameOrEmail}
                      placeholder="johndoe"
                      placeholderTextColor="#b9b5bf"
                      autoCapitalize="none"
                      className="ml-3 flex-1 text-[14px] text-text-primary"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-2 text-[13px] font-medium text-text-primary">
                    Password
                  </Text>
                  <View className="flex-row items-center rounded-md border border-[#f6b8b0] bg-surface px-4 py-4">
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#8d8991"
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••••••"
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

                  <TouchableOpacity
                    className="mt-2 self-end"
                    onPress={() => console.log("Forgot password")}
                  >
                    <Text className="text-[12px] text-text-secondary">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                className="mt-8 rounded-md bg-[#c4fb22] py-4"
                activeOpacity={0.85}
              >
                <Text className="text-center text-[15px] font-bold text-black">
                  Log In
                </Text>
              </TouchableOpacity>

              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-[13px] text-text-secondary">
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text className="text-[13px] font-semibold text-text-primary">
                    Register
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
