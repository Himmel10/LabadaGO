import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RiderHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider Home</Text>
      <Text>View assigned pickups and deliveries here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
