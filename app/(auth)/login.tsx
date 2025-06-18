import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/context/authContext";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(true);

  const {login: loginUser} = useAuth();

  const handleSubmit = async () =>{
    if(!emailRef.current || !passwordRef.current){
      Alert.alert("Error","Please fill all the fields")
      return;
    }
    setIsLoading(true);
    const res = await loginUser(emailRef.current, passwordRef.current)
    setIsLoading(false);
    if(!res.success){
      Alert.alert("Error",res.msg);
      return;
    }
    router.replace("/(tabs)");
  }
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      {/* <Text className='text-white'>Login</Text> */}
      <View className="mx-4 my-4">
        <View className="bg-neutral-800 self-start rounded-2xl p-2">
          <BackButton />
        </View>
      </View>

      <View className="mt-2 mx-4">
        <Typo className="font-[800px]" size={30}>
          Hey,
        </Typo>
        <Typo className="font-[800px]" size={30}>
          Welcome Back
        </Typo>
      </View>

      <View className="m-4 ">
        <Typo className=" text-neutral-500">
          Login now to track all your expenses
        </Typo>

        {/* InputS */}

        {/* email input */}
        <Input
          placeholder="Enter your Email"
          onChangeText={(value) => (emailRef.current = value)}
          icon={<Icons.At size={22} color="white" weight="fill" />}
        />
        {/* Password input */}
        <Input
          placeholder="Enter your Password"
          secureTextEntry
          onChangeText={(value) => (passwordRef.current = value)}
          icon={<Icons.Lock size={22} color="white" weight="fill" />}
        />
      </View>
      <View className="flex justify-end items-end mx-4">
        <Typo>Forget Password?</Typo>
      </View>
      <View className="flex items-center justify-center">
        <View className="mt-5 w-[90%] mb-5">
          <Button
          onPress={handleSubmit}
            loading={isLoading}
            className="bg-white w-full h-[60px] rounded-full "
          >
            <Text className="text-xl font-bold">Login</Text>
          </Button>
        </View>

        {/* SignUp */}
        <View className="flex flex-row justify-center items-center gap-2">
          <Text className="text-neutral-500 ">
            Don't have an account?
          </Text>
          <Pressable onPress={()=>router.navigate('/(auth)/register')}>
            <Text className="text-primary font-bold text-sm">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
