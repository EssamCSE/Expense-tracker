import { CustomButtonProps } from "@/types";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const Button = ({
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  if (loading) {
    <View
      className={`bg-primary rounded-[17px] h-[52px] justify-center items-center bg-transparent`}
    >
      {/* Loading */}
    </View>;
  }
  return (
    <TouchableOpacity
      className="bg-primary rounded-[17px] h-[52px] justify-center items-center "
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;
