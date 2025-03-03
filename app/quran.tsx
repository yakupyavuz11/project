import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "./context/ThemeContext";    

const Quran = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text.primary }]}>Çok Yakında</Text>
    </View>
  );
};

export default Quran;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
