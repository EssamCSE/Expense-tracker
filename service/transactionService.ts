import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";


export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;

    // Validate required fields
    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data: amount, walletId, and type are required" };
    }

    if (!["income", "expense"].includes(type)) {
      return { success: false, msg: "Transaction type must be 'income' or 'expense'" };
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
      msg: error.message || "An unexpected error occurred while processing the transaction" 
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
    const imageUploadResult = await uploadFileToCloudinary(image, "transactions");
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
    data: { id: transactionRef.id }
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
      msg: error.message || "Failed to delete transaction" 
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