import { expenseCategories } from "@/constants/data";
import { TransactionItemProps } from "@/types";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const TransactionItem = ({
  item,
  index,
  handleClick,
}: TransactionItemProps) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  // Get category (fallback to utilities if not found)
  const category = item?.category
    ? expenseCategories[item.category]
    : expenseCategories["utilities"];
  const IconComponent = category?.icon || Icons.Wallet;

  // Entrance animation with staggered delay
  useEffect(() => {
    const delay = index * 100; // Stagger animation based on index

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [index]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPress = () => {
    handleClick?.(item, index);
  };

  

  // Format amount with proper currency and color - Fixed expense logic
  const formatAmount = (amount:number) => {
    const numAmount = Number(amount) || 0;
    const isExpense = numAmount < 0 || item?.type?.toLowerCase() === "expense";
    const absAmount = Math.abs(numAmount);

    const formattedAmount = absAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

    return {
      text: isExpense ? `-${formattedAmount}` : `+${formattedAmount}`,
      color: isExpense ? "#ef4444" : "#22c55e", // Red for expenses, green for income
    };
  };

  const formatDate = (input: any): string => {
    if (!input) return "Invalid Date";
  
    let date: Date;
  
    if (input instanceof Date) {
      date = input;
    } else if (typeof input === "string" || typeof input === "number") {
      date = new Date(input);
    } else if (input?.toDate instanceof Function) {
      date = input.toDate(); 
    } else {
      return "Invalid Date";
    }
  
    if (isNaN(date.getTime())) return "Invalid Date";
  
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  const amountInfo = formatAmount(item?.amount);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
        activeOpacity={1}
      >
        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          {/* Icon Container */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: category?.bgColor || "#3b82f6",
                transform: [{ rotate: iconRotation }],
              },
            ]}
          >
            <IconComponent size={16} color="white" weight="bold" />
          </Animated.View>

          {/* Transaction Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.leftSection}>
              <Text style={styles.categoryLabel}>
                {category?.label || "Entertainment"}
              </Text>
              {item?.description && (
                <Text style={styles.description}>
                  {item?.description}
                </Text>
              )}
              {/* Transaction Type Badge */}
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: category?.bgColor || "#3b82f6" },
                ]}
              >
                <Text style={styles.typeText}>{item?.type || "Expense"}</Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text style={[styles.amount, { color: amountInfo.color }]}>
                {amountInfo.text}
              </Text>
              <Text style={styles.date}>{formatDate(item?.date)}</Text>

              {/* Status Indicator */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        item?.type?.toLowerCase() === "expense"
                          ? "#ef4444"
                          : "#22c55e",
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {item?.type?.toLowerCase() === "expense"
                    ? "Expense"
                    : "Income"}
                </Text>
              </View>
            </View>
          </View>

          {/* Chevron Icon */}
          <View style={styles.chevronContainer}>
            <Icons.CaretRight size={12} color="#666" weight="bold" />
          </View>
        </View>

        {/* Bottom Border with Gradient Effect */}
        <View style={styles.bottomBorder} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16, 
    marginVertical: 4, 
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  touchable: {
    backgroundColor: "transparent",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    minHeight: 70, 
  },
  iconContainer: {
    width: 40, 
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
    marginRight: 16, 
  },
  categoryLabel: {
    color: "white",
    fontSize: 15, // Slightly larger
    fontWeight: "600",
    marginBottom: 3, // Increased margin
    letterSpacing: 0.1,
  },
  description: {
    color: "#888",
    fontSize: 13, // Slightly larger
    fontWeight: "400",
    marginBottom: 6, // Increased margin
    lineHeight: 18,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8, // Increased padding
    paddingVertical: 2,
    borderRadius: 6,
    opacity: 0.8,
  },
  typeText: {
    color: "white",
    fontSize: 9, // Slightly larger
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  rightSection: {
    alignItems: "flex-end",
    minWidth: 80, // Increased minimum width
  },
  amount: {
    fontSize: 15, // Slightly larger
    fontWeight: "700",
    marginBottom: 3, // Increased margin
    letterSpacing: 0.2,
  },
  date: {
    color: "#666",
    fontSize: 11, // Slightly larger
    fontWeight: "500",
    marginBottom: 5, // Increased margin
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 5, // Slightly larger dot
    height: 5,
    borderRadius: 2.5,
    marginRight: 4, // Increased margin
  },
  statusText: {
    color: "#666",
    fontSize: 9, // Slightly larger
    fontWeight: "500",
    textTransform: "uppercase",
  },
  chevronContainer: {
    marginLeft: 8, // Increased margin
    opacity: 0.6,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginHorizontal: 20, // Increased horizontal margin
    opacity: 0.3,
  },
});

export default TransactionItem;
