import { StyleSheet } from "react-native";

export const appShadows = StyleSheet.create({
  homeCard: {
    shadowColor: "#22304A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  surfaceCard: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  softButton: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoutModal: {
    shadowColor: "#1B2431",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 4, height: 4 },
    elevation: 2,
  },
});
