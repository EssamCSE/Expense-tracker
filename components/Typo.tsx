import { verticalScale } from "@/utils/styling";
import React from "react";
import { Text, TextStyle } from "react-native";

const Typo = ({
  className,
  children,
  size,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  size?: number;
  style?: TextStyle;
}) => {
  const textStyle: TextStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
  };
  return (
    <Text style={[textStyle, props.style]} className={`text-white font-normal ${className}`}>
      {children}
    </Text>
  );
};

export default Typo;
