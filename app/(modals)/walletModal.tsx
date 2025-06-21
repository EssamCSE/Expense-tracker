import BackButton from "@/components/BackButton";
import ImageUpload from "@/components/ImageUpload";
import Input from "@/components/Input";
import { useAuth } from "@/context/authContext";
import { createOrUpdateWallet, deleteWallet } from "@/service/walletService";
import { WalletType } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const { width, height } = Dimensions.get("window");

const WalletModal = () => {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const [wallet, setWalletData] = useState<WalletType>({
    name: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
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
  const walletIconRotation = useSharedValue(0);
  const submitButtonPulse = useSharedValue(1);
  const deleteButtonScale = useSharedValue(0.8);
  const deleteButtonOpacity = useSharedValue(0);
  const deleteButtonRotation = useSharedValue(0);
  const deleteButtonGlow = useSharedValue(0);

  useEffect(() => {
    const startAnimations = () => {
      // Background entrance

      if (id) {
        setTimeout(() => {
          deleteButtonScale.value = withSpring(1, { damping: 8 });
          deleteButtonOpacity.value = withTiming(1, { duration: 600 });
        }, 700);
        deleteButtonGlow.value = withRepeat(
          withSequence(
            withTiming(0.2, { duration: 2500 }),
            withTiming(0.6, { duration: 2500 })
          ),
          -1,
          false
        );
      }
      backgroundScale.value = withSpring(1, { damping: 12 });
      backgroundOpacity.value = withTiming(1, { duration: 800 });

      // Header animation
      headerTranslateY.value = withSpring(0, { damping: 10 });
      headerOpacity.value = withTiming(1, { duration: 600 });

      // Card entrance
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

      walletIconRotation.value = withRepeat(
        withTiming(360, { duration: 15000 }),
        -1,
        false
      );

      submitButtonPulse.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    };

    startAnimations();
  }, []);

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
    transform: [{ scale: buttonScale.value * submitButtonPulse.value }],
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

  const walletIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${walletIconRotation.value}deg` }],
  }));
  const deleteButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: deleteButtonScale.value },
      { rotate: `${deleteButtonRotation.value}deg` },
    ],
    opacity: deleteButtonOpacity.value,
  }));

  const deleteButtonGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(deleteButtonGlow.value, [0.2, 0.6], [0.1, 0.4]),
  }));

  // Setup new Wallet form
  useEffect(() => {
    setWalletData({
      name: "",
      image: null,
    });
  }, [user]);

  type WalletParams = {
    id: string;
    name: string;
    amount: number;
    image: string;
  };

  const { id, name, amount, image } =
    useLocalSearchParams() as unknown as WalletParams;

  useEffect(() => {
    if (id) {
      setWalletData({
        name: name ?? "",
        image: image ?? "",
        amount: Number(amount ?? 0),
      });
    }
  }, []);
  const onSubmit = async () => {
    // Button press animation
    submitButtonPulse.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1.05, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );

    let { name, image } = wallet;
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a wallet name");
      return;
    }
    const data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };
    if (id) {
      data.id = id;
    }

    setLoading(true);
    try {
      const res = await createOrUpdateWallet(data);
      // console.log("Result", res);
      setLoading(false);

      if (res.success) {
        updateUserData(user?.uid as string);
        router.back();
      } else {
        Alert.alert("Error", res.msg);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleImageEdit = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setWalletData({ ...wallet, image: result.assets[0] });
    }
  };

  // Deleting Wallet functions
  const onDeleteWallet = async () => {
    if (!id) return;
    setLoading(true);
    const res = await deleteWallet(id);
    setLoading(false);
    if (!res.success) {
      Alert.alert("Error", res.msg);
    }
  };

  const handleDelete = async () => {
    // Button press animation
    deleteButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1.1, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );

    deleteButtonRotation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Show confirmation alert
    Alert.alert(
      "Delete Wallet",
      "Are you sure you want to delete this wallet? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDeleteWallet();
            router.back();
          },
        },
      ]
    );
  };
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
          <Text style={styles.headerTitle}>
            {id ? "Update Wallet" : "Create Wallet"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {id
              ? "Update your wallet details"
              : "Set up your new digital wallet"}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Form Card */}
        <Animated.View style={[styles.formCard, cardAnimatedStyle]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Animated.View
              style={[styles.iconContainer, walletIconAnimatedStyle]}
            >
              <Icons.Wallet size={32} color="#10B981" weight="duotone" />
            </Animated.View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                {id ? "Update Wallet" : "Create Wallet"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {id
                  ? "Update your wallet details"
                  : "Set up your new digital wallet"}
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <Animated.View style={formFieldsAnimatedStyle}>
            {/* Wallet Name */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInLeft.duration(600).delay(100)}
            >
              <Text style={styles.inputLabel}>Wallet Name</Text>
              <Input
                value={wallet.name}
                onChangeText={(value) =>
                  setWalletData({ ...wallet, name: value })
                }
                placeholder="Enter wallet name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                icon={<Icons.Wallet size={20} color="#10B981" weight="fill" />}
              />
            </Animated.View>

            {/* Wallet Icon */}
            <Animated.View
              style={styles.inputGroup}
              entering={SlideInRight.duration(600).delay(200)}
            >
              <Text style={styles.inputLabel}>Wallet Icon</Text>
              <ImageUpload
                file={wallet.image}
                onSelect={(file) => setWalletData({ ...wallet, image: file })}
                onClear={() => setWalletData({ ...wallet, image: null })}
                placeholder="Choose wallet icon"
                imageStyle={styles.imageUpload}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Submit Button */}
      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        {id ? (
          <>
            <View style={styles.deleteButtonWrapper}>
              <Animated.View
                style={[styles.deleteButtonGlow, deleteButtonGlowStyle]}
              />
              <AnimatedTouchableOpacity
                onPress={handleDelete}
                style={[styles.deleteButton, deleteButtonAnimatedStyle]}
                disabled={loading}
                entering={SlideInLeft.duration(600).delay(500)}
              >
                <View style={styles.deleteButtonContent}>
                  {loading ? (
                    <Icons.CircleNotch
                      size={24}
                      color="#FFFFFF"
                      weight="bold"
                    />
                  ) : (
                    <Icons.Trash size={24} color="#FFFFFF" weight="bold" />
                  )}
                  <Text style={styles.deleteButtonText}>
                    {loading ? "Deleting..." : "Delete"}
                  </Text>
                </View>
              </AnimatedTouchableOpacity>
            </View>

            <AnimatedTouchableOpacity
              onPress={onSubmit}
              style={[styles.submitButton, { flex: 1, marginLeft: 12 }]}
              disabled={loading}
              entering={SlideInDown.duration(600).delay(400)}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <Icons.CircleNotch size={24} color="white" weight="bold" />
                ) : (
                  <Icons.Check size={24} color="white" weight="bold" />
                )}
                <Text style={styles.buttonText}>
                  {loading ? "Updating..." : "Update Wallet"}
                </Text>
              </View>
            </AnimatedTouchableOpacity>
          </>
        ) : (
          <AnimatedTouchableOpacity
            onPress={onSubmit}
            style={[styles.submitButton, { flex: 1 }]}
            disabled={loading}
            entering={SlideInDown.duration(600).delay(400)}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <Icons.CircleNotch size={24} color="white" weight="bold" />
              ) : (
                <Icons.Check size={24} color="white" weight="bold" />
              )}
              <Text style={styles.buttonText}>
                {loading ? "Creating..." : "Create Wallet"}
              </Text>
            </View>
          </AnimatedTouchableOpacity>
        )}
      </Animated.View>
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
    marginLeft: -40, // Compensate for back button
  },
  headerSpacer: {
    width: 40,
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
  input: {
    backgroundColor: "rgba(51, 65, 85, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  imageUpload: {
    backgroundColor: "rgba(51, 65, 85, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  deleteButtonWrapper: {
    position: "relative",
  },
  deleteButtonGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: "#EF4444",
    borderRadius: 24,
    zIndex: 0,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    zIndex: 1,
  },
  deleteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
});

export default WalletModal;
