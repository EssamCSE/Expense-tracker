import { colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0f0f0f",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "#0f0f0f",
      borderBottomWidth: 1,
      borderBottomColor: "#1a1a1a",
    },
    userInfo: {
      flex: 1,
    },
    greeting: {
      color: "#888",
      fontSize: 16,
      fontWeight: "400",
      marginBottom: 4,
    },
    userName: {
      color: "white",
      fontSize: 24,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    searchButton: {
      backgroundColor: "#262626",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    cardContainer: {
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 24,
    },
    transactionContainer: {
      marginHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    seeAllText: {
      color: colors.primary || "#3b82f6",
      fontSize: 14,
      fontWeight: "500",
    },
    fabSpacing: {
      height: 80,
    },
    fabContainer: {
      position: "absolute",
      bottom: 30,
      right: 20,
      zIndex: 1000,
    },
    fab: {
      width: 40,
      height: 40,
      borderRadius: 30,
      backgroundColor: colors.primary || "#3b82f6",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary || "#3b82f6",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    gradientOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      backgroundColor: "transparent",
      borderTopWidth: 1,
      borderTopColor: "#1a1a1a",
    },
  });