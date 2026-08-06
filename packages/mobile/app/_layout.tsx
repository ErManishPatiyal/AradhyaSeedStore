import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AppHeader } from "@/components/AppHeader";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.stackWrapper}>
        <Stack screenOptions={{ headerShown: false, contentStyle: styles.content }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faf8",
  },
  stackWrapper: {
    flex: 1,
  },
  content: {
    backgroundColor: "#f8faf8",
  },
});
