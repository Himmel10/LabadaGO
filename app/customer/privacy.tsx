import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/customer/profile')} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.sectionText}>
            LabadaGO ("we" or "us" or "our") operates the LabadaGO mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information Collection and Use</Text>
          <Text style={styles.sectionText}>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </Text>
          <Text style={styles.subsectionTitle}>Types of Data Collected:</Text>
          <Text style={styles.bulletPoint}>• Personal Data: Name, email address, phone number, address</Text>
          <Text style={styles.bulletPoint}>• Usage Data: Pages visited, time and duration of visit, and other diagnostic data</Text>
          <Text style={styles.bulletPoint}>• Location Data: We may request location information with your consent</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use of Data</Text>
          <Text style={styles.sectionText}>
            LabadaGO uses the collected data for various purposes:
          </Text>
          <Text style={styles.bulletPoint}>• To provide and maintain our Service</Text>
          <Text style={styles.bulletPoint}>• To notify you about changes to our Service</Text>
          <Text style={styles.bulletPoint}>• To process your transactions</Text>
          <Text style={styles.bulletPoint}>• To support your customer service inquiries</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Security of Data</Text>
          <Text style={styles.sectionText}>
            The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Changes to This Privacy Policy</Text>
          <Text style={styles.sectionText}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about this Privacy Policy, please contact us at privacy@labadago.com
          </Text>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  subsectionTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginTop: 10, marginBottom: 6 },
  sectionText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 8 },
  bulletPoint: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginLeft: 8, marginBottom: 6 },
});
