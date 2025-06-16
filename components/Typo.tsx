import { verticalScale } from "@/utils/styling";
import React from "react";
import { Text, TextStyle } from "react-native";

const Typo = ({
  className,
  children,
  size,
  ...props
}: { className?: string } & any) => {
  const textStyle: TextStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
  };
  return (
    <Text style={textStyle} {...props} className={`text-white font-normal ${className}`}>
      {children}
    </Text>
  );
};

export default Typo;
