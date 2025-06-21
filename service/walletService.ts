import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    let walletToSave = { ...walletData };
    if (walletData.image) {
      const image = await uploadFileToCloudinary(walletData.image, "wallets");
      if (!image.success) {
        return {
          success: false,
          msg: image.msg || "Failed to upload wallet icon",
        };
      }
      walletToSave.image = image.data;
    }

    if (!walletData?.id) {
      // New Wallet
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.created = new Date();
    }

    const walletRef = walletData?.id
      ? doc(firestore, "wallets", walletData?.id)
      : doc(collection(firestore, "wallets"));

    await setDoc(walletRef, walletToSave, { merge: true }); // update only the data that is passed

    return {
      success: true,
      data: {
        ...walletToSave,
        id: walletRef.id,
      },
    };
  } catch (error: any) {
    console.error("Error creating/updating wallet:", error);
    return { success: false, msg: error.message };
  }
};

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    await deleteDoc(walletRef);

    // TODO: Delete all transaction related to this Wallet

    return {
      success: true,
      msg: "Wallet deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting wallet:", error);
    return { success: false, msg: error.message };
  }
};
