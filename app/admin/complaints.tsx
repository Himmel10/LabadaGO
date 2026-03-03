import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircleWarning, AlertCircle, Clock, CheckCircle } from 'lucide-react-native';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  open: { color: Colors.error, bg: Colors.errorLight, icon: AlertCircle },
  in_progress: { color: Colors.warning, bg: Colors.warningLight, icon: Clock },
  resolved: { color: Colors.success, bg: Colors.successLight, icon: CheckCircle },
};

export default function AdminComplaintsScreen() {
  const { complaints, updateComplaintStatus } = useOrders();

  const handleResolve = (id: string) => {
    Alert.alert('Resolve Complaint', 'Mark this complaint as resolved?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resolve', onPress: () => updateComplaintStatus(id, 'resolved') },
    ]);
  };

  const handleInProgress = (id: string) => {
    Alert.alert('Update Status', 'Mark this complaint as in progress?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateComplaintStatus(id, 'in_progress') },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Complaints</Text>
        <Text style={styles.subtitle}>{complaints.filter((c) => c.status === 'open').length} open</Text>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {complaints.map((complaint) => {
          const config = STATUS_CONFIG[complaint.status] ?? STATUS_CONFIG.open;
          const StatusIcon = config.icon;
          return (
            <View key={complaint.id} style={styles.complaintCard}>
              <View style={styles.complaintTop}>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <StatusIcon size={14} color={config.color} />
                  <Text style={[styles.statusText, { color: config.color }]}>
                    {complaint.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.dateText}>{new Date(complaint.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.subject}>{complaint.subject}</Text>
              <Text style={styles.message}>{complaint.message}</Text>
              <View style={styles.complaintBottom}>
                <Text style={styles.userName}>By: {complaint.userName}</Text>
                <View style={styles.actionBtns}>
                  {complaint.status === 'open' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: Colors.warningLight }]}
                      onPress={() => handleInProgress(complaint.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.actionBtnText, { color: Colors.warning }]}>In Progress</Text>
                    </TouchableOpacity>
                  )}
                  {complaint.status !== 'resolved' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: Colors.primaryFaded }]}
                      onPress={() => handleResolve(complaint.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {complaints.length === 0 && (
          <View style={styles.empty}>
            <MessageCircleWarning size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No complaints</Text>
            <Text style={styles.emptyText}>All clear!</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, paddingHorizontal: 20, marginTop: 2 },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  complaintCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  complaintTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  dateText: { fontSize: 11, color: Colors.textTertiary },
  subject: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  message: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  complaintBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 13, color: Colors.textTertiary },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: '700' as const },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
