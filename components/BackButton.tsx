import { useNavigation } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
        <CaretLeft
            size={30}
            color="white"
            weight="bold"
        />
    </TouchableOpacity>
  );
};

export default BackButton;
