import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CustomerHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Home</Text>
      <Text>Browse shops, schedule pickup, track orders, and more.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
