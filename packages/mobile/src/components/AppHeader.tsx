import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { STORE_INFO } from "@aradhya/shared";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/stock", label: "Stock" },
  { href: "/sales", label: "Sales" },
  { href: "/customers", label: "Customers" },
] as const;

export function AppHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.storeName}>{STORE_INFO.name}</Text>
      <Text style={styles.storeMeta}>
        {STORE_INFO.location} · Mob: {STORE_INFO.mobile}
      </Text>
      <View style={styles.nav}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={styles.navButton}>
              <Text style={styles.navText}>{item.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  storeMeta: {
    fontSize: 12,
    color: "#15803d",
    marginTop: 2,
  },
  nav: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f0fdf4",
  },
  navText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#166534",
  },
});
