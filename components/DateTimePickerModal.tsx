import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
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
  const [displayMonth, setDisplayMonth] = useState(new Date(selectedDate || minDate));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleMonthChange = (direction: number) => {
    const newMonth = new Date(displayMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setDisplayMonth(newMonth);
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(displayMonth);
    selected.setDate(day);
    if (selected >= minDate) {
      setCurrentDate(selected);
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleConfirm = () => {
    const finalDate = new Date(currentDate);
    finalDate.setHours(9, 0, 0);
    onDateTimeSelected(finalDate);
    onClose();
  };

  const calendarDays = [];
  const firstDay = getFirstDayOfMonth(displayMonth);
  const daysInMonth = getDaysInMonth(displayMonth);

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Pickup Date</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Date Selection - Calendar */}
            <View style={styles.section}>
              <View style={styles.monthHeader}>
                <TouchableOpacity 
                  onPress={() => handleMonthChange(-1)} 
                  style={styles.monthNavBtn}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={20} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{formatMonth(displayMonth)}</Text>
                <TouchableOpacity 
                  onPress={() => handleMonthChange(1)} 
                  style={styles.monthNavBtn}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Weekday Labels */}
              <View style={styles.weekdayRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.weekdayLabel}>{day}</Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  const isSelected = day && new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day).toDateString() === currentDate.toDateString();
                  const isDisabled = !day || new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day) < minDate;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        isSelected ? styles.calendarDaySelected : null,
                        isDisabled ? styles.calendarDayDisabled : null,
                      ]}
                      onPress={() => day && handleSelectDate(day)}
                      disabled={isDisabled}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isSelected ? styles.calendarDayTextSelected : null,
                        isDisabled ? styles.calendarDayTextDisabled : null,
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Date Display */}
              <TouchableOpacity 
                style={styles.selectedDateBadge}
                onPress={() => setCurrentDate(new Date())}
                activeOpacity={0.7}
              >
                <Calendar size={16} color={Colors.primary} />
                <Text style={styles.selectedDateText}>{formatDate(currentDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onClose} 
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmBtn} 
              onPress={handleConfirm} 
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>Confirm</Text>
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
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primaryFaded + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  calendarDayTextSelected: {
    color: Colors.white,
  },
  calendarDayTextDisabled: {
    color: Colors.textTertiary,
  },
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeField: {
    width: 50,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: 4,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  input: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    paddingVertical: 4,
    width: 50,
  },
  separator: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
