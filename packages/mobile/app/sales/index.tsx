import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SalesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Sale</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Name & Address</Text>
        <Text style={styles.placeholder}>Customer fields — Phase 2</Text>
      </View>

      <View style={styles.table}>
        <Text style={styles.tableTitle}>Line Items</Text>
        <Text style={styles.empty}>Add products after connecting Supabase.</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Total Amount</Text>
          <Text style={styles.amount}>₹0.00</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Received Amount</Text>
          <Text style={styles.amount}>₹0.00</Text>
        </View>
        <View style={[styles.summaryRow, styles.balanceRow]}>
          <Text style={styles.balanceLabel}>Balance Amount</Text>
          <Text style={styles.balanceAmount}>₹0.00</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#14532d" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#166534", marginBottom: 8 },
  placeholder: { fontSize: 13, color: "#9ca3af" },
  table: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 16,
  },
  tableTitle: { fontSize: 14, fontWeight: "600", color: "#166534", marginBottom: 8 },
  empty: { fontSize: 13, color: "#15803d", textAlign: "center", paddingVertical: 16 },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 16,
    gap: 8,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  amount: { fontWeight: "500" },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: "#bbf7d0",
    paddingTop: 8,
    marginTop: 4,
  },
  balanceLabel: { fontWeight: "600" },
  balanceAmount: { fontWeight: "700", color: "#166534" },
});
