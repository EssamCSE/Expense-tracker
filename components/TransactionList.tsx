import { colors } from "@/constants/theme";
import { TransactionListType, TransactionType } from "@/types";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TransicationItem from "./TransicationItem";
import { styles } from "@/utils/styles/transactionListStyles";
const { width } = Dimensions.get("window");

const TransictionList = ({
  data,
  title,
  loading,
  emptyListMessage,
  onRefresh,
  refreshing = false,
}: TransactionListType) => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (loading) {
      // Start pulse animation for loading
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Entrance animation when data loads
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, data]);

  const handleClick = (item: TransactionType, index: number) => {
    // Haptic feedback animation
    setIsAnimating(true);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      // TODO: Open Transaction Details in Modal
      router.push({
        pathname: "/(modals)/transactionModal",
        params: {
          id: item?.id,
          type: item?.type,
          amount: item?.amount?.toString(),
          category: item?.category,
          date: (item.date as Timestamp)?.toDate()?.toISOString(),
          description: item?.description,
          image: item?.image,
          uid: item?.uid,
          walletId: item?.walletId,
        },
      });
      console.log("Transaction clicked:", item, index);
    });
  };

  const renderLoadingState = () => (
    <Animated.View
      style={[styles.centerContainer, { transform: [{ scale: pulseAnim }] }]}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <Icons.Receipt size={64} color="#4a5568" weight="light" />
      </View>
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyMessage}>{emptyListMessage}</Text>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={() => router.push("/(modals)/transactionModal")}
      >
        <Icons.Plus size={16} color="white" weight="bold" />
        <Text style={styles.emptyActionText}>Add First Transaction</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderListHeader = () => {
    if (!title) return null;

    return (
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{data.length}</Text>
          </View>
          {/* <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity> */}
        </View>
      </Animated.View>
    );
  };

  const renderTransactionItem = ({
    item,
    index,
  }: {
    item: TransactionType;
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: isAnimating && index === 0 ? pulseAnim : 1 },
          ],
        },
      ]}
    >
      <TransicationItem
        item={item}
        index={index}
        handleClick={() => handleClick(item, index)}
      />
    </Animated.View>
  );

  const renderItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      {renderListHeader()}

      {loading ? (
        renderLoadingState()
      ) : data.length === 0 ? (
        renderEmptyState()
      ) : (
        <Animated.View
          style={[
            styles.listContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <FlashList
            data={data}
            estimatedItemSize={80}
            renderItem={renderTransactionItem}
            ItemSeparatorComponent={renderItemSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#3b82f6"
                  colors={["#3b82f6"]}
                  progressBackgroundColor="#1a1a1a"
                />
              ) : undefined
            }
            keyExtractor={(item, index) =>
              `transaction-${index}-${item.id || index}`
            }
          />
        </Animated.View>
      )}
    </View>
  );
};

export default TransictionList;
