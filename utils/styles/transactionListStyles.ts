import { colors } from "@/constants/theme";
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    headerContainer: {
      marginBottom: 16,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      color: "white",
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    countBadge: {
      backgroundColor: colors.primary || "#3b82f6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 24,
      alignItems: "center",
    },
    countText: {
      color: "black",
      fontSize: 12,
      fontWeight: "600",
    },
    seeAllText: {
      color: colors.primary || "white",
      fontSize: 12,
      fontWeight: "600",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 200,
    },
    loadingContainer: {
      alignItems: "center",
      padding: 32,
      backgroundColor: "#1a1a1a",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#2a2a2a",
    },
    loadingText: {
      color: "#888",
      fontSize: 16,
      fontWeight: "500",
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 48,
      minHeight: 300,
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#1a1a1a",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 2,
      borderColor: "#2a2a2a",
    },
    emptyTitle: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 8,
      textAlign: "center",
    },
    emptyMessage: {
      color: "#888",
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 24,
    },
    emptyActionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#3b82f6",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      shadowColor: "#3b82f6",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    emptyActionText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    listContainer: {
      flex: 1,
      backgroundColor: "#1a1a1a",
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#2a2a2a",
    },
    listContent: {
      paddingVertical: 8,
    },
    itemContainer: {
      backgroundColor: "transparent",
    },
    separator: {
      height: 1,
      backgroundColor: "#2a2a2a",
      marginHorizontal: 16,
    },
  });
  