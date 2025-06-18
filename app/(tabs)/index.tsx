import Button from "@/components/Button";
import { auth } from "@/config/firebase";
import { useAuth } from "@/context/authContext";
import { signOut } from "firebase/auth";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { user } = useAuth();
  const handleLogout = async () => {
    await signOut(auth);
  };
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <Button onPress={handleLogout}>
        <Text className="text-black font-bold">Logout</Text>
      </Button>
    </SafeAreaView>
  );
};

export default Home;
