import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";

/**
 * Creates a new wallet or updates an existing one
 * @param walletData - Partial wallet data to create or update
 * @returns Promise<ResponseType> - Success/failure response with wallet data
 */
export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    const walletToSave = await prepareWalletData(walletData);
    const walletRef = getWalletReference(walletData.id);
    
    await setDoc(walletRef, walletToSave, { merge: true });

    return {
      success: true,
      data: {
        ...walletToSave,
        id: walletRef.id,
      },
    };
  } catch (error) {
    console.error("Error creating/updating wallet:", error);
    return { 
      success: false, 
      msg: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Deletes a wallet by ID and all associated transactions
 * @param walletId - ID of the wallet to delete
 * @returns Promise<ResponseType> - Success/failure response
 */
export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    if (!walletId?.trim()) {
      return {
        success: false,
        msg: "Wallet ID is required",
      };
    }

    // Delete all transactions associated with this wallet
    const transactionDeletionResult = await deleteWalletTransactions(walletId);
    if (!transactionDeletionResult.success) {
      return transactionDeletionResult;
    }

    // Delete the wallet itself
    const walletRef = doc(firestore, "wallets", walletId);
    await deleteDoc(walletRef);

    return {
      success: true,
      msg: `Wallet deleted successfully along with ${transactionDeletionResult.data?.deletedCount || 0} associated transactions`,
    };
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return { 
      success: false, 
      msg: error instanceof Error ? error.message : "Failed to delete wallet" 
    };
  }
};

/**
 * Prepares wallet data for saving, including image upload if needed
 * @param walletData - Raw wallet data
 * @returns Promise<Partial<WalletType>> - Processed wallet data ready for saving
 */
async function prepareWalletData(walletData: Partial<WalletType>): Promise<Partial<WalletType>> {
  const walletToSave = { ...walletData };

  // Handle image upload if present
  if (walletData.image) {
    const imageUploadResult = await uploadFileToCloudinary(walletData.image, "wallets");
    
    if (!imageUploadResult.success) {
      throw new Error(imageUploadResult.msg || "Failed to upload wallet icon");
    }
    
    walletToSave.image = imageUploadResult.data;
  }

  // Initialize default values for new wallets
  if (!walletData.id) {
    walletToSave.amount = 0;
    walletToSave.totalIncome = 0;
    walletToSave.totalExpenses = 0;
    walletToSave.created = new Date();
  }

  return walletToSave;
}

/**
 * Gets the appropriate Firestore document reference for a wallet
 * @param walletId - Optional wallet ID for existing wallets
 * @returns DocumentReference - Firestore document reference
 */
function getWalletReference(walletId?: string) {
  return walletId 
    ? doc(firestore, "wallets", walletId)
    : doc(collection(firestore, "wallets"));
}

/**
 * Deletes all transactions associated with a specific wallet
 * @param walletId - ID of the wallet whose transactions should be deleted
 * @returns Promise<ResponseType> - Success/failure response with deletion count
 */
async function deleteWalletTransactions(walletId: string): Promise<ResponseType> {
  try {
    // Query all transactions for this wallet
    const transactionsRef = collection(firestore, "transactions");
    const q = query(transactionsRef, where("walletId", "==", walletId));
    const querySnapshot = await getDocs(q);

    // Delete each transaction
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return {
      success: true,
      data: { deletedCount: querySnapshot.size },
    };
  } catch (error) {
    console.error("Error deleting wallet transactions:", error);
    return {
      success: false,
      msg: error instanceof Error ? error.message : "Failed to delete wallet transactions",
    };
  }
}