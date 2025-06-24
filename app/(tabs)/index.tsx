import HomeCard from "@/components/HomeCard";
import TransactionList from "@/components/TransactionList";
import { auth } from "@/config/firebase";
import { useAuth } from "@/context/authContext";
import UseFetchData from "@/hooks/useFetchData";
import { TransactionType } from "@/types";
import { styles } from "@/utils/styles/homeStyles";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { limit, orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;
  const listSlideAnim = useRef(new Animated.Value(30)).current;

  // FAB scroll animation values
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabTranslateY = useRef(new Animated.Value(0)).current;

  // Scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef("up");
  const hideTimeout = useRef<any>(null);

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(39),
  ];

  const {
    data: recentTransactions,
    error,
    loading,
  } = UseFetchData<TransactionType>("transactions", constraints);
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

  useEffect(() => {
    // Faster, more responsive staggered animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(listSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle floating animation for FAB (when visible)
    const startFloatingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim, {
            toValue: -4,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatingAnimation();

    // Scroll listener for FAB visibility
    const scrollListener = scrollY.addListener(({ value }) => {
      const currentScrollY = value;
      const scrollDiff = currentScrollY - lastScrollY.current;

      // Determine scroll direction
      if (Math.abs(scrollDiff) > 5) {
        // Threshold to avoid micro-movements
        if (scrollDiff > 0 && scrollDirection.current !== "down") {
          scrollDirection.current = "down";
          hideFAB();
        } else if (scrollDiff < 0 && scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          showFAB();
        }
        lastScrollY.current = currentScrollY;
      }
    });

    return () => {
      scrollY.removeListener(scrollListener);
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  const hideFAB = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.parallel([
      Animated.timing(fabOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fabTranslateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showFAB = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    Animated.parallel([
      Animated.timing(fabOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fabTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScrollEnd = () => {
    // Show FAB after scroll ends with a small delay
    hideTimeout.current = setTimeout(() => {
      showFAB();
    }, 1000);
  };

  const handleLogout = async () => {
    // Quick rotate animation on logout
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(async () => {
      await signOut(auth);
    }, 150);
  };

  const handleFABPress = () => {
    // Quick scale animation for FAB press
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    router.push("/(modals)/transactionModal");
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello,</Text>
          <Animated.Text
            style={[styles.userName, { transform: [{ scale: scaleAnim }] }]}
          >
            {user?.name || "User"}
          </Animated.Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(modals)/searchModal')}
          >
            <Icons.MagnifyingGlass size={22} color="white" weight="bold" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {/* Animated Card Section */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <HomeCard />
        </Animated.View>

        {/* Animated Transaction List */}
        <Animated.View
          style={[
            styles.transactionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: listSlideAnim }],
            },
          ]}
        >
          <TransactionList
            title="Recent Transactions"
            data={recentTransactions}
            loading={loading} 
            emptyListMessage="No transactions yet"
            onRefresh={handleRefresh} 
            refreshing={refreshing}
          />
        </Animated.View>

        {/* Spacing for FAB */}
        <View style={styles.fabSpacing} />
      </ScrollView>

      {/* Floating Action Button with Scroll Animation */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabOpacity,
            transform: [
              { translateY: Animated.add(floatingAnim, fabTranslateY) },
              { scale: fabScale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFABPress}
          activeOpacity={0.8}
        >
          <Icons.Plus weight="bold" color="black" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Home;
