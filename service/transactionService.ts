import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";

export interface ChartDataPoint {
  period: string;
  amount: number;
  income: number;
  expenses: number;
}

export interface StatisticsData {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactions: TransactionType[];
  chartData: ChartDataPoint[];
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
  period: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;

    // Validate required fields
    if (!amount || amount <= 0 || !walletId || !type) {
      return {
        success: false,
        msg: "Invalid transaction data: amount, walletId, and type are required",
      };
    }

    if (!["income", "expense"].includes(type)) {
      return {
        success: false,
        msg: "Transaction type must be 'income' or 'expense'",
      };
    }

    if (id) {
      // Update existing transaction
      return await updateExistingTransaction(id, transactionData);
    } else {
      // Create new transaction
      return await createNewTransaction(transactionData);
    }
  } catch (error: any) {
    console.error("Error in createOrUpdateTransaction:", error);
    return {
      success: false,
      msg:
        error.message ||
        "An unexpected error occurred while processing the transaction",
    };
  }
};

const createNewTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  const { walletId, amount, type, image } = transactionData;

  // Update wallet for new transaction
  const walletUpdateResult = await updateWalletForNewTransaction(
    walletId!,
    Number(amount!),
    type!
  );

  if (!walletUpdateResult.success) {
    return walletUpdateResult;
  }

  // Handle image upload if provided
  if (image) {
    const imageUploadResult = await uploadFileToCloudinary(
      image,
      "transactions"
    );
    if (!imageUploadResult.success) {
      // Revert wallet changes if image upload fails
      await revertWalletUpdate(walletId!, Number(amount!), type!);
      return {
        success: false,
        msg: imageUploadResult.msg || "Failed to upload receipt",
      };
    }
    transactionData.image = imageUploadResult.data;
  }

  // Set transaction timestamp
  transactionData.date = transactionData.date || Timestamp.now();

  // Create transaction document
  const transactionRef = doc(collection(firestore, "transactions"));
  await setDoc(transactionRef, transactionData);

  return {
    success: true,
    msg: "Transaction created successfully",
    data: { id: transactionRef.id },
  };
};

const updateExistingTransaction = async (
  transactionId: string,
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  const { type, walletId, amount } = transactionData;

  // Get the original transaction
  const oldTransactionSnapshot = await getDoc(
    doc(firestore, "transactions", transactionId)
  );

  if (!oldTransactionSnapshot.exists()) {
    return { success: false, msg: "Transaction not found" };
  }

  const oldTransaction = oldTransactionSnapshot.data() as TransactionType;

  // Check if critical fields have changed
  const criticalFieldsChanged =
    type !== oldTransaction.type ||
    amount !== oldTransaction.amount ||
    walletId !== oldTransaction.walletId;

  if (criticalFieldsChanged) {
    // Revert original transaction's wallet impact and apply new transaction's impact
    const revertResult = await revertAndUpdateWallets(
      oldTransaction,
      Number(amount!),
      type!,
      walletId!
    );

    if (!revertResult.success) {
      return revertResult;
    }
  }

  // Handle image upload if provided
  if (transactionData.image) {
    const imageUploadResult = await uploadFileToCloudinary(
      transactionData.image,
      "transactions"
    );
    if (!imageUploadResult.success) {
      return {
        success: false,
        msg: imageUploadResult.msg || "Failed to upload receipt",
      };
    }
    transactionData.image = imageUploadResult.data;
  }

  // Update the transaction document
  const transactionRef = doc(firestore, "transactions", transactionId);
  await updateDoc(transactionRef, transactionData);

  return { success: true, msg: "Transaction updated successfully" };
};

