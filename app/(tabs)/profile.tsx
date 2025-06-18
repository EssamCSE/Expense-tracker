import Header from "@/components/Header";
import { auth } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { getProfileImage } from "@/service/ImageService";
import { accountOptionType } from "@/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import React, { useEffect } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  BounceIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
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

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  // Shared values for animations
  const profileImageScale = useSharedValue(0);
  const profileImageRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const onlineStatusScale = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  const accountOptions: accountOptionType[] = [
    {
      title: "Edit Profile",
      icon: <Icons.User size={22} color="white" weight="fill" />,
      routeName: "/(modals)/profileModal",
      bgColor: "#6366f1",
    },
    {
      title: "Settings",
      icon: <Icons.GearSix size={22} color="white" weight="fill" />,
      bgColor: "#059669",
    },
    {
      title: "Privacy Policy",
      icon: <Icons.Lock size={22} color="white" weight="fill" />,
      bgColor: colors.neutral600,
    },
    {
      title: "Logout",
      icon: <Icons.Power size={22} color="white" weight="fill" />,
      bgColor: "#e11d",
    },
  ];

  // Initialize animations
  useEffect(() => {
    // Profile image entrance animation
    profileImageScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    // Subtle rotation animation
    profileImageRotation.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 3000 }),
        withTiming(-2, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      false
    );

    // Glow effect animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000 }),
        withTiming(0.1, { duration: 2000 })
      ),
      -1,
      false
    );

    // Header fade in
    headerOpacity.value = withTiming(1, { duration: 800 });

    // Online status bounce in
    setTimeout(() => {
      onlineStatusScale.value = withSpring(1, {
        damping: 8,
        stiffness: 200,
      });
    }, 500);

    // Pulse animation for online status
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  // Animated styles
  const profileImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: profileImageScale.value },
        { rotate: `${profileImageRotation.value}deg` },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [
        { scale: interpolate(glowOpacity.value, [0.1, 0.3], [1.05, 1.15]) },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        { translateY: interpolate(headerOpacity.value, [0, 1], [-20, 0]) },
      ],
    };
  });

  const onlineStatusAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: onlineStatusScale.value * pulseAnimation.value }],
    };
  });

  const handleLogout = async () => {
    await signOut(auth);
  };
  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel logout"),
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => handleLogout(),
          style: "destructive",
        },
      ]);
  };


  const handlePress = (item: accountOptionType, index: number) => {
    if (item.title == "Logout") {
      showLogoutAlert();
    }
    if(item.routeName){
      router.push(item.routeName);
    }
  };
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#0a0a0a" }}>
      <Header title="Profile" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Hero Section */}
        <Animated.View className="relative" entering={FadeIn.duration(600)}>
          {/* Background with gradient effect */}
          <Animated.View
            className="absolute inset-0 h-48"
            style={[
              {
                backgroundColor: "#1a1a2e",
              },
            ]}
            entering={FadeInUp.duration(800).delay(200)}
          />

          {/* Profile Content */}
          <View className="items-center pt-8 pb-12">
            {/* Profile Image with Glow Effect */}
            <View className="relative mb-6">
              {/* Animated Glow Effect */}
              <Animated.View
                className="absolute inset-0 rounded-full"
                style={[
                  {
                    backgroundColor: "#3b82f6",
                  },
                  glowAnimatedStyle,
                ]}
              />

              {/* Profile Image Container */}
              <Animated.View
                className="relative"
                style={profileImageAnimatedStyle}
                entering={BounceIn.duration(1000).delay(300)}
              >
                <Image
                  source={getProfileImage(user?.image)}
                  style={{
                    height: 120,
                    width: 120,
                    borderRadius: 60,
                    borderWidth: 4,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  contentFit="cover"
                  transition={300}
                />

                {/* Animated Online Status */}
                <Animated.View
                  className="absolute -bottom-2 -right-2"
                  style={onlineStatusAnimatedStyle}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: "#4ade80",
                      borderWidth: 4,
                      borderColor: "#111827",
                    }}
                  >
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#86efac" }}
                    />
                  </View>
                </Animated.View>
              </Animated.View>
            </View>

            {/* User Info */}
            <Animated.View
              className="items-center px-6"
              style={headerAnimatedStyle}
            >
              <Text className="text-white text-3xl font-bold mb-2 text-center">
                {user?.name || "Welcome User"}
              </Text>
              <View
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: "#93c5fd" }}
                >
                  {user?.email || "user@example.com"}
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Account Options */}
        <Animated.View
          className="px-6 pb-8"
          entering={FadeInDown.duration(600).delay(400)}
        >
          <Text
            className="text-lg font-semibold mb-4 ml-2"
            style={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Account Options
          </Text>

          <View>
            {accountOptions.map((item, index) => (
              <AnimatedTouchableOpacity
                onPress={() => handlePress(item, index)}
                key={`option-${index}`}
                className="rounded-2xl overflow-hidden mb-4"
                activeOpacity={0.7}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                entering={SlideInRight.duration(600).delay(600 + index * 100)}
              >
                <View className="flex-row items-center p-5">
                  {/* Icon with colored Background */}
                  <Animated.View
                    className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: item.bgColor,
                      shadowColor: item.bgColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                    entering={BounceIn.duration(400).delay(800 + index * 100)}
                  >
                    {item.icon}
                  </Animated.View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-white text-lg font-semibold mb-1">
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: 14,
                      }}
                    >
                      {item.title === "Edit Profile" &&
                        "Manage your personal information"}
                      {item.title === "Settings" &&
                        "App preferences and configuration"}
                      {item.title === "Privacy Policy" &&
                        "Terms and privacy information"}
                      {item.title === "Logout" && "Sign out of your account"}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <Icons.CaretRight size={18} color="white" weight="bold" />
                  </View>
                </View>
              </AnimatedTouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
