import { useAuth } from "@/context/authContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";

const index = () => {

  return (
    <View className="flex-1 justify-center items-center bg-neutral900">
      <Image
        className="h-[20%] aspect-square"
        resizeMode="contain"
        source={require("../assets/images/splashImage.png")}
      />
    </View>
  );
};

export default index;
