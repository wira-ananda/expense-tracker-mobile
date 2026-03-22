import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";

type UserType = {
  id?: string | null;
  _id?: string | null;
  username?: string;
  email?: string;
  [key: string]: any;
} | null;

type GlobalContextType = {
  passwordVisible: boolean;
  handlePasswordVisible: () => void;
  logout: () => Promise<void>;
  userId: string | null;
  user: UserType;
  token: string | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

type GlobalContextProviderProps = {
  children: ReactNode;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider = ({
  children,
}: GlobalContextProviderProps) => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserType>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // ✅ auth check in progress

  const handlePasswordVisible = () => setPasswordVisible((prev) => !prev);

  const logout = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("user_email");
    await AsyncStorage.removeItem("userData");

    setUser(null);
    setToken(null);
    setUserId(null);

    Toast.show({
      type: "success",
      text1: "Berhasil logout.",
    });

    // Navigasi pindahkan ke screen atau router
  };

  const refreshUser = async () => {
    try {
      const storedUserString = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("auth_token");

      const storedUser = storedUserString ? JSON.parse(storedUserString) : null;

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
        setUserId(storedUser.id || storedUser._id || null);
      } else {
        setUser(null);
        setToken(null);
        setUserId(null);
      }
    } catch (error) {
      console.error("Gagal load user dari AsyncStorage:", error);
    } finally {
      setIsLoading(false); // ✅ auth loading selesai
    }
  };

  useEffect(() => {
    refreshUser();

    // React Native tidak punya sync update lintas tab seperti web
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        passwordVisible,
        handlePasswordVisible,
        logout,
        userId,
        user,
        token,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalContext harus digunakan di dalam GlobalContextProvider",
    );
  }

  return context;
};
