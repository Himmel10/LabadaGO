import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { CircleAlert } from 'lucide-react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CircleAlert size={48} color={Colors.textTertiary} />
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>The page you're looking for doesn't exist.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/')} activeOpacity={0.85}>
        <Text style={styles.btnText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '800' as const, color: Colors.text, marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' as const, marginBottom: 24 },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});