export const deleteTransaction = async (
  transactionId: string
): Promise<ResponseType> => {
  try {
    // Get the transaction to be deleted
    const transactionSnapshot = await getDoc(
      doc(firestore, "transactions", transactionId)
    );

    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "Transaction not found" };
    }

    const transaction = transactionSnapshot.data() as TransactionType;

    // Revert the wallet impact of this transaction
    const revertResult = await revertWalletUpdate(
      transaction.walletId,
      transaction.amount,
      transaction.type
    );

    if (!revertResult.success) {
      return revertResult;
    }

    // Delete the transaction document
    await deleteDoc(doc(firestore, "transactions", transactionId));

    return { success: true, msg: "Transaction deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      msg: error.message || "Failed to delete transaction",
    };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const walletData = walletSnapshot.data() as WalletType;

    // Check for sufficient balance for expenses
    if (type === "expense" && walletData.amount! < amount) {
      return { success: false, msg: "Insufficient balance in wallet" };
    }

    // Calculate new wallet values
    const updatedWalletAmount =
      type === "expense"
        ? Number(walletData.amount!) - amount
        : Number(walletData.amount!) + amount;

    const updatedTotalIncome =
      type === "income"
        ? Number(walletData.totalIncome || 0) + amount
        : Number(walletData.totalIncome || 0);

    const updatedTotalExpenses =
      type === "expense"
        ? Number(walletData.totalExpenses || 0) + amount
        : Number(walletData.totalExpenses || 0);

    // Update wallet document
    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      totalIncome: updatedTotalIncome,
      totalExpenses: updatedTotalExpenses,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating wallet for new transaction:", error);
    return { success: false, msg: error.message };
  }
};

const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newAmount: number,
  newType: string,
  newWalletId: string
): Promise<ResponseType> => {
  try {
    // Step 1: Revert the impact of the old transaction
    const revertResult = await revertWalletUpdate(
      oldTransaction.walletId,
      oldTransaction.amount,
      oldTransaction.type
    );

    if (!revertResult.success) {
      return revertResult;
    }

    // Step 2: Apply the new transaction impact
    const applyResult = await updateWalletForNewTransaction(
      newWalletId,
      newAmount,
      newType
    );

    return applyResult;
  } catch (error: any) {
    console.error("Error in revertAndUpdateWallets:", error);
    return { success: false, msg: error.message };
  }
};

const revertWalletUpdate = async (
  walletId: string,
  amount: number,
  type: string
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const walletData = walletSnapshot.data() as WalletType;

    // Calculate reverted values (opposite of the original transaction)
    const revertedWalletAmount =
      type === "expense"
        ? Number(walletData.amount!) + amount // Add back the expense
        : Number(walletData.amount!) - amount; // Subtract back the income

    const revertedTotalIncome =
      type === "income"
        ? Number(walletData.totalIncome || 0) - amount
        : Number(walletData.totalIncome || 0);

    const revertedTotalExpenses =
      type === "expense"
        ? Number(walletData.totalExpenses || 0) - amount
        : Number(walletData.totalExpenses || 0);

    // Update wallet document with reverted values
    await updateDoc(walletRef, {
      amount: revertedWalletAmount,
      totalIncome: Math.max(0, revertedTotalIncome), // Ensure non-negative
      totalExpenses: Math.max(0, revertedTotalExpenses), // Ensure non-negative
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error reverting wallet update:", error);
    return { success: false, msg: error.message };
  }
};

// Helper Functions - FIXED DATE RANGES AND CALCULATIONS
const getDateRange = (type: "week" | "month" | "year"): DateRange => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (type) {
    case "week":
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;

    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

const formatDate = (date: Date, format: "day" | "month" | "year"): string => {
  switch (format) {
    case "day":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "month":
      return date.toLocaleDateString("en-US", { month: "short" });
    case "year":
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString();
  }
};

const getTransactionsByDateRange = async (
  userId: string,
  dateRange: DateRange
): Promise<TransactionType[]> => {
  try {

    const transactionsRef = collection(firestore, "transactions");
    const q = query(
      transactionsRef,
      where("uid", "==", userId),
      where("date", ">=", Timestamp.fromDate(dateRange.start)),
      where("date", "<=", Timestamp.fromDate(dateRange.end)),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const transactions: TransactionType[] = [];

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      } as TransactionType);
    });

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};

