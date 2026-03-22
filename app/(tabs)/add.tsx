import {
  CategoryType,
  useCategoriesQuery,
  useCreateTransactionMutation,
} from "@/hooks/use-transaction";
import errorMiddleware from "@/middleware/error-middleware";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const TRANSACTION_TABS: { label: string; value: CategoryType }[] = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

const ALLOWED_CATEGORY_ORDER = [
  "Makan",
  "Belanja",
  "Transportasi",
  "Tagihan Listrik",
  "Internet",
  "Hiburan",
  "Gaji",
  "Bonus",
  "Hadiah",
  "Investasi",
  "Penjualan Produk",
] as const;

function sanitizeAmountInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function formatAmountDisplay(rawValue: string) {
  const numericValue = Number(rawValue || "0");

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function maskDateInput(value: string) {
  const digits = value.replace(/[^\d]/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatDateForInput(date: Date) {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function parseDateInput(value: string) {
  const input = value.trim();

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return null;

  const [day, month, year] = input.split("/").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isValid ? date : null;
}

function getCategoryVisual(categoryName: string, type: CategoryType) {
  const category = categoryName.toLowerCase();
  const isIncome = type === "income";

  if (category.includes("makan")) {
    return {
      icon: "restaurant" as keyof typeof Ionicons.glyphMap,
      iconBg: "#EAF1FF",
      iconColor: "#4F8DF7",
    };
  }

  if (category.includes("belanja")) {
    return {
      icon: "cart" as keyof typeof Ionicons.glyphMap,
      iconBg: "#FDECEC",
      iconColor: "#FF5D52",
    };
  }

  if (category.includes("transport")) {
    return {
      icon: "bus" as keyof typeof Ionicons.glyphMap,
      iconBg: "#EAF1FF",
      iconColor: "#4F8DF7",
    };
  }

  if (category.includes("listrik")) {
    return {
      icon: "flash" as keyof typeof Ionicons.glyphMap,
      iconBg: "#FFF3E8",
      iconColor: "#F29C4B",
    };
  }

  if (category.includes("internet")) {
    return {
      icon: "wifi" as keyof typeof Ionicons.glyphMap,
      iconBg: "#EAF1FF",
      iconColor: "#4F8DF7",
    };
  }

  if (category.includes("hiburan")) {
    return {
      icon: "game-controller" as keyof typeof Ionicons.glyphMap,
      iconBg: "#F4EEFF",
      iconColor: "#8B5CF6",
    };
  }

  if (category.includes("gaji")) {
    return {
      icon: "wallet" as keyof typeof Ionicons.glyphMap,
      iconBg: "#EAF8F0",
      iconColor: "#2FB36F",
    };
  }

  if (category.includes("bonus")) {
    return {
      icon: "gift" as keyof typeof Ionicons.glyphMap,
      iconBg: "#EEF7FF",
      iconColor: "#3B82F6",
    };
  }

  if (category.includes("hadiah")) {
    return {
      icon: "gift" as keyof typeof Ionicons.glyphMap,
      iconBg: "#FFF4E6",
      iconColor: "#F59E0B",
    };
  }

  if (category.includes("investasi")) {
    return {
      icon: "bar-chart" as keyof typeof Ionicons.glyphMap,
      iconBg: "#F3EEFF",
      iconColor: "#8B5CF6",
    };
  }

  if (category.includes("penjualan")) {
    return {
      icon: "storefront" as keyof typeof Ionicons.glyphMap,
      iconBg: "#E8FBF3",
      iconColor: "#10B981",
    };
  }

  return {
    icon: isIncome
      ? ("trending-up" as keyof typeof Ionicons.glyphMap)
      : ("wallet" as keyof typeof Ionicons.glyphMap),
    iconBg: isIncome ? "#EAF8F0" : "#EAF1FF",
    iconColor: isIncome ? "#2FB36F" : "#4F8DF7",
  };
}

export default function AddScreen() {
  const router = useRouter();
  const amountInputRef = useRef<TextInput>(null);

  const [selectedType, setSelectedType] = useState<CategoryType>("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState(formatDateForInput(new Date()));
  const [note, setNote] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategoriesQuery(selectedType);

  const {
    mutateAsync: createTransaction,
    isPending,
    error: createError,
  } = useCreateTransactionMutation();

  useEffect(() => {
    if (categoriesError) {
      errorMiddleware(categoriesError);
    }
  }, [categoriesError]);

  useEffect(() => {
    if (createError) {
      errorMiddleware(createError);
    }
  }, [createError]);

  const filteredCategories = useMemo(() => {
    return [...(categoriesData ?? [])]
      .filter((item) =>
        ALLOWED_CATEGORY_ORDER.includes(
          item.categoryname as (typeof ALLOWED_CATEGORY_ORDER)[number],
        ),
      )
      .sort((a, b) => {
        const left = ALLOWED_CATEGORY_ORDER.indexOf(
          a.categoryname as (typeof ALLOWED_CATEGORY_ORDER)[number],
        );
        const right = ALLOWED_CATEGORY_ORDER.indexOf(
          b.categoryname as (typeof ALLOWED_CATEGORY_ORDER)[number],
        );

        return left - right;
      });
  }, [categoriesData]);

  const selectedCategory = useMemo(() => {
    return (
      filteredCategories.find((item) => item.id === selectedCategoryId) ?? null
    );
  }, [filteredCategories, selectedCategoryId]);

  useEffect(() => {
    if (!filteredCategories.length) {
      setSelectedCategoryId("");
      return;
    }

    const stillExists = filteredCategories.some(
      (item) => item.id === selectedCategoryId,
    );

    if (!stillExists) {
      setSelectedCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, selectedCategoryId]);

  const amountDisplay = useMemo(
    () => formatAmountDisplay(amountInput),
    [amountInput],
  );

  const handleAmountChange = (value: string) => {
    setAmountInput(sanitizeAmountInput(value));
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(maskDateInput(value));
  };

  const openDatePicker = () => setIsDatePickerVisible(true);
  const closeDatePicker = () => setIsDatePickerVisible(false);

  const handleConfirmDate = (date: Date) => {
    setDateInput(formatDateForInput(date));
    closeDatePicker();
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleSave = async () => {
    const parsedDate = parseDateInput(dateInput);

    if (!amountInput || Number(amountInput) <= 0) {
      Alert.alert("Validasi", "Amount harus lebih dari 0.");
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert("Validasi", "Pilih category terlebih dahulu.");
      return;
    }

    if (!parsedDate) {
      Alert.alert("Validasi", "Format date harus DD/MM/YYYY.");
      return;
    }

    try {
      await createTransaction({
        categoryId: selectedCategoryId,
        amount: Number(amountInput),
        note: note.trim() ? note.trim() : null,
        transactionDate: parsedDate.toISOString(),
      });

      Alert.alert("Berhasil", "Transaksi berhasil disimpan.");
      setAmountInput("");
      setNote("");
      setDateInput(formatDateForInput(new Date()));
      setSelectedCategoryId("");
      router.replace("/(tabs)/history");
    } catch {
      // error handled by effect
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E9E9EC]">
      <StatusBar style="dark" />

      <View className="flex-1 px-4 py-3">
        <View className="flex-1 overflow-hidden rounded-[30px] bg-white">
          <View className="flex-row items-center border-b border-[#ECEDEF] px-5 py-5">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleClose}
              style={styles.headerIconShadow}
              className="h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F7]"
            >
              <Ionicons name="close" size={20} color="#3C4456" />
            </TouchableOpacity>

            <View className="flex-1 items-center pr-11">
              <Text className="font-poppins-bold text-[24px] text-[#182033]">
                Add Transaction
              </Text>
            </View>
          </View>

          {isCategoriesLoading ? (
            <View className="flex-1 items-center justify-center px-6">
              <ActivityIndicator size="large" color="#B5F50A" />
              <Text className="mt-4 text-center font-poppins text-[14px] text-[#7C8699]">
                Memuat kategori...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 28,
                }}
              >
                <View className="rounded-[16px] bg-[#F2F2F6] p-1">
                  <View className="flex-row">
                    {TRANSACTION_TABS.map((tab) => {
                      const isActive = selectedType === tab.value;

                      return (
                        <TouchableOpacity
                          key={tab.value}
                          activeOpacity={0.9}
                          onPress={() => setSelectedType(tab.value)}
                          className={`flex-1 rounded-[12px] px-4 py-2 ${
                            isActive ? "bg-white" : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-center font-poppins-medium text-[15px] ${
                              isActive ? "text-[#182033]" : "text-[#7C8699]"
                            }`}
                          >
                            {tab.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => amountInputRef.current?.focus()}
                  className="items-center px-3 pb-2 pt-6"
                >
                  <Text className="font-poppins-medium text-[15px] text-[#7C8699]">
                    Amount
                  </Text>

                  <View className="flex-row items-center">
                    <Text className="mr-4 font-poppins-bold text-[28px] text-[#163254]">
                      Rp
                    </Text>
                    <Text className="font-poppins-bold text-[48px] leading-[54px] text-[#163254]">
                      {amountDisplay}
                    </Text>
                  </View>

                  <TextInput
                    ref={amountInputRef}
                    value={amountInput}
                    onChangeText={handleAmountChange}
                    keyboardType={
                      Platform.OS === "ios" ? "number-pad" : "numeric"
                    }
                    className="absolute h-[1px] w-[1px] opacity-0"
                    caretHidden
                  />
                </TouchableOpacity>

                <View className="mt-2">
                  <Text className="mb-2 font-poppins-semibold text-[16px] text-[#182033]">
                    Category
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setIsCategoryModalVisible(true)}
                    className="flex-row items-center rounded-[18px] border border-[#DDE2EB] bg-white px-4 py-3"
                  >
                    <View
                      className="mr-3 h-11 w-11 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: selectedCategory
                          ? getCategoryVisual(
                              selectedCategory.categoryname,
                              selectedCategory.type,
                            ).iconBg
                          : "#EAF1FF",
                      }}
                    >
                      <Ionicons
                        name={
                          selectedCategory
                            ? getCategoryVisual(
                                selectedCategory.categoryname,
                                selectedCategory.type,
                              ).icon
                            : "list-outline"
                        }
                        size={20}
                        color={
                          selectedCategory
                            ? getCategoryVisual(
                                selectedCategory.categoryname,
                                selectedCategory.type,
                              ).iconColor
                            : "#4F8DF7"
                        }
                      />
                    </View>

                    <Text className="flex-1 font-poppins-medium text-[17px] text-[#1F2A44]">
                      {selectedCategory?.categoryname ?? "Select category"}
                    </Text>

                    <Ionicons
                      name="chevron-down-outline"
                      size={22}
                      color="#7C8699"
                    />
                  </TouchableOpacity>
                </View>

                <View className="mt-3">
                  <Text className="mb-1 font-poppins-semibold text-[16px] text-[#182033]">
                    Date
                  </Text>

                  <View className="flex-row items-center rounded-[18px] border border-[#DDE2EB] bg-white px-4 py-2">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#7C8699"
                    />

                    <TextInput
                      value={dateInput}
                      onChangeText={handleDateInputChange}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#A0A7B4"
                      keyboardType={
                        Platform.OS === "ios" ? "number-pad" : "numeric"
                      }
                      maxLength={10}
                      className="ml-3 mt-1 flex-1 font-poppins-medium text-[17px] text-[#1F2A44]"
                    />

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={openDatePicker}
                      className="ml-3"
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#182033"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="mb-2 font-poppins-semibold text-[16px] text-[#182033]">
                    Note (Optional)
                  </Text>

                  <View className="min-h-[126px] flex-row rounded-[18px] border border-[#DDE2EB] bg-white px-4 py-2">
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#7C8699"
                      className="mt-3"
                    />
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="Add details..."
                      placeholderTextColor="#A0A7B4"
                      multiline
                      textAlignVertical="top"
                      className="ml-3 flex-1 font-poppins text-[16px] leading-6 text-[#1F2A44]"
                    />
                  </View>
                </View>

                {!filteredCategories.length ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => void refetchCategories()}
                    className="mt-5 rounded-[16px] bg-[#F6F6F8] px-4 py-4"
                  >
                    <Text className="text-center font-poppins-medium text-[14px] text-[#7C8699]">
                      Kategori tidak tersedia. Tap untuk muat ulang.
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </ScrollView>

              <View className="border-t border-[#ECEDEF] px-5 py-5">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleSave}
                  disabled={isPending || !filteredCategories.length}
                  className={`items-center justify-center rounded-[18px] py-4 ${
                    isPending || !filteredCategories.length
                      ? "bg-[#D9ECA1]"
                      : "bg-[#B5F50A]"
                  }`}
                >
                  {isPending ? (
                    <ActivityIndicator color="#182033" />
                  ) : (
                    <Text className="font-poppins-bold text-[18px] text-[#101828]">
                      Save Transaction
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={parseDateInput(dateInput) ?? new Date()}
        onConfirm={handleConfirmDate}
        onCancel={closeDatePicker}
      />

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/25">
            <TouchableWithoutFeedback>
              <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-5">
                <View className="mb-4 items-center">
                  <View className="h-[5px] w-14 rounded-full bg-[#D9DEE7]" />
                </View>

                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="font-poppins-bold text-[20px] text-[#182033]">
                    Select Category
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setIsCategoryModalVisible(false)}
                  >
                    <Ionicons name="close" size={22} color="#3C4456" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 420 }}
                >
                  {filteredCategories.map((item, index) => {
                    const isSelected = item.id === selectedCategoryId;
                    const visual = getCategoryVisual(
                      item.categoryname,
                      item.type,
                    );

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.88}
                        onPress={() => {
                          setSelectedCategoryId(item.id);
                          setIsCategoryModalVisible(false);
                        }}
                        className={`flex-row items-center rounded-[18px] px-3 py-3 ${
                          index === 0 ? "" : "mt-2"
                        } ${isSelected ? "bg-[#F6FAEA]" : "bg-[#F7F8FA]"}`}
                      >
                        <View
                          className="mr-3 h-11 w-11 items-center justify-center rounded-full"
                          style={{ backgroundColor: visual.iconBg }}
                        >
                          <Ionicons
                            name={visual.icon}
                            size={20}
                            color={visual.iconColor}
                          />
                        </View>

                        <Text className="flex-1 font-poppins-medium text-[16px] text-[#1F2A44]">
                          {item.categoryname}
                        </Text>

                        {isSelected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#2FB36F"
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerIconShadow: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
