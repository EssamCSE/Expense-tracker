import { useEffect } from "react";
import { Dimensions } from "react-native";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export const useTransactionAnimations = () => {
  // Animation shared values
  const containerScale = useSharedValue(0.95);
  const containerOpacity = useSharedValue(0);
  const headerSlide = useSharedValue(-30);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const formFieldsOpacity = useSharedValue(0);
  const formFieldsTranslate = useSharedValue(20);
  const buttonScale = useSharedValue(0.8);
  const buttonOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  // Floating particles
  const particle1 = useSharedValue(0);
  const particle2 = useSharedValue(0);
  const particle3 = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    containerScale.value = withDelay(
      100,
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    containerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));

    headerSlide.value = withDelay(
      200,
      withSpring(0, { damping: 12, stiffness: 150 })
    );

    cardScale.value = withDelay(
      400,
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 700 }));

    formFieldsOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    formFieldsTranslate.value = withDelay(600, withSpring(0, { damping: 10 }));

    buttonScale.value = withDelay(800, withSpring(1, { damping: 8 }));
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // Continuous animations
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );

    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 3000 }),
        withTiming(0.6, { duration: 3000 })
      ),
      -1,
      true
    );

    // Floating particles
    particle1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(0, { duration: 4000 })
      ),
      -1,
      true
    );

    particle2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000 }),
        withTiming(0, { duration: 5000 })
      ),
      -1,
      true
    );

    particle3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6000 }),
        withTiming(0, { duration: 6000 })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerSlide.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formFieldsOpacity.value,
    transform: [{ translateY: formFieldsTranslate.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value * pulseAnimation.value }],
    opacity: buttonOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const particle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particle1.value, [0, 1], [0, -25]) },
      { translateX: interpolate(particle1.value, [0, 1], [0, 10]) },
      { rotate: `${interpolate(particle1.value, [0, 1], [0, 360])}deg` },
    ],
    opacity: interpolate(particle1.value, [0, 0.5, 1], [0.4, 0.8, 0.4]),
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particle2.value, [0, 1], [0, -30]) },
      { translateX: interpolate(particle2.value, [0, 1], [0, -15]) },
      { scale: interpolate(particle2.value, [0, 1], [0.8, 1.2]) },
    ],
    opacity: interpolate(particle2.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particle3.value, [0, 1], [0, -20]) },
      { translateX: interpolate(particle3.value, [0, 1], [0, 8]) },
      { rotate: `${interpolate(particle3.value, [0, 1], [0, -180])}deg` },
    ],
    opacity: interpolate(particle3.value, [0, 0.5, 1], [0.5, 0.9, 0.5]),
  }));

  // Button press animation
  const animateButtonPress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1.05, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );
  };

  return {
    containerAnimatedStyle,
    headerAnimatedStyle,
    cardAnimatedStyle,
    formAnimatedStyle,
    buttonAnimatedStyle,
    glowAnimatedStyle,
    particle1Style,
    particle2Style,
    particle3Style,
    animateButtonPress,
  };
};
