import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function BookScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Book Laundry</Text>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ShoppingBag size={40} color={Colors.primary} />
          <Text style={styles.cardTitle}>Ready to book?</Text>
          <Text style={styles.cardSubtitle}>Choose a shop, select your service, and schedule a pickup.</Text>
          
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push('/book-laundry' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Start Booking</Text>
            <ChevronRight size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>How it works:</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Choose a Shop</Text>
              <Text style={styles.stepDesc}>Browse nearby laundry shops</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Select Service</Text>
              <Text style={styles.stepDesc}>Pick wash & fold, dry clean, or more</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Schedule Pickup</Text>
              <Text style={styles.stepDesc}>Choose your preferred time</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Confirm & Pay</Text>
              <Text style={styles.stepDesc}>Complete your booking</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, alignItems: 'center', gap: 12, marginBottom: 24, borderWidth: 1, borderColor: Colors.borderLight },
  cardTitle: { fontSize: 18, fontWeight: '800' as const, color: Colors.text },
  cardSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' as const },
  bookButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8, justifyContent: 'center', width: '100%' },
  bookButtonText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
  stepsContainer: { gap: 12, marginBottom: 20 },
  stepsTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Colors.white, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryFaded, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: 14, fontWeight: '800' as const, color: Colors.primary },
  stepTitle: { fontSize: 13, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: Colors.textSecondary },
});


