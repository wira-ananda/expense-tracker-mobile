import axiosInstance from "@/middleware/axios-instance";
import errorMiddleware from "@/middleware/error-middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "./use-global-context";

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

type User = {
  id?: string;
  username: string;
  email: string;
};

// type AuthUserResponse = {
//   user: User;
// };

type RegisterResponse = {
  message?: string;
  user?: User;
};

type LoginResponse = {
  id: string;
  username: string;
  email: string;
  token: string;
  [key: string]: unknown;
};

export const useLoginMutation = () => {
  const { refreshUser } = useGlobalContext();

  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (userData: LoginPayload) => {
      const { data } = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        userData,
      );
      const { id, username, email, token } = data;

      await Promise.all([
        AsyncStorage.setItem("auth_token", token),
        AsyncStorage.setItem("user_email", email),
        AsyncStorage.setItem("user", JSON.stringify({ id, username, email })),
      ]);
      // await AsyncStorage.setItem("userData", JSON.stringify(data));

      return data;
    },

    onSuccess: async () => {
      await refreshUser();

      Toast.show({
        type: "success",
        text1: "Berhasil masuk ke akun Anda.",
        text2: "Selamat Datang!",
      });

      router.replace("/(tabs)");
    },
    onError: (err) => {
      console.log("LOGIN ERROR:", err);
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation<RegisterResponse, unknown, RegisterPayload>({
    mutationFn: async (userData: RegisterPayload) => {
      const { data } = await axiosInstance.post<RegisterResponse>(
        "/auth/register",
        userData,
      );
      return data;
    },

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Registrasi Berhasil",
        text2: "Silakan login dengan akun baru Anda.",
      });

      router.replace("/(auth)/login");
    },

    onError: (err) => {
      console.log("REGISTER ERROR:", err);
      errorMiddleware(err);
    },
  });
};

// export const useAuthQuery = () => {
//   return useQuery<User>({
//     queryKey: ["authUser"],
//     queryFn: async () => {
//       try {
//         const response = await axiosInstance.get<AuthUserResponse>("/user");
//         return response.data.user;
//       } catch (error) {
//         throw new Error("Not authenticated");
//       }
//     },
//     retry: false,
//     staleTime: 1000 * 60 * 5,
//   });
// };

// export const useUpdateUserMutation = () => {
//   return useMutation({
//     mutationFn: async ({ userId, userData }) => {
//       const { data } = await axiosInstance.put(`users/${userId}`, userData);
//       return data;
//     },
//     onSuccess: (data) => {
//       message.success(data.message || "User berhasil diperbarui");
//     },
//     onError: errorMiddleware,
//   });
// };
