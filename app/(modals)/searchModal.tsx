import { useRouter } from "expo-router";
import { Timestamp, orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Animated, {
  SlideInLeft,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Import components
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import TransactionList from "@/components/TransactionList";
import { expenseCategories, transactionTypes } from "@/constants/data";
import { useAuth } from "@/context/authContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import UseFetchData from "@/hooks/useFetchData";
import { TransactionType } from "@/types";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const { width, height } = Dimensions.get("window");

const SearchModal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [refreshing, setRefreshing] = useState(false);

  // Animation shared values
  const headerTranslateY = useSharedValue(-100);
  const headerOpacity = useSharedValue(0);
  const backgroundScale = useSharedValue(0.8);
  const backgroundOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const formFieldsOpacity = useSharedValue(0);
  const formFieldsTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0.8);
  const buttonOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const particleFloat = useSharedValue(0);

  // Fetch all transactions for the user
  const {
    data: allTransactions = [],
    loading: transactionLoading,
    refetch,
  } = UseFetchData<TransactionType>("transactions", [
    where("uid", "==", user?.uid || ""),
    orderBy("date", "desc"),
  ]);

  // Custom alert hook
  const { alertState, hideAlert, showError, showSuccess } = useCustomAlert();

  // Filter transactions based on search criteria
  const filteredTransactions = useMemo(() => {
    if (!allTransactions?.length) return [];

    let filtered = [...allTransactions];

    // Text search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.category?.toLowerCase().includes(searchLower) ||
          transaction.amount?.toString().includes(search)
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(
        (transaction) => transaction.type === selectedType
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (transaction) => transaction.category === selectedCategory
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((transaction) => {
        if (!transaction.date) return false;

        const transactionDate =
          transaction.date instanceof Timestamp
            ? transaction.date.toDate()
            : new Date(transaction.date);
        if (isNaN(transactionDate.getTime())) return false;

        switch (dateFilter) {
          case "today":
            return transactionDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case "month":
            const monthAgo = new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              today.getDate()
            );
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Amount range filter
    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter((transaction) => {
        const amount = Number(transaction.amount);
        if (isNaN(amount)) return false;

        const min = amountRange.min ? Number(amountRange.min) : 0;
        const max = amountRange.max ? Number(amountRange.max) : Infinity;
        return amount >= min && amount <= max;
      });
    }

    return filtered;
  }, [
    allTransactions,
    search,
    selectedType,
    selectedCategory,
    dateFilter,
    amountRange,
  ]);

  // Initialize animations
  useEffect(() => {
    const startAnimations = () => {
      // Background entrance
      backgroundScale.value = withSpring(1, { damping: 12 });
      backgroundOpacity.value = withTiming(1, { duration: 800 });

      // Header animation
      headerTranslateY.value = withSpring(0, { damping: 10 });
      headerOpacity.value = withTiming(1, { duration: 600 });

      // Card entrance with delay
      setTimeout(() => {
        cardScale.value = withSpring(1, { damping: 8 });
        cardOpacity.value = withTiming(1, { duration: 700 });
        cardTranslateY.value = withSpring(0, { damping: 10 });
      }, 200);

      // Form fields staggered entrance
      setTimeout(() => {
        formFieldsOpacity.value = withTiming(1, { duration: 800 });
        formFieldsTranslateY.value = withSpring(0, { damping: 10 });
      }, 400);

      // Button entrance
      setTimeout(() => {
        buttonScale.value = withSpring(1, { damping: 8 });
        buttonOpacity.value = withTiming(1, { duration: 600 });
      }, 600);

      // Continuous animations
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 2000 }),
          withTiming(0.7, { duration: 2000 })
        ),
        -1,
        false
      );

      particleFloat.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000 }),
          withTiming(0, { duration: 3000 })
        ),
        -1,
        false
      );
    };

    startAnimations();
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedType("");
    setSelectedCategory("");
    setDateFilter("all");
    setAmountRange({ min: "", max: "" });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      showError?.("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, [refetch, showError]);

  // Handle amount range changes
  const handleAmountRangeChange = useCallback(
    (field: "min" | "max", value: string) => {
      // Only allow numbers and decimal points
      const sanitizedValue = value.replace(/[^0-9.]/g, "");
      setAmountRange((prev) => ({ ...prev, [field]: sanitizedValue }));
    },
    []
  );

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: headerOpacity.value,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
    opacity: backgroundOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
    opacity: cardOpacity.value,
  }));

  const formFieldsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formFieldsOpacity.value,
    transform: [{ translateY: formFieldsTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0.3, 0.7], [0.1, 0.3]),
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particleFloat.value, [0, 1], [0, -15]) },
    ],
    opacity: interpolate(particleFloat.value, [0, 1], [0.4, 0.8]),
  }));

  // Data for dropdowns
  const dateFilterOptions = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "week" },
    { label: "Last 30 Days", value: "month" },
  ];

  const typeOptions = [
    { label: "All Types", value: "" },
    ...(transactionTypes || []),
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...(Object.values(expenseCategories || {}) || []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <Animated.View
        style={[styles.backgroundGradient, backgroundAnimatedStyle]}
      />

      {/* Ambient Glow */}
      <Animated.View style={[styles.ambientGlow, glowAnimatedStyle]} />

      {/* Floating Particles */}
      <Animated.View style={[styles.particle1, particleAnimatedStyle]} />
      <Animated.View style={[styles.particle2, particleAnimatedStyle]} />
      <Animated.View style={[styles.particle3, particleAnimatedStyle]} />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <BackButton />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search Transactions</Text>
          <Text style={styles.headerSubtitle}>
            Find and filter your transactions
          </Text>
        </View>
        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
          <Icons.X size={20} color="#10B981" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Search Filters Card */}
        <Animated.View style={[styles.formCard, cardAnimatedStyle]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Icons.MagnifyingGlass size={24} color="#10B981" weight="fill" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Search Filters</Text>
              <Text style={styles.cardSubtitle}>Narrow down your results</Text>
            </View>
          </View>

          {/* Form Fields */}
          <Animated.View style={formFieldsAnimatedStyle}>
            {/* Search Input */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInLeft.duration(600).delay(100)}
            >
              <Text style={styles.inputLabel}>Search Keywords</Text>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search description, category, amount..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                icon={
                  <Icons.MagnifyingGlass
                    size={20}
                    color="#10B981"
                    weight="fill"
                  />
                }
              />
            </Animated.View>

            {/* Transaction Type Filter */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInLeft.duration(600).delay(200)}
            >
              <Text style={styles.inputLabel}>Transaction Type</Text>
              <View style={styles.dropdownContainer}>
                <Icons.ArrowsLeftRight
                  size={16}
                  color="#10B981"
                  weight="bold"
                  style={styles.dropdownIcon}
                />
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.dropdownContainerStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="rgba(16, 185, 129, 0.1)"
                  data={typeOptions}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select type"
                  value={selectedType}
                  onChange={(item) => setSelectedType(item.value)}
                />
              </View>
            </Animated.View>

            {/* Category Filter */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInLeft.duration(600).delay(300)}
            >
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.dropdownContainer}>
                <Icons.Tag
                  size={16}
                  color="#10B981"
                  weight="bold"
                  style={styles.dropdownIcon}
                />
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.dropdownContainerStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="rgba(16, 185, 129, 0.1)"
                  data={categoryOptions}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select category"
                  value={selectedCategory}
                  onChange={(item) => setSelectedCategory(item.value)}
                />
              </View>
            </Animated.View>

            {/* Date Filter */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInLeft.duration(600).delay(400)}
            >
              <Text style={styles.inputLabel}>Date Range</Text>
              <View style={styles.dropdownContainer}>
                <Icons.Calendar
                  size={16}
                  color="#10B981"
                  weight="bold"
                  style={styles.dropdownIcon}
                />
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.dropdownContainerStyle}
                  itemContainerStyle={styles.itemContainerStyle}
                  itemTextStyle={styles.itemTextStyle}
                  activeColor="rgba(16, 185, 129, 0.1)"
                  data={dateFilterOptions}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select date range"
                  value={dateFilter}
                  onChange={(item) => setDateFilter(item.value)}
                />
              </View>
            </Animated.View>

            {/* Amount Range */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInLeft.duration(600).delay(500)}
            >
              <Text style={styles.inputLabel}>Amount Range</Text>
              <View style={styles.amountRangeContainer}>
                <View style={styles.amountInputContainer}>
                  <Icons.CurrencyDollar size={16} color="#10B981" />
                  <TextInput
                    style={styles.amountInput}
                    value={amountRange.min}
                    onChangeText={(value) =>
                      handleAmountRangeChange("min", value)
                    }
                    placeholder="Min"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.rangeSeparator}>to</Text>
                <View style={styles.amountInputContainer}>
                  <Icons.CurrencyDollar size={16} color="#10B981" />
                  <TextInput
                    style={styles.amountInput}
                    value={amountRange.max}
                    onChangeText={(value) =>
                      handleAmountRangeChange("max", value)
                    }
                    placeholder="Max"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Animated.View>

            {/* Results Summary */}
            <Animated.View
              style={styles.resultsSummary}
              entering={SlideInLeft.duration(600).delay(600)}
            >
              <Icons.ListNumbers size={20} color="#10B981" />
              <Text style={styles.resultsText}>
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? "s" : ""} found
              </Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        {/* Transaction Results */}
        <Animated.View
          style={[styles.resultsContainer, formFieldsAnimatedStyle]}
        >
          <TransactionList
            loading={transactionLoading}
            data={filteredTransactions}
            emptyListMessage="No transactions match your search criteria"
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0F172A",
  },
  ambientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  particle1: {
    position: "absolute",
    top: height * 0.15,
    left: width * 0.1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  particle2: {
    position: "absolute",
    top: height * 0.3,
    right: width * 0.15,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
  },
  particle3: {
    position: "absolute",
    bottom: height * 0.25,
    left: width * 0.2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#8B5CF6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    marginLeft: -40,
  },
  clearButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownContainer: {
    backgroundColor: "rgba(51, 65, 85, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdown: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  dropdownContainerStyle: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    marginTop: 4,
  },
  itemContainerStyle: {
    backgroundColor: "transparent",
  },
  itemTextStyle: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  amountRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51, 65, 85, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  amountInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 8,
  },
  rangeSeparator: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  resultsSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    marginTop: 8,
  },
  resultsText: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
});

export default SearchModal;
