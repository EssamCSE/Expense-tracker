import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageService";

export const updateUser = async (
  uid: string,
  updatedData: UserDataType
): Promise<ResponseType> => {
  try {

    if(updatedData.image && updatedData?.image?.uri){
      const image = await uploadFileToCloudinary(updatedData.image, "users");
      if(!image.success){
        return {
          success: false,
          msg: image.msg || "Failed to upload image",
        }
      }
      updatedData.image = image.data;
    }

    const useRef = doc(firestore, "users", uid);
    await updateDoc(useRef, updatedData);

    return { success: true, msg: "Updated Successfully" };
  } catch (error: any) {
    console.error("Error updating user: ", error);
    return {
      success: false,
      msg: error?.message,
    };
  }
};
