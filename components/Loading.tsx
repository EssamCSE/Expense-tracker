import React from "react";
import { ActivityIndicator, View } from "react-native";

const Loading = ({
  className,
  size,
  color,
}: {
  className?: string;
  size?: number;
  color?: string;
}) => {
  return (
    <View className={`flex-1 justify-center items-center ${className}`}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default Loading;
