import { ThemedView } from "@/components/themed-view";

import React from "react";
import { StyleSheet } from "react-native";
export default function MapScreen() {
  return <ThemedView style={styles.container}></ThemedView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
