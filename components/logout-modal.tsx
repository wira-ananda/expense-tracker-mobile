import { appShadows } from "@/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay Gelap */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center px-6"
      >
        {/* Box Modal */}
        <Pressable
          className="w-full bg-white rounded-[18px] p-6"
          style={appShadows.logoutModal}
        >
          <View className="items-center">
            <View className="h-16 w-16 bg-[#252528] rounded-full items-center justify-center mb-4">
              <Ionicons name="log-out" size={30} color="#FF5D52" />
            </View>

            <Text className="font-poppins-bold text-[20px] text-black text-center">
              Mau istirahat dulu?
            </Text>

            <Text className="font-poppins text-[14px] text-[#B9BEC8] text-center mt-2 px-4 leading-5">
              Sesi kamu akan berakhir. Kamu perlu login lagi nanti untuk
              mencatat pengeluaran.
            </Text>
          </View>

          <View className="flex-row gap-3 mt-8">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 py-4 rounded-[20px] bg-[#252528]"
            >
              <Text className="text-center font-poppins-semibold text-black text-[15px]">
                Batal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              className="flex-1 py-4 rounded-[20px]"
            >
              <Text className="text-center font-poppins-semibold text-red-500 text-[15px]">
                Ya, Keluar
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
