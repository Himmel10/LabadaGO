import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I book a laundry service?',
    answer: 'Select a laundry shop, choose your preferred service, schedule a pickup time, and confirm payment. Our riders will pick up your clothes at the scheduled time.',
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept GCash, PayMaya, credit/debit cards, and Cash on Delivery (COD) for your convenience.',
  },
  {
    id: '3',
    question: 'How long does laundry processing take?',
    answer: 'Processing time varies by service type, typically 24-48 hours. You can check estimated delivery in your order details.',
  },
  {
    id: '4',
    question: 'Can I track my order?',
    answer: 'Yes! You can track your order in real-time from pickup to delivery using the order tracking feature in the app.',
  },
  {
    id: '5',
    question: 'What should I do if my clothes are damaged?',
    answer: 'Please contact support within 24 hours of delivery with photos. Our team will assist you with a resolution.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/customer/profile')} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.faqItem}
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.questionHeader}>
                <Text style={styles.question}>{item.question}</Text>
                <ChevronDown
                  size={20}
                  color={Colors.primary}
                  style={{ transform: [{ rotate: expandedId === item.id ? '180deg' : '0deg' }] }}
                />
              </View>
              {expandedId === item.id && <Text style={styles.answer}>{item.answer}</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>Contact our support team at support@labadago.com or call us at 1-800-LABADA</Text>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.textTertiary, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 12 },
  faqList: { gap: 10, marginBottom: 20 },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  answer: { fontSize: 14, color: Colors.textSecondary, marginTop: 12, lineHeight: 20 },
  supportCard: {
    backgroundColor: Colors.primaryFaded,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  supportTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.primary, marginBottom: 8 },
  supportText: { fontSize: 13, color: Colors.primary, lineHeight: 20 },
});
