import { useAuth } from "@/context/authContext";
import UseFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const HomeCard = () => {
  const {user} = useAuth();
  // Animation values
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const balanceTranslateY = useSharedValue(20);
  const balanceOpacity = useSharedValue(0);
  const incomeTranslateX = useSharedValue(-30);
  const incomeOpacity = useSharedValue(0);
  const expenseTranslateX = useSharedValue(30);
  const expenseOpacity = useSharedValue(0);
  const amountScale = useSharedValue(0.8);
  const amountOpacity = useSharedValue(0);

  useEffect(() => {
    // Card entrance animation
    cardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
    cardOpacity.value = withTiming(1, { duration: 400 });

    // Staggered content animations
    balanceTranslateY.value = withDelay(
      200,
      withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      })
    );
    balanceOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));

    // Income and expense slide in from sides
    incomeTranslateX.value = withDelay(
      400,
      withSpring(0, {
        damping: 10,
        stiffness: 80,
      })
    );
    incomeOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));

    expenseTranslateX.value = withDelay(
      500,
      withSpring(0, {
        damping: 10,
        stiffness: 80,
      })
    );
    expenseOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));

    // Amount values animate last
    amountScale.value = withDelay(
      600,
      withSpring(1, {
        damping: 8,
        stiffness: 100,
      })
    );
    amountOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, []);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const balanceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: balanceTranslateY.value }],
    opacity: balanceOpacity.value,
  }));

  const incomeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: incomeTranslateX.value }],
    opacity: incomeOpacity.value,
  }));

  const expenseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: expenseTranslateX.value }],
    opacity: expenseOpacity.value,
  }));

  const amountAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: amountScale.value }],
    opacity: amountOpacity.value,
  }));

  const {
    data: wallets,
    error,
    loading: walletLoading,
  } = UseFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const getTotals = ()=>{
  return  wallets.reduce((totals:any, item: WalletType)=>{
     totals.balance += Number(item.amount);
     totals.income += Number(item.totalIncome);
     totals.expenses += Number(item.totalExpenses);
      return totals;
    },{
      balance: 0,
      income: 0,
      expenses: 0,
    })
  }
  return (
    <AnimatedImageBackground
      source={require("../assets/images/card.png")}
      resizeMode="stretch"
      style={[
        {
          width: 330,
          height: 200,
          borderRadius: 10,
          marginHorizontal: "auto",
          alignSelf: "center",
          marginVertical: 5,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        cardAnimatedStyle,
      ]}
    >
      {/* Card Content */}
      <View style={{ flex: 1, width: "100%", padding: 24 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Animated.Text
            style={[
              {
                color: "black",
                fontSize: 16,
                fontWeight: "bold",
              },
              balanceAnimatedStyle,
            ]}
          >
            Total Balance
          </Animated.Text>
          <AnimatedTouchableOpacity
            style={balanceAnimatedStyle}
            activeOpacity={0.7}
          >
            <Icons.DotsThreeOutline size={23} color="black" weight="bold" />
          </AnimatedTouchableOpacity>
        </View>

        {/* Balance Amount */}
        <Animated.View style={[{ marginTop: 8 }, balanceAnimatedStyle]}>
          <Text
            style={{
              color: "black",
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            $ {walletLoading ? "..." : getTotals().balance?.toFixed(2)}
          </Text>
        </Animated.View>

        {/* Income and Expense Indicators */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            gap: 8,
          }}
        >
          {/* Income */}
          <Animated.View
            style={[
              { flexDirection: "row", gap: 8, alignItems: "center" },
              incomeAnimatedStyle,
            ]}
          >
            <View
              style={{
                backgroundColor: "#e5e5e5",
                padding: 2,
                borderRadius: 12,
              }}
            >
              <Icons.ArrowDown size={18} color="#22c55e" weight="bold" />
            </View>
            <Text
              style={{
                color: "black",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Income
            </Text>
          </Animated.View>

          {/* Expense */}
          <Animated.View
            style={[
              { flexDirection: "row", gap: 8, alignItems: "center" },
              expenseAnimatedStyle,
            ]}
          >
            <View
              style={{
                backgroundColor: "#e5e5e5",
                padding: 2,
                borderRadius: 12,
              }}
            >
              <Icons.ArrowUp size={18} color="#ef4444" weight="bold" />
            </View>
            <Text
              style={{
                color: "black",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Expenses
            </Text>
          </Animated.View>
        </View>

        {/* Amount Values */}
        <Animated.View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
              marginHorizontal: 8,
            },
            amountAnimatedStyle,
          ]}
        >
          <Text
            style={{
              color: "#22c55e",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            $ {walletLoading ? "..." :getTotals().income?.toFixed(2)}
          </Text>
          <Text
            style={{
              color: "#ef4444",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            $ {walletLoading ? "..." :getTotals().expenses?.toFixed(2)}
          </Text>
        </Animated.View>
      </View>
    </AnimatedImageBackground>
  );
};

export default HomeCard;
