import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { STORE_INFO } from "@aradhya/shared";

const quickLinks = [
  {
    href: "/stock" as const,
    title: "Stock Register",
    description: "View and manage seed inventory",
  },
  {
    href: "/sales" as const,
    title: "New Sale",
    description: "Create customer bill with payment tracking",
  },
  {
    href: "/customers" as const,
    title: "Customers",
    description: "Customer list and outstanding balance",
  },
];

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to {STORE_INFO.name}</Text>

      {quickLinks.map((link) => (
        <Link key={link.href} href={link.href} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{link.title}</Text>
            <Text style={styles.cardDesc}>{link.description}</Text>
          </Pressable>
        </Link>
      ))}

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Scaffold Status</Text>
        <Text style={styles.bannerText}>
          Phase 1 scaffold — UI placeholders only. Set EXPO_PUBLIC_ Supabase env vars to
          enable data.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#14532d" },
  subtitle: { fontSize: 14, color: "#15803d", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#166534" },
  cardDesc: { fontSize: 13, color: "#15803d", marginTop: 4 },
  banner: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 16,
    marginTop: 8,
  },
  bannerTitle: { fontSize: 14, fontWeight: "600", color: "#92400e" },
  bannerText: { fontSize: 13, color: "#a16207", marginTop: 4 },
});
