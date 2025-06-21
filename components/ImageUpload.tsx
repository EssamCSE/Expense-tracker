import { getFilePath } from "@/service/ImageService";
import { ImageUploadProps } from "@/types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Icons from "phosphor-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  RotateInUpLeft,
  SlideInUp,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get("window");

const ImageUpload = ({
  file = null,
  onSelect,
  onClear,
  containerStyle,
  imageStyle,
  placeholder = "Upload Image",
}: ImageUploadProps) => {


  // Animation shared values
  const uploadScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const uploadIconRotation = useSharedValue(0);
  const uploadIconScale = useSharedValue(1);
  const borderPulse = useSharedValue(0);
  const imageScale = useSharedValue(0);
  const imageOpacity = useSharedValue(0);
  const particleFloat = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const successGlow = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  useEffect(() => {
    // Continuous glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 2000 }),
        withTiming(0.5, { duration: 2000 })
      ),
      -1,
      false
    );

    // Border pulse animation
    borderPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      false
    );

    // Particle floating animation
    particleFloat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      false
    );

    // Floating elements
    floatingElements.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      false
    );

    // Image animations when file exists
    if (file) {
      imageScale.value = withSpring(1, { damping: 10, stiffness: 120 });
      imageOpacity.value = withTiming(1, { duration: 600 });

      successGlow.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 })
        ),
        -1,
        false
      );
    } else {
      imageScale.value = 0;
      imageOpacity.value = 0;
      successGlow.value = 0;
    }
  }, [file]);





  const pickImage = async () => {
    // Press animation
    uploadScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1.02, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    // Icon animations
    uploadIconRotation.value = withSequence(
      withTiming(10, { duration: 100 }),
      withSpring(-5, { damping: 6 }),
      withSpring(0, { damping: 8 })
    );

    uploadIconScale.value = withSequence(
      withTiming(1.1, { duration: 120 }),
      withSpring(1, { damping: 8 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.4;
    rippleScale.value = withTiming(3, { duration: 500 });
    rippleOpacity.value = withTiming(0, { duration: 500 });

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        onSelect(result.assets[0]);
        successGlow.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 1500 }),
            withTiming(0.2, { duration: 1500 })
          ),
          -1,
          false
        );
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleClear = () => {
    // Exit animation
    imageScale.value = withSequence(
      withSpring(1.05, { damping: 8 }),
      withTiming(0, { duration: 250 })
    );
    imageOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      onClear();
    }, 250);
  };

  // Animated styles
  const uploadAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${uploadIconRotation.value}deg` },
      { scale: uploadIconScale.value },
    ],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(borderPulse.value, [0.4, 1], [0.6, 1]),
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
    opacity: imageOpacity.value,
  }));

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(particleFloat.value, [0, 1], [0.3, 0.7]),
    transform: [
      {
        translateY: interpolate(particleFloat.value, [0, 1], [0, -20]),
      },
    ],
  }));

  const successGlowStyle = useAnimatedStyle(() => ({
    opacity: successGlow.value,
  }));

  const floatingElementsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(floatingElements.value, [0, 1], [0.4, 0.8]),
    transform: [
      {
        translateY: interpolate(floatingElements.value, [0, 1], [0, -10]),
      },
    ],
  }));

  // Render uploaded image state
  if (file) {
    return (
      <Animated.View
        style={[styles.uploadedContainer, containerStyle]}
        entering={ZoomIn.duration(500).springify()}
        exiting={ZoomOut.duration(400)}
      >
        {/* Success Background Glow */}
        <Animated.View style={[styles.successGlow, successGlowStyle]} />

        {/* Image Container */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image
            source={getFilePath(file)}
            contentFit="cover"
            transition={400}
            style={[styles.uploadedImage, imageStyle]}
          />
        </Animated.View>

        {/* Clear Button */}
        <AnimatedTouchableOpacity
          onPress={handleClear}
          className="absolute top-4 right-4 w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.9)",
            borderWidth: 2,
            borderColor: "rgba(255, 255, 255, 0.3)",
            shadowColor: "#ef4444",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          }}
          entering={RotateInUpLeft.duration(400).delay(300)}
          exiting={SlideOutDown.duration(300)}
        >
          <Icons.X color="white" size={18} weight="bold" />
        </AnimatedTouchableOpacity>

        {/* Success Badge */}
        <Animated.View
          style={styles.successBadge}
          entering={SlideInUp.duration(500).delay(400)}
        >
          <Icons.CheckCircle color="white" size={16} weight="fill" />
          <Text style={styles.successText}>Image Ready</Text>
        </Animated.View>
      </Animated.View>
    );
  }

  // Render upload state
  return (
    <Animated.View style={uploadAnimatedStyle}>
      {/* Glow Effect */}
      <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />

      {/* Ripple Effect */}
      <Animated.View style={[styles.rippleEffect, rippleAnimatedStyle]} />

      {/* Main Upload Container */}
      <Animated.View>
        <AnimatedTouchableOpacity
          onPress={pickImage}
          style={[styles.uploadContainer, borderAnimatedStyle, containerStyle]}
          entering={FadeIn.duration(800)}
        >
          {/* Floating Particles */}
          <Animated.View
            style={[
              styles.particle1,
              particleAnimatedStyle,
              floatingElementsStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.particle2,
              particleAnimatedStyle,
              floatingElementsStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.particle3,
              particleAnimatedStyle,
              floatingElementsStyle,
            ]}
          />

          {/* Upload Icon Container */}
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <Icons.UploadSimple color="#3B82F6" size={32} weight="bold" />
            <Animated.View style={[styles.iconGlow, glowAnimatedStyle]} />
          </Animated.View>

          {/* Upload Text */}
          <View style={styles.textContainer}>
            <Text style={styles.primaryText}>{placeholder}</Text>
            <Text style={styles.secondaryText}>
              Tap to select an image from your gallery
            </Text>
            <Text style={styles.tertiaryText}>Supports JPG, PNG • Max 5MB</Text>
          </View>

          {/* Decorative Elements */}
          <Animated.View
            style={[styles.decorativeCircle1, glowAnimatedStyle]}
          />
          <Animated.View
            style={[styles.decorativeCircle2, borderAnimatedStyle]}
          />

          {/* Corner Accents */}
          <View style={styles.cornerAccent1} />
          <View style={styles.cornerAccent2} />
          <View style={styles.cornerAccent3} />
          <View style={styles.cornerAccent4} />
        </AnimatedTouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Uploaded Image Styles
  uploadedContainer: {
    height: 200,
    borderRadius: 20,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderWidth: 2,
    borderColor: "#10B981",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  imageContainer: {
    flex: 1,
    padding: 8,
  },
  uploadedImage: {
    flex: 1,
    borderRadius: 12,
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#10B981",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Upload State Styles
  glowEffect: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  rippleEffect: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 100,
    height: 100,
    marginTop: -50,
    marginLeft: -50,
    borderRadius: 50,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  uploadContainer: {
    borderRadius: 20,
    padding: 32,
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    position: "relative",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
    position: "relative",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  textContainer: {
    alignItems: "center",
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  tertiaryText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },

  // Particles
  particle1: {
    position: "absolute",
    top: 20,
    right: 24,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
  },
  particle2: {
    position: "absolute",
    top: 40,
    left: 16,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
  },
  particle3: {
    position: "absolute",
    bottom: 30,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  // Decorative Elements
  decorativeCircle1: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#10B981",
  },

  // Corner Accents
  cornerAccent1: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 20,
    height: 2,
    backgroundColor: "#8B5CF6",
  },
  cornerAccent2: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 2,
    height: 20,
    backgroundColor: "#8B5CF6",
  },
  cornerAccent3: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 20,
    height: 2,
    backgroundColor: "#10B981",
  },
  cornerAccent4: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 2,
    height: 20,
    backgroundColor: "#10B981",
  },
});

export default ImageUpload;
