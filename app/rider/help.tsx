import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function RiderHelpScreen() {
  const router = useRouter();

  const helpOptions = [
    {
      id: 1,
      icon: MessageSquare,
      title: 'Contact Support',
      desc: 'Chat with admin or shop support',
      color: Colors.primary,
      bgColor: Colors.primaryFaded,
    },
    {
      id: 2,
      icon: AlertCircle,
      title: 'Report Delivery Issue',
      desc: 'Report any issues during delivery',
      color: Colors.error,
      bgColor: Colors.errorLight,
    },
    {
      id: 3,
      icon: HelpCircle,
      title: 'Help Center / FAQ',
      desc: 'Browse frequently asked questions',
      color: Colors.info,
      bgColor: Colors.infoLight,
    },
  ];

  const handleHelpOption = (id: number) => {
    // Add navigation logic here based on which help option was selected
    console.log('Help option selected:', id);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>We're here to help!</Text>
          <Text style={styles.introDesc}>
            Choose an option below to get support or find answers to your questions.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {helpOptions.map((option) => {
            const Icon = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.helpCard}
                onPress={() => handleHelpOption(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconBox, { backgroundColor: option.bgColor }]}>
                    <Icon size={24} color={option.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    <Text style={styles.cardDesc}>{option.desc}</Text>
                  </View>
                </View>
                <ChevronLeft size={20} color={Colors.textTertiary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📞 Response Time</Text>
            <Text style={styles.infoText}>
              Admin support typically responds within 2-4 hours. For urgent issues, please call customer service directly.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Common Issues</Text>
            <Text style={styles.infoText}>
              Most common rider issues can be found in our FAQ section. Check there first for quick solutions.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  scroll: { flex: 1 },
  intro: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  introTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  introDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  optionsContainer: { paddingHorizontal: 20, gap: 12 },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  infoSection: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
  infoBox: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginBottom: 6 },
  infoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
