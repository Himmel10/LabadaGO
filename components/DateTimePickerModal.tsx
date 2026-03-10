import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Platform } from 'react-native';
import { Calendar, Clock, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface DateTimePickerModalProps {
  visible: boolean;
  selectedDate: Date | null;
  onDateTimeSelected: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
}

export default function DateTimePickerModal({
  visible,
  selectedDate,
  onDateTimeSelected,
  onClose,
  minDate = new Date(),
}: DateTimePickerModalProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || minDate);
  const [selectedHour, setSelectedHour] = useState(selectedDate?.getHours() || 9);
  const [selectedMinute, setSelectedMinute] = useState(selectedDate?.getMinutes() || 0);

  const handleDateChange = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate >= minDate) {
      setCurrentDate(newDate);
    }
  };

  const handleConfirm = () => {
    const finalDate = new Date(currentDate);
    finalDate.setHours(selectedHour, selectedMinute, 0);
    onDateTimeSelected(finalDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Pickup Date & Time</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <View style={styles.dateSelector}>
                <TouchableOpacity onPress={() => handleDateChange(-1)} style={styles.dateNavBtn}>
                  <Text style={styles.dateNavBtnText}>‹ Prev</Text>
                </TouchableOpacity>

                <View style={styles.selectedDateDisplay}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.selectedDateText}>{formatDate(currentDate)}</Text>
                </View>

                <TouchableOpacity onPress={() => handleDateChange(1)} style={styles.dateNavBtn}>
                  <Text style={styles.dateNavBtnText}>Next ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time</Text>

              {/* Hour and Minute Selection */}
              <View style={styles.timePickerRow}>
                <View style={styles.timePickerColumn}>
                  <Text style={styles.timePickerLabel}>Hour</Text>
                  <ScrollView
                    style={styles.timeScroller}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[styles.timeOption, selectedHour === hour && styles.timeOptionActive]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            selectedHour === hour && styles.timeOptionTextActive,
                          ]}
                        >
                          {String(hour).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.timePickerColumn}>
                  <Text style={styles.timePickerLabel}>Minute</Text>
                  <ScrollView
                    style={styles.timeScroller}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[styles.timeOption, selectedMinute === minute && styles.timeOptionActive]}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            selectedMinute === minute && styles.timeOptionTextActive,
                          ]}
                        >
                          {String(minute).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Time Display */}
              <View style={styles.selectedTimeDisplay}>
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.selectedTimeText}>
                  {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dateNavBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateNavBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  selectedDateDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryFaded,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primaryDark,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timePickerColumn: {
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  timeScroller: {
    height: 120,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeOptionActive: {
    backgroundColor: Colors.primaryFaded + '40',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  timeOptionTextActive: {
    color: Colors.primary,
  },
  selectedTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryFaded,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
