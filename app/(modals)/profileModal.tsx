import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuth } from "@/context/authContext";
import { getProfileImage } from "@/service/ImageService";
import { updateUser } from "@/service/userService";
import { UserDataType } from "@/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  BounceIn,
  FadeIn,
  FadeInUp,
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
import * as ImagePicker from 'expo-image-picker';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get("window");

const ProfileModal = () => {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const [userData, setUserData] = useState<UserDataType>({
    name: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  // Shared values for animations
  const profileImageScale = useSharedValue(0);
  const editButtonScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const backgroundGradient = useSharedValue(0);

  useEffect(() => {
    // Initialize animations
    profileImageScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    // Edit button bounce in
    setTimeout(() => {
      editButtonScale.value = withSpring(1, {
        damping: 8,
        stiffness: 200,
      });
    }, 300);

    // Glow effect - smoother animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2500 }),
        withTiming(0.2, { duration: 2500 })
      ),
      -1,
      false
    );

    // Header fade in
    headerOpacity.value = withTiming(1, { duration: 600 });

    // Form fade in
    setTimeout(() => {
      formOpacity.value = withTiming(1, { duration: 800 });
    }, 400);

    // Button fade in
    setTimeout(() => {
      buttonOpacity.value = withTiming(1, { duration: 600 });
    }, 800);

    // Background gradient animation
    backgroundGradient.value = withTiming(1, { duration: 1000 });
  }, []);

  // Animated styles
  const profileImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: profileImageScale.value }],
    };
  });

  const editButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: editButtonScale.value }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [
        {
          scale: interpolate(
            glowOpacity.value,
            [0.2, 0.6],
            [1.0, 1.15],
            "clamp"
          ),
        },
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

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [
        { translateY: interpolate(formOpacity.value, [0, 1], [30, 0]) },
      ],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [
        { translateY: interpolate(buttonOpacity.value, [0, 1], [20, 0]) },
      ],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(backgroundGradient.value, [0, 1], [0, 0.4], "clamp"),
    };
  });

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      image: user?.image || null,
    });
  }, [user]);

  const onSubmit = async () => {
    // Add button press animation
    let { name, image } = userData;
    if (!name.trim()) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }
    setLoading(true);

    const res = await updateUser(user?.uid as string, userData);
    setLoading(false);

    if (res.success) {
      updateUserData(user?.uid as string);
      router.back();
    } else {
      Alert.alert("User", res.msg);
    }

    editButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
  };

  const handleImageEdit = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setUserData({...userData, image: result.assets[0]});
      }
  
    // Add haptic feedback animation
    editButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Animated Background */}
      <Animated.View
        className="absolute inset-0"
        style={[
          {
            backgroundColor: "#1a1a2e",
          },
          backgroundAnimatedStyle,
        ]}
      />

      {/* Header */}
      <Animated.View
        className="flex flex-row items-center justify-between px-4 py-4"
        style={[
          {
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
          headerAnimatedStyle,
        ]}
        entering={SlideInLeft.duration(600)}
      >
        <BackButton />
        <Text className="flex-1 text-2xl font-bold text-white text-center mr-8">
          Update Profile
        </Text>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <Animated.View
          className="flex justify-center items-center pt-12 pb-8"
          entering={FadeIn.duration(800).delay(200)}
        >
          {/* Profile Image Container */}
          <View className="relative items-center justify-center">
            {/* Glow Effect - positioned behind image */}
            <Animated.View
              className="absolute rounded-full"
              style={[
                {
                  width: 140,
                  height: 140,
                  backgroundColor: "#6366f1",
                  top: -10,
                  left: -10,
                },
                glowAnimatedStyle,
              ]}
            />

            <Animated.View style={profileImageAnimatedStyle}>
              <Image
                source={getProfileImage(userData.image)}
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
                contentFit="cover"
                transition={300}
              />
            </Animated.View>

            {/* Edit Button */}
            <AnimatedTouchableOpacity
              className="absolute -bottom-2 -right-2"
              style={[
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#6366f1",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "#0a0a0a",
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                },
                editButtonAnimatedStyle,
              ]}
              onPress={handleImageEdit}
              activeOpacity={0.8}
            >
              <Icons.Camera size={20} color="white" weight="bold" />
            </AnimatedTouchableOpacity>
          </View>

          {/* Profile Status */}
          <Animated.View
            className="mt-6 px-4 py-2 rounded-full"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(99, 102, 241, 0.3)",
            }}
            entering={BounceIn.duration(600).delay(600)}
          >
            <Text className="text-sm font-medium" style={{ color: "#a5b4fc" }}>
              Tap camera to change photo
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Form Section */}
        <Animated.View className="flex-1 px-6 mt-4" style={formAnimatedStyle}>
          {/* Form Card */}
          <Animated.View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
            entering={FadeInUp.duration(600).delay(800)}
          >
            {/* Form Header */}
            <View className="flex-row items-center mb-6">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: "#10b981" }}
              >
                <Icons.User size={24} color="white" weight="bold" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">
                  Personal Information
                </Text>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}
                >
                  Update your profile details
                </Text>
              </View>
            </View>

            {/* Name Input */}
            <View className="mb-2">
              <Text
                className="text-lg font-semibold mb-3 ml-1"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                Display Name
              </Text>
              <Input
                value={userData.name}
                onChangeText={(value) => {
                  setUserData({ ...userData, name: value });
                }}
                placeholder="Enter your name"
                icon={<Icons.User size={22} color="#6366f1" weight="fill" />}
              />
            </View>
          </Animated.View>

          {/* Additional Info Card */}
          <Animated.View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.05)",
              borderWidth: 1,
              borderColor: "rgba(16, 185, 129, 0.2)",
            }}
            entering={FadeInUp.duration(600).delay(1000)}
          >
            <View className="flex-row items-center">
              <Icons.Info size={20} color="#10b981" weight="bold" />
              <Text
                className="ml-3 text-sm font-medium"
                style={{ color: "#6ee7b7" }}
              >
                Your profile information is private and secure
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Update Button */}
      <Animated.View
        className="px-6 pb-6 pt-4"
        style={[
          {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderTopWidth: 1,
            borderTopColor: "rgba(255, 255, 255, 0.1)",
          },
          buttonAnimatedStyle,
        ]}
      >
        <Button onPress={onSubmit}>
          <View className="flex-row items-center justify-center">
            <Icons.Check size={24} color="white" weight="bold" />
            <Text className="text-white text-xl font-bold ml-2">
              Update Profile
            </Text>
          </View>
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfileModal;
