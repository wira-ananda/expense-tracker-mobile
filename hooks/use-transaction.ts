import axiosInstance from "@/middleware/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

type GetTransactionsResponseRaw = TransactionHistoryItemRaw[];
export type GetTransactionsResponse = TransactionHistoryItem[];

type GetCategoriesResponseRaw = Category[];
export type GetCategoriesResponse = Category[];

const normalizeTransaction = (
  item: TransactionHistoryItemRaw,
): TransactionHistoryItem => ({
  ...item,
  amount: Number(item.amount),
});

export const transactionQueryKeys = {
  all: ["transactions"] as const,
  list: () => [...transactionQueryKeys.all, "list"] as const,
  history: () => [...transactionQueryKeys.all, "history"] as const,
  historyByMonth: (year: number, month: number) =>
    [...transactionQueryKeys.history(), "by-month", year, month] as const,
};

export const categoryQueryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryQueryKeys.all, "list"] as const,
  byType: (type: CategoryType) =>
    [...categoryQueryKeys.list(), "by-type", type] as const,
};

export const useTransactionsQuery = (enabled = true) => {
  return useQuery<GetTransactionsResponse, unknown>({
    queryKey: transactionQueryKeys.list(),
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<GetTransactionsResponseRaw>("/transactions");

      return data
        .map(normalizeTransaction)
        .sort(
          (a, b) =>
            new Date(b.transactionDate).getTime() -
            new Date(a.transactionDate).getTime(),
        );
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    throwOnError: false,
  });
};

export const useCategoriesQuery = (type?: CategoryType, enabled = true) => {
  return useQuery<GetCategoriesResponse, unknown>({
    queryKey: type ? categoryQueryKeys.byType(type) : categoryQueryKeys.list(),
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<GetCategoriesResponseRaw>("/categories");

      const sorted = [...data].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }

        return a.categoryname.localeCompare(b.categoryname);
      });

      if (!type) {
        return sorted;
      }

      return sorted.filter((item) => item.type === type);
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    throwOnError: false,
  });
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
        transactions: data.transactions.map(normalizeTransaction),
      };
    },
    enabled: enabled && !!year && !!month,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    throwOnError: false,
  });
};

export type CreateTransactionPayload = {
  categoryId: string;
  amount: number;
  note?: string | null;
  transactionDate: string;
};

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CreateTransactionPayload>({
    mutationFn: async (payload) => {
      await axiosInstance.post("/transactions", {
        categoryId: payload.categoryId,
        amount: payload.amount,
        note: payload.note?.trim() ? payload.note.trim() : undefined,
        transactionDate: payload.transactionDate,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: transactionQueryKeys.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: transactionQueryKeys.history(),
        }),
      ]);
    },
  });
};
