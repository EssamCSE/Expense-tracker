import { StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <View className="flex flex-row items-center justify-center pt-10 ">
        <Text className="font-bold bg-blue-500 p-10 rounded-lg">Hello</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
