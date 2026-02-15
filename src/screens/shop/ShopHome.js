import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ShopHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Laundry Shop Home</Text>
      <Text>Manage orders, services, and shop profile here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
