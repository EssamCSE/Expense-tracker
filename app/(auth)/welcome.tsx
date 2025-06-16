import Button from "@/components/Button";
import Typo from "@/components/Typo";
import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
const Welcome = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <StatusBar barStyle="light-content" />
      {/* Sign in Button */}
      <View className="flex-1">
        <View className="flex flex-row justify-end items-end m-5 ">
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Typo className="font-medium text-white">Sign in</Typo>
          </TouchableOpacity>
        </View>

        {/* WELCOME IrMAGE */}
        <View className="flex items-center justify-center mt-10">
          <Animated.Image
            entering={FadeIn.duration(500)}
            source={require("../../assets/images/welcome.png")}
            resizeMode="contain"
          />
        </View>

        {/* Footer */}

        <View
          className="absolute bottom-0 w-full bg-neutral900 items-center pt-[20px] space-y-[20px]"
          style={{
            shadowColor: "#fff",
            shadowOffset: { width: 0, height: -6 },
            shadowRadius: 25,
            shadowOpacity: 0.35,
            elevation: 50,
          }}
        >
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            className="flex items-center mb-5"
          >
            <Typo className="text-white font-extrabold" size={30}>
              Always take control
            </Typo>
            <Typo className="text-white font-extrabold" size={30}>
              of your finances
            </Typo>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            className="flex flex-center items-center"
          >
            <Typo className="font-normal text-neutral-400" size={17}>
              Finances must be arranged to set a better
            </Typo>
            <Typo className="font-normal text-neutral-400" size={17}>
              lifestyle in future
            </Typo>
          </Animated.View>

          {/* Button */}
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            className="mt-5 w-[80%] mb-5"
          >
            <Button onPress={() => router.push('/(auth)/register')} className="bg-white w-full h-[60px] rounded-full ">
              <Typo className="font-bold text-neutral-900" size={22}>
                Get Started
              </Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
