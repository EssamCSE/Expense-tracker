import Loading from "@/components/Loading";
import WalletListItem from "@/components/WalletListItem";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import UseFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: wallets,
    error,
    loading,
  } = UseFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);
  const walletNumber = wallets.length;
  const getTotalBalance = () =>{
    return wallets.reduce((total, item)=>{
      total = total + (item.amount || 0);
      return total;
    },0)
  }
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <View className="flex justify-center items-center mt-10 gap-1">
          <Text className="text-neutral-100 font-bold text-4xl">${getTotalBalance()?.toFixed(2)}</Text>
          <Text className="text-neutral-500 text-sm">Total Balance</Text>
        </View>

        <View className="bg-neutral-900 h-screen-safe rounded-[30px] mx-1 mt-10 p-6 shadow-lg">
          <View className="flex flex-row justify-between items-center">
            <Text className="text-neutral-100 font-bold text-xl tracking-wide">
              My Wallets
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/walletModal")}
            >
              <Icons.PlusCircle
                weight="fill"
                color={colors.primary}
                size={30}
              />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-500 text-sm">
            You have {walletNumber} wallets in total
          </Text>
          

          <View className="flex-1">
          {loading && <Loading />}
          {!loading && wallets.length > 0 && (
            <FlatList
            data={wallets}
            renderItem={({ item, index }) => (
            <WalletListItem  item={item} index={index} router={router}/>
            )}
            keyExtractor={(item) => item.id as string}
          />
          
          )}
          {!loading && wallets.length === 4 && (
            <Text className="text-neutral-500 text-center mt-4">
              No wallets found
            </Text>
          )}
        </View>

        </View>  
      </View>
    </SafeAreaView>
  );
};

export default Wallet;
