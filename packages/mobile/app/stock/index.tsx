import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

const columns = ["Sr.", "Product", "HSN", "Qty", "Unit", "MFG", "Exp"];

export default function StockScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Stock Register</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Add Product</Text>
        </Pressable>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {columns.map((col) => (
            <Text key={col} style={styles.headerCell}>
              {col}
            </Text>
          ))}
        </View>
        <Text style={styles.empty}>No products yet. Connect Supabase to add stock.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#14532d" },
  button: {
    backgroundColor: "#166534",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  table: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f0fdf4",
    padding: 12,
    gap: 8,
  },
  headerCell: { fontSize: 12, fontWeight: "600", color: "#166534", minWidth: 40 },
  empty: { padding: 24, textAlign: "center", color: "#15803d", fontSize: 14 },
});
