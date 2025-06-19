import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string
): Promise<ResponseType> => {
  try {
    if (typeof file == "string") {
      return {
        success: true,
        data: file,
      };
    }
    const formData = new FormData();
    formData.append("file", {
      name: file?.uri?.split("/")?.pop() || "image.jpg",
      type: "image/jpeg",
      uri: file?.uri,
    } as any);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folderName);
    const response = await fetch(CLOUDINARY_API_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = await response.json();
    // console.log(data);
    return {
      success: true,
      data: data.secure_url,
    };
  } catch (error: any) {
    console.log("Got error uploading file: ", error);
    return {
      success: false,
      msg: error.message || "Cloud not upload file",
    };
  }
};

export const getProfileImage = (file: any) => {
  if (file && typeof file == "string") return file;
  if (file && typeof file == "object") return file.uri;

  return require("../assets/images/defaultAvatar.png");
};