const calculateStatistics = (
  transactions: TransactionType[]
): {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string;
} => {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryCount: { [key: string]: number } = {};

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;

    if (transaction.type === "income") {
      totalIncome += amount;
    } else if (transaction.type === "expense") {
      totalExpenses += amount;
    }

    // Count categories for top category calculation
    if (transaction.category) {
      categoryCount[transaction.category] =
        (categoryCount[transaction.category] || 0) + 1;
    }
  });

  const netAmount = totalIncome - totalExpenses;
  const transactionCount = transactions.length;
  const averageTransaction =
    transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0;

  // Find top category
  const topCategory = Object.keys(categoryCount).reduce(
    (a, b) => (categoryCount[a] > categoryCount[b] ? a : b),
    "food"
  );

  return {
    totalIncome,
    totalExpenses,
    netAmount,
    transactionCount,
    averageTransaction,
    topCategory,
  };
};

// Weekly Statistics
export const getWeeklyStatistics = async (
  userId?: string
): Promise<StatisticsData> => {
  try {
    // For demo purposes, using a default userId. In production, get from auth
    const currentUserId = userId || "demo_user";
    const dateRange = getDateRange("week");
    const transactions = await getTransactionsByDateRange(
      currentUserId,
      dateRange
    );

    const stats = calculateStatistics(transactions);

    // Generate weekly chart data (7 days)
    const chartData: ChartDataPoint[] = [];
    const startDate = new Date(dateRange.start);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayTransactions = transactions.filter((t) => {
        const transactionDate =
          t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return transactionDate.toDateString() === currentDate.toDateString();
      });

      let dayIncome = 0;
      let dayExpenses = 0;

      dayTransactions.forEach((t) => {
        const amount = Number(t.amount) || 0;
        if (t.type === "income") {
          dayIncome += amount;
        } else {
          dayExpenses += amount;
        }
      });

      chartData.push({
        period: formatDate(currentDate, "day"),
        amount: dayIncome - dayExpenses,
        income: dayIncome,
        expenses: dayExpenses,
      });
    }

    return {
      ...stats,
      transactions: transactions.slice(0, 20), // Limit to recent 20 transactions
      chartData,
      period: "week",
    };
  } catch (error) {
    console.error("Error getting weekly statistics:", error);
    throw new Error("Failed to fetch weekly statistics");
  }
};

