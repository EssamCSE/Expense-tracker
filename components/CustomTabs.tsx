import React from 'react';
import { View, Platform, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { 
  House, 
  ChartBar, 
  Wallet, 
  User,
  Home,
  TrendUp,
  CreditCard,
  UserCircle
} from 'phosphor-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CustomTabs: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const tabWidth = containerWidth / state.routes.length;
  const translateX = useSharedValue(state.index * tabWidth);

  React.useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withSpring(state.index * tabWidth, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [state.index, tabWidth, containerWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {/* Animated background indicator */}
      <Animated.View style={[
        styles.indicator, 
        indicatorStyle, 
        { width: tabWidth }
      ]} />
      
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label: string =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel as string
            : options.title !== undefined
            ? options.title
            : route.name;

        // Get the appropriate icon for each tab
        const getTabIcon = (routeName: string, focused: boolean, color: string) => {
          const iconProps = {
            size: 20,
            weight: focused ? 'fill' : 'regular' as any,
            color: color,
          };

          switch (routeName.toLowerCase()) {
            case 'index':
            case 'home':
              return <House {...iconProps} />;
            case 'statistics':
            case 'stats':
              return <ChartBar {...iconProps} />;
            case 'wallet':
              return <Wallet {...iconProps} />;
            case 'profile':
              return <User {...iconProps} />;
            default:
              return <House {...iconProps} />;
          }
        };

        const isFocused = state.index === index;
        
        // Initialize with current state
        const scale = useSharedValue(isFocused ? 1.1 : 0.95);
        const opacity = useSharedValue(isFocused ? 1 : 0.7);

        React.useEffect(() => {
          scale.value = withSpring(isFocused ? 1.05 : 0.98, {
            damping: 12,
            stiffness: 200,
          });
          opacity.value = withTiming(isFocused ? 1 : 0.7, {
            duration: 200,
          });
        }, [isFocused]);

        const animatedStyle = useAnimatedStyle(() => {
          const backgroundColor = interpolateColor(
            opacity.value,
            [0.7, 1],
            ['transparent', 'rgba(163, 230, 53, 0.1)']
          );

          return {
            transform: [{ scale: scale.value }],
            backgroundColor,
          };
        });

        const textAnimatedStyle = useAnimatedStyle(() => {
          const color = interpolateColor(
            opacity.value,
            [0.7, 1],
            ['#737373', '#a3e635']
          );

          return {
            color,
          };
        });

        const iconAnimatedStyle = useAnimatedStyle(() => {
          const color = interpolateColor(
            opacity.value,
            [0.7, 1],
            ['#737373', '#a3e635']
          );

          return {
            color, // This matches the expected property name for color
          };
        });

        const dotAnimatedStyle = useAnimatedStyle(() => {
          return {
            opacity: opacity.value,
            transform: [{ scale: opacity.value }],
          };
        });

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <AnimatedTouchableOpacity
            key={route.key}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabButton, animatedStyle]}
            activeOpacity={0.8}
          >
            {/* Icon container */}
            <View style={styles.iconContainer}>
              {getTabIcon(route.name, isFocused, isFocused ? '#a3e635' : '#737373')}
            </View>
            
            {/* <Animated.Text style={[
              styles.tabLabel, 
              textAnimatedStyle,
              { fontWeight: isFocused ? '600' : '500' }
            ]}>
              {label}
            </Animated.Text> */}
            
            {/* Active dot indicator */}
            {isFocused && (
              <Animated.View style={[styles.activeDot, dotAnimatedStyle]} />
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#171717',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(163, 230, 53, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    backgroundColor: '#a3e635',
    borderRadius: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 1,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#a3e635',
  },
});

export default CustomTabs;