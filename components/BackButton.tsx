import { useNavigation, useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
const BackButton = ({iconSize = 26}:{iconSize?: string | number}) => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()}>
      <CaretLeft
        size={iconSize}
        color="white"
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default BackButton;
