# Clay Morphism Code Snippets Reference

Quick copy-paste solutions for common UI elements.

---

## 🎨 Colors Import

Always start with:
```tsx
import { Colors } from '@/constants/colors';
import { ClayMorphism, ClayMorphismStyles } from '@/constants/clayMorphism';
```

---

## 🔘 Buttons

### Primary Button
```tsx
<TouchableOpacity style={ClayMorphism.button(Colors.primary, 'medium')}>
  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.white }}>
    Press Me
  </Text>
</TouchableOpacity>
```

### Accent Button
```tsx
<TouchableOpacity style={ClayMorphism.button(Colors.accent, 'medium')}>
  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.white }}>
    Action
  </Text>
</TouchableOpacity>
```

### Ghost Button (No Background)
```tsx
<TouchableOpacity
  style={{
    ...ClayMorphism.shadow.soft,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  }}
>
  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primary }}>
    Ghost Button
  </Text>
</TouchableOpacity>
```

---

## 📝 Input Fields

### Text Input
```tsx
<TextInput
  style={ClayMorphism.input()}
  placeholder="Enter text..."
  placeholderTextColor={Colors.textTertiary}
/>
```

### Outlined Container Input
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', ...ClayMorphism.input() }}>
  <Icon size={20} color={Colors.textSecondary} />
  <TextInput
    style={{ flex: 1, marginLeft: 12, fontSize: 16, color: Colors.text }}
    placeholder="Search..."
    placeholderTextColor={Colors.textTertiary}
  />
</View>
```

### Large Input
```tsx
<TextInput
  style={{
    ...ClayMorphism.input(),
    minHeight: 120,
    textAlignVertical: 'top',
  }}
  multiline
  placeholder="Type your message..."
  placeholderTextColor={Colors.textTertiary}
/>
```

---

## 🎴 Cards

### Simple Card
```tsx
<View style={ClayMorphism.card('medium')}>
  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>
    Title
  </Text>
  <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>
    Subtitle or description
  </Text>
</View>
```

### Card with Image
```tsx
<View style={ClayMorphism.card('medium')}>
  <Image
    source={{ uri: 'https://...' }}
    style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 12 }}
  />
  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>
    Title
  </Text>
</View>
```

### Card Row (Horizontal)
```tsx
<View style={{ flexDirection: 'row', gap: 12 }}>
  <View style={[ClayMorphism.card('soft'), { flex: 1 }]}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>
      123
    </Text>
    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
      Label
    </Text>
  </View>
  <View style={[ClayMorphism.card('soft'), { flex: 1 }]}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.success }}>
      456
    </Text>
    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
      Label
    </Text>
  </View>
</View>
```

---

## 🎭 Modals / Bottom Sheets

### Modal Container
```tsx
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 60, 53, 0.5)', // Clay shadow color with opacity
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 24,
    ...ClayMorphism.shadow.large,
  }
});

<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* Your content */}
    </View>
  </View>
</Modal>
```

---

## 🎯 List Items

### Simple List Item
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', ...ClayMorphism.card('soft'), marginBottom: 8 }}>
  <View style={ClayMorphism.iconWrapper(44, Colors.primaryFaded)}>
    <Icon size={24} color={Colors.primary} />
  </View>
  <View style={{ flex: 1, marginLeft: 12 }}>
    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>
      Item Title
    </Text>
    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
      Subtitle
    </Text>
  </View>
</View>
```

### List Item with Action
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, ...ClayMorphism.card('soft'), marginBottom: 8 }}>
  {/* Left content */}
  <View style={{ flex: 1 }}>
    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>
      Item
    </Text>
  </View>
  {/* Right action */}
  <TouchableOpacity>
    <ChevronRight size={24} color={Colors.textSecondary} />
  </TouchableOpacity>
</View>
```

---

## 🔖 Chips / Badges

### Outlined Chip
```tsx
<TouchableOpacity style={{ ...ClayMorphism.chip(Colors.primaryFaded), alignSelf: 'flex-start' }}>
  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primary }}>
    Filter
  </Text>
</TouchableOpacity>
```

### Filled Badge
```tsx
<View style={{
  backgroundColor: Colors.primary,
  borderRadius: ClayMorphism.borderRadius.full,
  paddingHorizontal: 12,
  paddingVertical: 6,
  alignSelf: 'flex-start',
}}>
  <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>
    Active
  </Text>
</View>
```

### Status Badge
```tsx
<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: Colors.successLight,
  borderRadius: ClayMorphism.borderRadius.full,
  paddingHorizontal: 12,
  paddingVertical: 6,
}}>
  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
  <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.success }}>
    Delivered
  </Text>
</View>
```

---

## 🖼️ Icon Wrappers

### Square Icon
```tsx
<View style={ClayMorphism.iconWrapper(48, Colors.primaryFaded)}>
  <Icon size={24} color={Colors.primary} />
</View>
```

### Circular Icon
```tsx
<View style={{
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: Colors.primaryFaded,
  justifyContent: 'center',
  alignItems: 'center',
  ...ClayMorphism.shadow.soft,
}}>
  <Icon size={24} color={Colors.primary} />
