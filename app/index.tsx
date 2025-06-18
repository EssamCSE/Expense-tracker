import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

const index = () => {
  const router = useRouter();
  // useEffect(()=>{
  //   setTimeout(()=>{
  //     router.replace("/welcome")
  //     // router.replace("/(auth)/login")
  //   },2000)
  // },[])


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
