/**
 * EXAMPLE: Clay Morphism Component Implementation
 * 
 * This file demonstrates how to properly implement Clay Morphism styling
 * in your LabadaGO app. Copy this pattern for all your components.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { ClayMorphism, ClayMorphismStyles } from '@/constants/clayMorphism';
import { ArrowRight } from 'lucide-react-native';

export const ClayMorphismExample = () => {
  return (
    <SafeAreaView style={ClayMorphismStyles.baseContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.title}>Clay Morphism</Text>
          <Text style={styles.subtitle}>Modern, Warm & Inviting</Text>
        </View>

        {/* CARD EXAMPLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards</Text>

          {/* Soft Shadow Card */}
          <View style={ClayMorphism.card('soft')}>
            <Text style={styles.cardTitle}>Soft Elevation</Text>
            <Text style={styles.cardText}>Subtle depth for backgrounds</Text>
          </View>

          {/* Medium Shadow Card */}
          <View style={ClayMorphism.card('medium')}>
            <Text style={styles.cardTitle}>Medium Elevation</Text>
            <Text style={styles.cardText}>Standard cards and panels</Text>
          </View>

          {/* Prominent Shadow Card */}
          <View style={ClayMorphism.card('prominent')}>
            <Text style={styles.cardTitle}>Prominent Elevation</Text>
            <Text style={styles.cardText}>Important content highlights</Text>
          </View>
        </View>

        {/* BUTTON EXAMPLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buttons</Text>

          {/* Primary Button */}
          <TouchableOpacity style={ClayMorphism.button(Colors.primary, 'medium')}>
            <Text style={styles.buttonText}>Primary Button</Text>
          </TouchableOpacity>

          {/* Accent Button */}
          <TouchableOpacity style={ClayMorphism.button(Colors.accent, 'medium')}>
            <Text style={styles.buttonText}>Accent Button</Text>
          </TouchableOpacity>

          {/* Success Button */}
          <TouchableOpacity style={ClayMorphism.button(Colors.success, 'medium')}>
            <Text style={styles.buttonText}>Success Button</Text>
          </TouchableOpacity>
        </View>

        {/* INPUT EXAMPLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inputs</Text>

          <View style={ClayMorphism.input()}>
            <Text style={{ color: Colors.textTertiary }}>Input field placeholder</Text>
          </View>

          <View style={[ClayMorphism.input(), { marginTop: 8 }]}>
            <Text style={{ color: Colors.text }}>Entered text here</Text>
          </View>
        </View>

        {/* ICON WRAPPER EXAMPLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon Wrappers</Text>

          <View style={styles.iconRow}>
            <View style={ClayMorphism.iconWrapper(48, Colors.primaryFaded)}>
              <ArrowRight size={24} color={Colors.primary} />
            </View>
            <View style={ClayMorphism.iconWrapper(48, Colors.accentLight)}>
              <ArrowRight size={24} color={Colors.accent} />
            </View>
            <View style={ClayMorphism.iconWrapper(48, Colors.successLight)}>
              <ArrowRight size={24} color={Colors.success} />
            </View>
          </View>
        </View>

        {/* COLOR PALETTE DEMO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>

          <View style={styles.colorGrid}>
            <View style={styles.colorCellContainer}>
              <View style={[styles.colorCell, { backgroundColor: Colors.primary }]} />
              <Text style={styles.colorLabel}>Primary</Text>
            </View>

            <View style={styles.colorCellContainer}>
              <View style={[styles.colorCell, { backgroundColor: Colors.accent }]} />
              <Text style={styles.colorLabel}>Accent</Text>
            </View>

            <View style={styles.colorCellContainer}>
              <View style={[styles.colorCell, { backgroundColor: Colors.success }]} />
              <Text style={styles.colorLabel}>Success</Text>
            </View>

            <View style={styles.colorCellContainer}>
              <View style={[styles.colorCell, { backgroundColor: Colors.warning }]} />
              <Text style={styles.colorLabel}>Warning</Text>
            </View>

            <View style={styles.colorCellContainer}>
              <View style={[styles.colorCell, { backgroundColor: Colors.error }]} />
              <Text style={styles.colorLabel}>Error</Text>
            </View>

            <View style={styles.colorCellContainer}>
              <View style={[styles.colorCell, { backgroundColor: Colors.info }]} />
              <Text style={styles.colorLabel}>Info</Text>
            </View>
          </View>
        </View>

        {/* SHADOW EXAMPLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shadow Levels</Text>

          <View style={[styles.shadowCard, ClayMorphism.shadow.soft]}>
            <Text style={styles.shadowLabel}>Soft Shadow</Text>
          </View>

          <View style={[styles.shadowCard, ClayMorphism.shadow.medium]}>
            <Text style={styles.shadowLabel}>Medium Shadow</Text>
          </View>

          <View style={[styles.shadowCard, ClayMorphism.shadow.prominent]}>
            <Text style={styles.shadowLabel}>Prominent Shadow</Text>
          </View>

          <View style={[styles.shadowCard, ClayMorphism.shadow.large]}>
            <Text style={styles.shadowLabel}>Large Shadow</Text>
          </View>

          <View style={[styles.shadowCard, ClayMorphism.shadow.primaryGlow]}>
            <Text style={styles.shadowLabel}>Primary Glow</Text>
          </View>
        </View>

        {/* USAGE TIPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Implementation Tips</Text>

          <View style={ClayMorphism.card('soft')}>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Import ClayMorphism utilities from constants/clayMorphism.ts</Text>
            </View>

            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Use Colors from constants/colors.ts for consistent theming</Text>
            </View>

            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Border radius should be 18-24px minimum for organic feel</Text>
            </View>

            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Spread shadow objects with ...ClayMorphism.shadow.medium</Text>
            </View>

            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Remove harsh 1px borders - let soft shadows provide depth</Text>
            </View>
          </View>
        </View>

        {/* FOOTER SPACING */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },

  cardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  iconRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  colorCellContainer: {
    alignItems: 'center',
    width: '30%',
  },

  colorCell: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 8,
    ...ClayMorphism.shadow.soft,
  },

  colorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  shadowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
  },

  shadowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  tipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  tipBullet: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 2,
  },

  tipText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
});
