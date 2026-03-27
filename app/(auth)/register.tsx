import { useRegisterMutation } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const registerMutation = useRegisterMutation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const hasError = registerMutation.isError;

  const handleRegister = () => {
    registerMutation.mutate({
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center">
            <View className="w-full px-6 py-7">
              <TouchableOpacity
                onPress={() => router.push("/(auth)/")}
                className="mb-7 h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={18} color="#1f2a44" />
              </TouchableOpacity>

              <Text className="text-[36px] font-poppins-bold text-text-primary">
                Create Account
              </Text>
              <Text className="text-[14px] text-text-secondary">
                Start your financial journey today.
              </Text>

              {hasError && (
                <View className="mt-5 flex-row items-center rounded-md border border-[#f6c7c0] bg-[#fff5f3] px-4 py-3">
                  <Ionicons name="alert-circle" size={16} color="#ff6b57" />
                  <Text className="ml-2 text-[13px] text-danger-500">
                    Registrasi gagal. Periksa kembali data Anda.
                  </Text>
                </View>
              )}

              <View className="mt-8 gap-y-4">
                <View>
                  <Text className="mb-2 text-[13px] font-poppins-medium text-text-primary">
                    Username
                  </Text>
                  <View className="flex-row items-center rounded-md bg-surface-soft px-4 py-4">
                    <Ionicons name="person-outline" size={18} color="#8d8991" />
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="johndoe"
                      placeholderTextColor="#b9b5bf"
                      autoCapitalize="none"
                      className="ml-3 flex-1 text-[14px] text-text-primary"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-2 text-[13px] font-poppins-medium text-text-primary">
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
                  <Text className="mb-2 text-[13px] font-poppins-medium text-text-primary">
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
                disabled={registerMutation.isPending}
                className={`mt-8 rounded-md py-4 ${
                  registerMutation.isPending
                    ? "bg-secondary-100"
                    : "bg-primary-500"
                }`}
                activeOpacity={0.85}
              >
                <Text className="text-center text-[15px] font-poppins-bold text-white">
                  {registerMutation.isPending ? "Loading..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <View className="mt-6 flex-row items-center justify-center">
                <Text className="font-poppins text-[13px] text-text-secondary">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text className="text-[13px] font-poppins-semibold text-text-primary">
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
