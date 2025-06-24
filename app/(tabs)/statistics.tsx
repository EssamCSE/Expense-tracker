import TransactionList from "@/components/TransactionList";
import { colors } from "@/constants/theme";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Animated, {
  FadeIn,
  SlideInDown,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  StatisticsData,
  getMonthlyStatistics,
  getWeeklyStatistics,
  getYearlyStatistics,
} from "@/service/transactionService";
import { TransactionType } from "@/types";
import { useAuth } from "@/context/authContext";

const { width } = Dimensions.get("window");

interface ChartDataPoint {
  value: number;
  label: string;
  frontColor: string;
  labelTextStyle?: object;
}

const Statistics = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null
  );
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const {user} = useAuth();

  // Animation values - reduced initial delays and durations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  const scaleAnim = useSharedValue(0.9);
  const chartAnim = useSharedValue(0);

  useEffect(() => {
    // Faster initial animation
    fadeAnim.value = withTiming(1, { duration: 300 });
    slideAnim.value = withTiming(0, { duration: 250 });
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 200 });
    chartAnim.value = withDelay(150, withTiming(1, { duration: 400 }));
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [selectedIndex]);

  const loadStatistics = async () => {
    if(!user?.uid) return;
    setChartLoading(true);
    try {
      let data: StatisticsData;

      switch (selectedIndex) {
        case 0:
          data = await getWeeklyStatistics(user?.uid);
          break;
        case 1:
          data = await getMonthlyStatistics(user?.uid);
          break;
        case 2:
          data = await getYearlyStatistics(user?.uid);
          break;
        default:
          data = await getWeeklyStatistics(user?.uid);
      }


      setStatisticsData(data);
      setTransactions(data.transactions || []);
      setTotalIncome(data.totalIncome || 0);
      setTotalExpenses(data.totalExpenses || 0);
      setNetAmount(data.netAmount || 0);

      // Format chart data with better error handling
      const formattedChartData = (data.chartData || []).map((item, index) => {
        const amount = Number(item.amount) || 0;
        return {
          value: Math.abs(amount) || 1, // Minimum value of 1 to show something
          label: item.period || `P${index + 1}`,
          frontColor: amount >= 0 ? colors.green : colors.rose,
          labelTextStyle: { 
            color: colors.neutral300, 
            fontSize: 10,
            fontWeight: '500' as const
          },
        };
      });

      setChartData(formattedChartData);
    } catch (error) {
      console.error("Failed to load statistics:", error);
      // Set empty data on error
      setStatisticsData(null);
      setTransactions([]);
      setTotalIncome(0);
      setTotalExpenses(0);
      setNetAmount(0);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handleSegmentChange = (event: any) => {
    const newIndex = event.nativeEvent.selectedSegmentIndex;
    setSelectedIndex(newIndex);

    // Faster chart animation
    chartAnim.value = withTiming(0, { duration: 150 }, () => {
      chartAnim.value = withTiming(1, { duration: 250 });
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getPeriodLabel = () => {
    switch (selectedIndex) {
      case 0:
        return "This Week";
      case 1:
        return "This Month";
      case 2:
        return "This Year";
      default:
        return "This Week";
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartAnim.value,
    transform: [{ scale: 0.95 + 0.05 * chartAnim.value }],
  }));

  const StatCard = ({
    title,
    amount,
    icon,
    color,
    delay = 0,
  }: {
    title: string;
    amount: number;
    icon: React.ReactNode;
    color: string;
    delay?: number;
  }) => (
    <Animated.View
      entering={SlideInUp.delay(delay).duration(300).springify()}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statAmount, { color }]}>
        {formatCurrency(amount)}
      </Text>
    </Animated.View>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, containerAnimatedStyle]}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>{getPeriodLabel()}</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Control */}
        <Animated.View
          entering={FadeIn.delay(100).duration(300)}
          style={styles.segmentedControlContainer}
        >
          <SegmentedControl
            values={["Weekly", "Monthly", "Yearly"]}
            selectedIndex={selectedIndex}
            onChange={handleSegmentChange}
            tintColor={colors.primary}
            backgroundColor={colors.neutral800}
            appearance="dark"
            activeFontStyle={{ color: colors.neutral900, fontWeight: "600" }}
            fontStyle={{ color: colors.neutral300, fontWeight: "500" }}
            style={styles.segmentedControl}
          />
        </Animated.View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Income"
            amount={totalIncome}
            icon={
              <Icons.TrendUp size={20} color={colors.green} weight="bold" />
            }
            color={colors.green}
            delay={150}
          />
          <StatCard
            title="Total Expenses"
            amount={totalExpenses}
            icon={
              <Icons.TrendDown size={20} color={colors.rose} weight="bold" />
            }
            color={colors.rose}
            delay={200}
          />
          <StatCard
            title="Net Amount"
            amount={netAmount}
            icon={
              <Icons.Wallet
                size={20}
                color={netAmount >= 0 ? colors.green : colors.rose}
                weight="bold"
              />
            }
            color={netAmount >= 0 ? colors.green : colors.rose}
            delay={250}
          />
        </View>

        {/* Chart Section */}
        <Animated.View
          style={[styles.chartContainer, chartAnimatedStyle]}
          entering={SlideInDown.delay(300).duration(400).springify()}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Financial Overview</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.green },
                  ]}
                />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.rose }]}
                />
                <Text style={styles.legendText}>Expenses</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            {chartLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading chart data...</Text>
              </View>
            ) : chartData.length > 0 ? (
              <BarChart
                data={chartData}
                width={width - 80}
                height={240}
                barWidth={Math.max(16, (width - 140) / Math.max(chartData.length, 1) - 12)}
                spacing={8}
                hideRules={false}
                rulesColor={colors.neutral700}
                rulesType="solid"
                isAnimated
                animationDuration={600}
                roundedTop
                roundedBottom
                yAxisLabelPrefix="$"
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={colors.neutral700}
                yAxisLabelWidth={40}
                yAxisTextStyle={{
                  color: colors.neutral400,
                  fontSize: 12,
                  fontWeight: "500",
                }}
                xAxisLabelTextStyle={{
                  color: colors.neutral400,
                  fontSize: 11,
                  fontWeight: "500",
                  textAlign: 'center' as const,
                }}
                noOfSections={5}
                maxValue={Math.max(...chartData.map((d) => d.value), 100) * 1.1}
                backgroundColor="transparent"
                showGradient={false}
                barBorderRadius={4}
                leftShiftForTooltip={10}
                leftShiftForLastIndexTooltip={10}
                // Add some padding around the chart
                initialSpacing={10}
                endSpacing={10}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Icons.ChartBar
                  size={48}
                  color={colors.neutral600}
                  weight="light"
                />
                <Text style={styles.noDataText}>No data available</Text>
                <Text style={styles.noDataSubtext}>
                  Add some transactions to see your statistics
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Transactions List */}
        <Animated.View
          entering={FadeIn.delay(400).duration(300)}
          style={styles.transactionsContainer}
        >
          <TransactionList
            title="Recent Transactions"
            emptyListMessage="No transactions found for this period"
            data={transactions}
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
    backgroundColor: colors.neutral900,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: colors.neutral400,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  segmentedControlContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  segmentedControl: {
    height: 40,
    borderRadius: 12,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.neutral800,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statTitle: {
    color: colors.neutral300,
    fontSize: 16,
    fontWeight: "600",
  },
  statAmount: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  chartContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  chartLegend: {
    flexDirection: "row",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: colors.neutral400,
    fontSize: 12,
    fontWeight: "500",
  },
  chartWrapper: {
    alignItems: "center",
    minHeight: 240,
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
  },
  loadingText: {
    color: colors.neutral400,
    fontSize: 14,
    marginTop: 12,
    fontWeight: "500",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
  },
  noDataText: {
    color: colors.neutral300,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  noDataSubtext: {
    color: colors.neutral500,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default Statistics;