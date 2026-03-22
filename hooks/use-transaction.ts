import axiosInstance from "@/middleware/axios-instance";
import { useQuery } from "@tanstack/react-query";

export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  userId: string;
  categoryname: string;
  type: CategoryType;
};

type TransactionHistoryItemRaw = {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: string | number;
  note: string | null;
  transactionDate: string;
  category: Category;
};

export type TransactionHistoryItem = {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  transactionDate: string;
  category: Category;
};

type GetTransactionHistoryByMonthResponseRaw = {
  year: number;
  month: number;
  income: number;
  expense: number;
  balance: number;
  transactions: TransactionHistoryItemRaw[];
};

export type GetTransactionHistoryByMonthResponse = {
  year: number;
  month: number;
  income: number;
  expense: number;
  balance: number;
  transactions: TransactionHistoryItem[];
};

type UseTransactionHistoryByMonthParams = {
  year: number;
  month: number;
  enabled?: boolean;
};

export const transactionQueryKeys = {
  all: ["transactions"] as const,
  history: () => [...transactionQueryKeys.all, "history"] as const,
  historyByMonth: (year: number, month: number) =>
    [...transactionQueryKeys.history(), "by-month", year, month] as const,
};

export const useTransactionHistoryByMonthQuery = ({
  year,
  month,
  enabled = true,
}: UseTransactionHistoryByMonthParams) => {
  return useQuery<
    GetTransactionHistoryByMonthResponse,
    unknown,
    GetTransactionHistoryByMonthResponse
  >({
    queryKey: transactionQueryKeys.historyByMonth(year, month),
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<GetTransactionHistoryByMonthResponseRaw>(
          "/transactions/history/by-month",
          {
            params: {
              year,
              month,
            },
          },
        );

      return {
        ...data,
        income: Number(data.income),
        expense: Number(data.expense),
        balance: Number(data.balance),
        transactions: data.transactions.map((item) => ({
          ...item,
          amount: Number(item.amount),
        })),
      };
    },
    enabled: enabled && !!year && !!month,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    throwOnError: false,
  });
};
