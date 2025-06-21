import { WalletType } from "@/types";
import { Image } from "expo-image";
import { Router } from "expo-router";
import * as Icons from "phosphor-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
const WalletListItem = ({
  item,
  index,
  router,
}: {
  item: WalletType;
  index: number;
  router: Router;
}) => {
  const openWallet = () =>{
    router.push({
        pathname: '/(modals)/walletModal',
        params:{
            id: item?.id,
            name: item?.name,
            amount: item?.amount,
            image: item?.image,
        }
    })
  }
  return (
    <View>
      <TouchableOpacity onPress={openWallet}>
        <View className="flex-row justify-between items-center pt-2 rounded-lg">
          <View className="flex-row">
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </View>
          <View className=" items-start">

              <Text className="text-neutral-100 mt-2 text-center">
                {item?.name}
              </Text>
              <Text className="text-neutral-400 text-center" style={styles.walletAmount}>
                ${item?.amount}
              </Text>
          </View>
            </View>
         

          <Icons.CaretRight size={24} weight="bold" color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default WalletListItem;
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
});