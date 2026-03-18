import { StyleSheet, ViewStyle } from 'react-native';
import { Colors } from './colors';

/**
 * Clay Morphism UIDesign System
 * Soft, rounded, organic shapes with warm earth tones
 * Characterized by soft shadows and clay-like appearance
 */

export const ClayMorphism = {
  // Border Radius
  borderRadius: {
    small: 12,
    medium: 18,
    large: 24,
    xl: 32,
    full: 50,
  },

  // Soft Shadow Styles (Multiple layers for depth)
  shadow: {
    // Subtle elevation
    soft: {
      shadowColor: Colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },

    // Medium elevation
    medium: {
      shadowColor: Colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
    },

    // Prominent elevation
    prominent: {
      shadowColor: Colors.text,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },

    // Large elevation for modals/cards
    large: {
      shadowColor: Colors.text,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },

    // Primary color shadow (subtle glow)
    primaryGlow: {
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },

    // Inner shadow effect (using border + subtle styling)
    inset: {
      borderWidth: 1,
      borderColor: Colors.surface,
      shadowColor: Colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
  },

  // Clay morphism card style
  card: (shadowLevel: 'soft' | 'medium' | 'prominent' | 'large' = 'soft'): ViewStyle => ({
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    ...ClayMorphism.shadow[shadowLevel],
  }),

  // Clay morphism button style
  button: (backgroundColor = Colors.primary, shadowLevel: 'soft' | 'medium' | 'prominent' | 'large' = 'medium'): ViewStyle => ({
    backgroundColor,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...ClayMorphism.shadow[shadowLevel],
  }),

  // Clay morphism input field
  input: (): ViewStyle => ({
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0,
    ...ClayMorphism.shadow.soft,
  } as any),

  // Clay morphism chip/badge
  chip: (backgroundColor = Colors.primaryFaded, addShadow = false): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor,
      borderRadius: ClayMorphism.borderRadius.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
    };
    return addShadow ? { ...baseStyle, ...ClayMorphism.shadow.soft } : baseStyle;
  },

  // Gradient-like layered effect for cards
  layeredCard: (backgroundColor = Colors.surface): ViewStyle => ({
    backgroundColor,
    borderRadius: 24,
    padding: 16,
    ...ClayMorphism.shadow.soft,
  }),

  // Icon wrapper with subtle shadow
  iconWrapper: (size = 44, backgroundColor = Colors.primaryFaded): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    ...ClayMorphism.shadow.soft,
  }),

  // Soft border style
  softBorder: (borderColor = Colors.border, width = 1): ViewStyle => ({
    borderWidth: width,
    borderColor,
    borderRadius: ClayMorphism.borderRadius.medium,
  }),
};

export const ClayMorphismStyles = StyleSheet.create({
  // Reusable base container
  baseContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Card base
  baseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    ...ClayMorphism.shadow.soft,
  },

  // Button base
  baseButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...ClayMorphism.shadow.medium,
  },

  // Input base
  baseInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    ...ClayMorphism.shadow.soft,
  },

  // Header safe area
  headerSafe: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Subtle divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
});
