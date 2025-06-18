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

const Register = () => {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const formRefs = useRef({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    if (
      !formRefs.current.email ||
      !formRefs.current.password ||
      !formRefs.current.name
    ) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    setIsLoading(true);
    const { email, password, name } = formRefs.current;
    const res = await registerUser(email, password, name);
    if (res.success) {
      setIsLoading(false);
      router.replace("/(auth)/login");
    }
    if(res.msg === 'Email already in use'){
      Alert.alert("Error", res.msg);
      return;
    }
    if(res.msg === 'Password is weak'){
      Alert.alert("Error", res.msg);
      return;
    }
    if(res.msg === 'Invalid Email'){
      Alert.alert("Error", res.msg);
      return;
    }
  };
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
          Lets
        </Typo>
        <Typo className="font-[800px]" size={30}>
          Get Started
        </Typo>
      </View>

      <View className="m-4 ">
        <Typo className=" text-neutral-500">
          Create an account to track your expenses
        </Typo>

        {/* InputS */}

        {/* name input */}
        <Input
          placeholder="Enter your Email"
          onChangeText={(value) => (formRefs.current.name = value)}
          icon={<Icons.User size={22} color="white" weight="fill" />}
        />
        {/* email input */}
        <Input
          placeholder="Enter your Email"
          onChangeText={(value) => (formRefs.current.email = value)}
          icon={<Icons.At size={22} color="white" weight="fill" />}
        />
        {/* Password input */}
        <Input
          placeholder="Enter your Password"
          secureTextEntry
          onChangeText={(value) => (formRefs.current.password = value)}
          icon={<Icons.Lock size={22} color="white" weight="fill" />}
        />
      </View>

      <View className="flex items-center justify-center">
        <View className="mt-5 w-[90%] mb-5">
          <Button
            onPress={handleSubmit}
            loading={isLoading}
            className="bg-white w-full h-[60px] rounded-full "
          >
            <Text className="text-xl font-bold">Sign Up </Text>
          </Button>
        </View>

        {/* SignUp */}
        <View className="flex flex-row justify-center items-center gap-2">
          <Text className="text-neutral-500 ">Already have an account?</Text>
          <Pressable onPress={() => router.navigate("/(auth)/login")}>
            <Text className="text-primary font-bold text-sm">Login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Register;