</View>
```

### Icon with Accent
```tsx
<View style={ClayMorphism.iconWrapper(56, Colors.accentLight)}>
  <Icon size={24} color={Colors.accent} />
</View>
```

---

## 📊 Grid Layouts

### 2-Column Grid
```tsx
<View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
  <View style={[ClayMorphism.card('soft'), { flex: 1, alignItems: 'center' }]}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>
      123
    </Text>
    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
      Label
    </Text>
  </View>
  <View style={[ClayMorphism.card('soft'), { flex: 1, alignItems: 'center' }]}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.success }}>
      456
    </Text>
    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
      Label
    </Text>
  </View>
</View>
```

### 3-Column Grid
```tsx
<View style={{ flexDirection: 'row', gap: 8 }}>
  {[1, 2, 3].map((item) => (
    <View key={item} style={[ClayMorphism.card('soft'), { flex: 1, alignItems: 'center' }]}>
      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>
        {item}
      </Text>
    </View>
  ))}
</View>
```

---

## 📍 Headers

### Simple Header
```tsx
<View style={{ backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
  <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text }}>
    Title
  </Text>
</View>
```

### Header with Subtitle
```tsx
<View style={{ backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 16 }}>
  <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '500' }}>
    SUBTITLE
  </Text>
  <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text, marginTop: 2 }}>
    Title
  </Text>
</View>
```

### Header with Icon
```tsx
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 12 }}>
  <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.text }}>
    Title
  </Text>
  <TouchableOpacity style={{ padding: 8 }}>
    <Icon size={24} color={Colors.primary} />
  </TouchableOpacity>
</View>
```

---

## ✅ Checkboxes / Toggles

### Custom Checkbox
```tsx
const isChecked = true;

<TouchableOpacity
  style={{
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: isChecked ? Colors.primary : Colors.surface,
    borderWidth: isChecked ? 0 : 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...ClayMorphism.shadow.soft,
  }}
>
  {isChecked && <Check size={16} color={Colors.white} strokeWidth={3} />}
</TouchableOpacity>
```

### Radio Button
```tsx
const isSelected = true;

<View
  style={{
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: isSelected ? Colors.primary : Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...ClayMorphism.shadow.soft,
  }}
>
  {isSelected && (
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
      }}
    />
  )}
</View>
```

---

## 📱 Full Screen Container

### Basic Screen
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClayMorphismStyles, Colors } from '@/constants';

<SafeAreaView style={ClayMorphismStyles.baseContainer}>
  <ScrollView showsVerticalScrollIndicator={false}>
    {/* Your content */}
  </ScrollView>
</SafeAreaView>
```

---

## 🌈 Shadow Selector

Use based on context:

```tsx
// Subtle - backgrounds, faint elements
...ClayMorphism.shadow.soft

// Standard - cards, buttons, main elements
...ClayMorphism.shadow.medium

// Prominent - important cards, highlights
...ClayMorphism.shadow.prominent

// Large - modals, overlays, sidesheets
...ClayMorphism.shadow.large

// Glow - primary colored elements
...ClayMorphism.shadow.primaryGlow
```

---

## 🎨 Color Selector

```tsx
// Warm Primary (Terracotta)
backgroundColor: Colors.primary        // #C17A6B
backgroundColor: Colors.primaryDark    // #9B5E53
backgroundColor: Colors.primaryLight   // #E8B5A6
backgroundColor: Colors.primaryFaded   // #F5E8E4

// Warm Accent (Gold)
backgroundColor: Colors.accent         // #D4AF6B
backgroundColor: Colors.accentLight    // #F0E5D5

// Base Colors
backgroundColor: Colors.background     // #F5F1ED (main bg)
backgroundColor: Colors.surface        // #FAF8F6 (cards)
backgroundColor: Colors.card           // #FFFBF8 (overlay)

// Text Colors
color: Colors.text                      // #4A3C35 (primary text)
color: Colors.textSecondary             // #8B7E75 (secondary)
color: Colors.textTertiary              // #B5A89D (tertiary)

// Status Colors
backgroundColor: Colors.success         // #9BA89A (sage)
backgroundColor: Colors.error           // #A8735F (rust)
backgroundColor: Colors.warning         // #D4995D (amber)
```

---

## 💾 Copy-Paste StyleSheet Template

```tsx
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { ClayMorphism } from '@/constants/clayMorphism';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Cards
  card: {
    ...ClayMorphism.card('medium'),
    marginBottom: 12,
  },

  // Buttons
  button: {
    ...ClayMorphism.button(Colors.primary, 'medium'),
    marginTop: 16,
  },

  // Inputs
  input: {
    ...ClayMorphism.input(),
    marginBottom: 12,
  },

  // Text
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    ...ClayMorphism.card('soft'),
    marginBottom: 8,
  },

  // Icons
  icon: ClayMorphism.iconWrapper(48, Colors.primaryFaded),
});

export default styles;
```

---

## 🚀 Ready to Implement!

Copy these snippets into your components and customize as needed. All colors automatically update when using the Colors constant!
