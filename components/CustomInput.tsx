import { styles } from "@/utils/styles/transactionModalStyles";
import React, { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  icon,
  multiline = false,
  keyboardType = "default",
  ...props
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad"
    | "numeric"
    | "email-address"
    | "phone-pad";
  [key: string]: any;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    scaleAnim.value = withSpring(isFocused ? 1.01 : 1, { damping: 15 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusAnim.value, [0, 1], ["#2a2a2a", "#a3e635"]),
    shadowOpacity: interpolate(focusAnim.value, [0, 1], [0, 0.2]),
    transform: [{ scale: scaleAnim.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focusAnim.value, [0, 1], [1, 1.1]) },
      { rotate: `${interpolate(focusAnim.value, [0, 1], [0, 5])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <View style={styles.inputWrapper}>
        {icon && (
          <Animated.View style={[styles.inputIcon, iconAnimatedStyle]}>
            {icon}
          </Animated.View>
        )}
        <AnimatedTextInput
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            { paddingLeft: icon ? 48 : 16 },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          keyboardType={keyboardType}
          {...props}
        />
      </View>
    </Animated.View>
  );
}