// Monthly Statistics
export const getMonthlyStatistics = async (
  userId?: string
): Promise<StatisticsData> => {
  try {
    const currentUserId = userId || "demo_user";
    const dateRange = getDateRange("month");
    const transactions = await getTransactionsByDateRange(
      currentUserId,
      dateRange
    );

    const stats = calculateStatistics(transactions);

    // Generate monthly chart data (weeks in month)
    const chartData: ChartDataPoint[] = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    let currentWeekStart = new Date(startDate);
    let weekNumber = 1;

    while (currentWeekStart <= endDate) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      if (currentWeekEnd > endDate) {
        currentWeekEnd.setTime(endDate.getTime());
      }

      const weekTransactions = transactions.filter((t) => {
        const transactionDate =
          t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return (
          transactionDate >= currentWeekStart &&
          transactionDate <= currentWeekEnd
        );
      });

      let weekIncome = 0;
      let weekExpenses = 0;

      weekTransactions.forEach((t) => {
        const amount = Number(t.amount) || 0;
        if (t.type === "income") {
          weekIncome += amount;
        } else {
          weekExpenses += amount;
        }
      });

      chartData.push({
        period: `W${weekNumber}`,
        amount: weekIncome - weekExpenses,
        income: weekIncome,
        expenses: weekExpenses,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    return {
      ...stats,
      transactions: transactions.slice(0, 20),
      chartData,
      period: "month",
    };
  } catch (error) {
    console.error("Error getting monthly statistics:", error);
    throw new Error("Failed to fetch monthly statistics");
  }
};

// Yearly Statistics
export const getYearlyStatistics = async (
  userId?: string
): Promise<StatisticsData> => {
  try {
    const currentUserId = userId || "demo_user";
    const dateRange = getDateRange("year");
    const transactions = await getTransactionsByDateRange(
      currentUserId,
      dateRange
    );

    const stats = calculateStatistics(transactions);

    // Generate yearly chart data (12 months)
    const chartData: ChartDataPoint[] = [];
    const startDate = new Date(dateRange.start);

    for (let i = 0; i < 12; i++) {
      const currentMonth = new Date(startDate.getFullYear(), i, 1);
      const monthEnd = new Date(startDate.getFullYear(), i + 1, 0);

      const monthTransactions = transactions.filter((t) => {
        const transactionDate =
          t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return transactionDate >= currentMonth && transactionDate <= monthEnd;
      });

      let monthIncome = 0;
      let monthExpenses = 0;

      monthTransactions.forEach((t) => {
        const amount = Number(t.amount) || 0;
        if (t.type === "income") {
          monthIncome += amount;
        } else {
          monthExpenses += amount;
        }
      });

      chartData.push({
        period: formatDate(currentMonth, "month"),
        amount: monthIncome - monthExpenses,
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    return {
      ...stats,
      transactions: transactions.slice(0, 20),
      chartData,
      period: "year",
    };
  } catch (error) {
    console.error("Error getting yearly statistics:", error);
    throw new Error("Failed to fetch yearly statistics");
  }
};

// Get Category-wise Statistics
export const getCategoryStatistics = async (
  userId?: string,
  period: "week" | "month" | "year" = "month"
): Promise<{
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  totalAmount: number;
}> => {
  try {
    const currentUserId = userId || "demo_user";
    const dateRange = getDateRange(period);
    const transactions = await getTransactionsByDateRange(
      currentUserId,
      dateRange
    );

    const categoryStats: { [key: string]: { amount: number; count: number } } =
      {};
    let totalAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category || "other";
        const amount = Number(transaction.amount) || 0;

        if (!categoryStats[category]) {
          categoryStats[category] = { amount: 0, count: 0 };
        }

        categoryStats[category].amount += amount;
        categoryStats[category].count += 1;
        totalAmount += amount;
      }
    });

    const categories = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        amount: stats.amount,
        percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0,
        transactionCount: stats.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      categories,
      totalAmount,
    };
  } catch (error) {
    console.error("Error getting category statistics:", error);
    throw new Error("Failed to fetch category statistics");
  }
};

// Get Wallet-wise Statistics
export const getWalletStatistics = async (
  userId?: string
): Promise<{
  wallets: Array<{
    id: string;
    name: string;
    amount: number;
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  }>;
}> => {
  try {
    const currentUserId = userId || "demo_user";

    // Get all wallets for the user
    const walletsRef = collection(firestore, "wallets");
    const walletsQuery = query(
      walletsRef,
      where("uid", "==", currentUserId)
    );
    const walletsSnapshot = await getDocs(walletsQuery);

    const wallets = [];

    for (const walletDoc of walletsSnapshot.docs) {
      const walletData = walletDoc.data() as WalletType;

      // Get transaction count for this wallet
      const transactionsRef = collection(firestore, "transactions");
      const transactionsQuery = query(
        transactionsRef,
        where("walletId", "==", walletDoc.id),
        where("uid", "==", currentUserId)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(
        (doc) => doc.data() as TransactionType
      );

      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach((transaction) => {
        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "income") {
          totalIncome += amount;
        } else if (transaction.type === "expense") {
          totalExpenses += amount;
        }
      });

      wallets.push({
        id: walletDoc.id,
        name: walletData.name,
        amount: walletData.amount || 0,
        totalIncome,
        totalExpenses,
        transactionCount: transactions.length,
      });
    }

    return {
      wallets,
    };
  } catch (error) {
    console.error("Error fetching wallet statistics:", error);
    throw new Error("Failed to fetch wallet statistics");
  }
};
