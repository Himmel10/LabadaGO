# 🎨 Clay Morphism UI Design Guide - LabadaGO

## Overview

Clay Morphism is a modern UI design trend featuring soft, rounded, organic shapes with warm earthy tones and soft shadows. Your LabadaGO app has been updated to use this design system for a more sophisticated, inviting appearance.

## Key Characteristics

### Color Palette (Warm & Earthy)
- **Primary**: Warm Terracotta (#C17A6B) - Main brand color
- **Accent**: Warm Gold (#D4AF6B) - Highlights and CTAs
- **Background**: Warm Cream (#F5F1ED) - App background
- **Surface**: Off-white (#FAF8F6) - Cards and panels
- **Text**: Warm Dark Brown (#4A3C35) - Primary text
- **Borders**: Soft Beige (#E8DFD6) - Subtle dividers

### Shadow System
Clay Morphism uses **layered, soft shadows** instead of harsh shadows:
```tsx
// Soft shadow for subtle elevation
{
  shadowColor: '#4A3C35',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
}

// Medium shadow for cards
{
  shadowColor: '#4A3C35',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 5,
}
```

### Border Radius
All shapes use generous border radius for organic feel:
- Small: 12px
- Medium: 18px
- Large: 24px
- Extra Large: 32px
- Full Circle: 50px

## Usage

### 1. Colors
```tsx
import { Colors } from '@/constants/colors';

// Use new clay colors throughout
<View style={{ backgroundColor: Colors.primary }}>
  <Text style={{ color: Colors.text }}>Welcome</Text>
</View>
```

### 2. Clay Morphism Utility Functions
```tsx
import { ClayMorphism, ClayMorphismStyles } from '@/constants/clayMorphism';

// Card with soft shadow
<View style={ClayMorphism.card('soft')}>
  {/* content */}
</View>

// Button
<TouchableOpacity style={ClayMorphism.button(Colors.primary, 'medium')}>
  <Text>Click Me</Text>
</TouchableOpacity>

// Input field
<TextInput style={ClayMorphism.input()} placeholder="Enter text..." />

// Icon wrapper
<View style={ClayMorphism.iconWrapper(48, Colors.primaryFaded)}>
  <Icon />
</View>
```

### 3. Styling Components
When updating components, replace harsh shadows with clay morphism shadows:

**Before:**
```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  }
});
```

**After:**
```tsx
import { ClayMorphism, Colors } from '@/constants';

const styles = StyleSheet.create({
  card: {
    ...ClayMorphism.card('soft'), // or 'medium', 'prominent'
  }
});
```

### 4. Payment Icons
The payment icons are now styled with clay morphism gradients and colors:
- GCash: Warm Gold/Bronze
- PayMaya: Warm Terracotta
- Card: Rust Brown
- COD: Sage Green

```tsx
import { GCashIcon, PayMayaIcon, CardIcon, CODIcon } from '@/components/PaymentIcons';

<GCashIcon size={32} />
<PayMayaIcon size={32} />
<CardIcon size={32} />
<CODIcon size={32} />
```

## Implementation Roadmap

### Priority 1: Core Components
- [ ] Update all buttons to use `ClayMorphism.button()`
- [ ] Update all cards to use `ClayMorphism.card()`
- [ ] Update all inputs to use `ClayMorphism.input()`
- [ ] Update all modals with soft shadows

### Priority 2: Navigation & Headers
- [ ] Update header styling with soft shadows
- [ ] Update tab bars with clay morphism design
- [ ] Update bottom sheets with rounded corners

### Priority 3: Role-based Screens
- [ ] Customer app screens
- [ ] Rider app screens
- [ ] Shop Owner app screens
- [ ] Admin app screens

### Priority 4: Details & Polish
- [ ] Update icons to match color palette
- [ ] Adjust spacing and typography
- [ ] Add gradient subtleties where appropriate
- [ ] Animate transitions smoothly

## Quick Reference: Shadow Levels

| Level | Usage | Elevation |
|-------|-------|-----------|
| **soft** | Subtle elements, backgrounds | 3 |
| **medium** | Cards, buttons, inputs | 5 |
| **prominent** | Important cards, highlights | 8 |
| **large** | Modals, overlays | 12 |
| **primaryGlow** | Primary buttons, highlights | 5 |

## Color Constants

```tsx
// Primary - Warm Terracotta (Main Brand)
Colors.primary        = '#C17A6B'
Colors.primaryDark    = '#9B5E53'
Colors.primaryLight   = '#E8B5A6'
Colors.primaryFaded   = '#F5E8E4'

// Accent - Warm Gold (CTAs & Highlights)
Colors.accent         = '#D4AF6B'
Colors.accentLight    = '#F0E5D5'

// Status Colors (Warm Tones)
Colors.success        = '#9BA89A'  // Sage Green
Colors.successLight   = '#E1E5E0'

Colors.warning        = '#D4995D'  // Warm Amber
Colors.warningLight   = '#F0DDD4'

Colors.error          = '#A8735F'  // Muted Rust
Colors.errorLight     = '#E8D7D0'

// Base Colors
Colors.background     = '#F5F1ED'  // Warm Cream
Colors.surface        = '#FAF8F6'  // Off-white
Colors.text           = '#4A3C35'  // Warm Dark Brown
Colors.textSecondary  = '#8B7E75'  // Medium Brown
Colors.textTertiary   = '#B5A89D'  // Light Brown
Colors.border         = '#E8DFD6'  // Soft Beige
```

## Example: Converting a Card

### Original (Harsh Shadows)
```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  }
});
```

### Updated (Clay Morphism)
```tsx
import { ClayMorphism, Colors } from '@/constants';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,  // More rounded
    padding: 16,
    ...ClayMorphism.shadow.medium,
    // No harsh border needed
  }
});
```

## Tips for Success

1. **Increase Border Radius**: Change from 8-12px to 18-24px
2. **Soften Shadows**: Reduce opacity and increase blur radius
3. **Use Warm Colors**: Replace stark blues/greens with warm earth tones
4. **Simplify Borders**: Remove 1px borders in favor of soft shadows
5. **Add Breathing Room**: Increase padding slightly for organic feel
6. **Consistent Spacing**: Use multiples of 4 for spacing (4, 8, 12, 16, 20, 24...)

## Animation Tips

Keep animations smooth and organic:
```tsx
// Smooth spring animation
Animated.spring(value, {
  toValue: 1,
  useNativeDriver: true,
  friction: 8,
  tension: 60,
}).start();
```

## Testing

After implementing Clay Morphism:
1. Check all shadows render correctly on Android (elevation) and iOS (shadowColor)
2. Verify color contrast (WCAG AA compliance)
3. Test on different screen sizes
4. Verify touch targets are at least 44x44 points

## Resources

- Colors: `constants/colors.ts`
- Utilities: `constants/clayMorphism.ts`
- Payment Icons: `components/PaymentIcons.tsx`

## Questions?

Refer to Clay Morphism design principles:
- Organic shapes (high border radius)
- Soft shadows (layered, low opacity)
- Warm color palette (earth tones)
- Friendly, inviting appearance
