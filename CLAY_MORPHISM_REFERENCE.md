# 🎨 Clay Morphism Color & Style Reference Card

## Color Palette at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    WARM TERRACOTTA PRIMARY                      │
│                                                                   │
│   Primary:      #C17A6B  ■■■■■  Main brand color             │
│   Primary Dark: #9B5E53  ■■■■■  Darker variant                │
│   Primary Light:#E8B5A6  ■■■■■  Lighter variant               │
│   Primary Faded:#F5E8E4  ■■■■■  Background variant            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     WARM GOLD ACCENT                             │
│                                                                   │
│   Accent:       #D4AF6B  ■■■■■  CTA & highlights             │
│   Accent Light: #F0E5D5  ■■■■■  Background variant            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STATUS COLORS (WARM)                          │
│                                                                   │
│   Success:      #9BA89A  ■■■■■  Sage green (positive)        │
│   Success Light:#E1E5E0  ■■■■■  Background variant            │
│                                                                   │
│   Warning:      #D4995D  ■■■■■  Warm amber (caution)         │
│   Warning Light:#F0DDD4  ■■■■■  Background variant            │
│                                                                   │
│   Error:        #A8735F  ■■■■■  Muted rust (errors)          │
│   Error Light:  #E8D7D0  ■■■■■  Background variant            │
│                                                                   │
│   Info:         #8FA3A8  ■■■■■  Soft blue-gray (info)        │
│   Info Light:   #E1E8EC  ■■■■■  Background variant            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     BASE COLORS (WARM)                           │
│                                                                   │
│   Background:   #F5F1ED  ■■■■■  Warm cream (main bg)         │
│   Surface:      #FAF8F6  ■■■■■  Off-white (cards)            │
│   Card:         #FFFBF8  ■■■■■  Warm overlay                 │
│                                                                   │
│   Text:         #4A3C35  ■■■■■  Warm dark brown              │
│   Text Sec:     #8B7E75  ■■■■■  Medium brown                 │
│   Text Tert:    #B5A89D  ■■■■■  Light brown                  │
│                                                                   │
│   Border:       #E8DFD6  ■■■■■  Soft beige                   │
│   Border Light: #F0E8E0  ■■■■■  Very light beige             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ROLE-BASED COLORS (ALSO WARM)                       │
│                                                                   │
│   Rider:        #C29D7F  ■■■■■  Warm terracotta              │
│   Rider Light:  #E8D8CC  ■■■■■  Background variant            │
│                                                                   │
│   Shop:         #A8945F  ■■■■■  Warm bronze                  │
│   Shop Light:   #E5DCC0  ■■■■■  Background variant            │
│                                                                   │
│   Admin:        #B36B5E  ■■■■■  Warm rust                    │
│   Admin Light:  #E5CBC0  ■■■■■  Background variant            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Shadow System Reference

```
┌──────────────────────────────────────────────────────────────┐
│                      SHADOW LEVELS                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  SOFT (Subtle)                                              │
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                          │
│  ▌                              ▐  Opacity: 0.08            │
│  ▌  Background elements         ▐  Blur: 6px               │
│  ▌  Subtle depth                ▐  Elevation: 3            │
│  ▌  Light background cards      ▐  Use: rarely used        │
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                                          │
│                                                               │
│⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯│
│                                                               │
│  MEDIUM (Standard)                                          │
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                       │
│  ▌                              ▐  Opacity: 0.12           │
│  ▌  Cards, buttons, inputs      ▐  Blur: 10px              │
│  ▌  Standard elevation          ▐  Elevation: 5            │
│  ▌  Most common use             ▐  Use: default choice    │
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                                       │
│                                                               │
│⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯│
│                                                               │
│  PROMINENT (Strong)                                         │
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                   │
│  ▌                              ▐  Opacity: 0.16           │
│  ▌  Important cards             ▐  Blur: 16px              │
│  ▌  Prominent elements          ▐  Elevation: 8            │
│  ▌  Highlights & emphasis       ▐  Use: key elements      │
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                                   │
│                                                               │
│⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯│
│                                                               │
│  LARGE (Maximum)                                            │
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                               │
│  ▌                              ▐  Opacity: 0.20           │
│  ▌  Modals & overlays           ▐  Blur: 24px              │
│  ▌  Maximum elevation           ▐  Elevation: 12           │
│  ▌  Fullscreen components       ▐  Use: modals only       │
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                               │
│                                                               │
│⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯│
│                                                               │
│  PRIMARY GLOW (Colored)                                     │
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                        │
│  ▌                              ▐  Color: Primary           │
│  ▌  Primary button glow         ▐  Opacity: 0.15           │
│  ▌  Emphasized elements         ▐  Blur: 12px              │
│  ▌  Soft colored shadow         ▐  Use: primaries         │
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Border Radius Guide

```
┌─────────────────────────────────┐
│   SMALL: 12px                   │
│  ┌─────────────────────────┐    │
│  │ Buttons, small icons    │    │
│  │ Input fields            │    │
│  │ Minor elements          │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘

┌──────────────────────────────────┐
│   MEDIUM: 18px                   │
│  ┌──────────────────────────┐    │
│  │ List items               │    │
│  │ Medium cards             │    │
│  │ Icon wrappers            │    │
│  └──────────────────────────┘    │
└──────────────────────────────────┘

┌───────────────────────────────────┐
│   LARGE: 24px                     │
│  ┌───────────────────────────┐    │
│  │ Feature cards             │    │
│  │ Large buttons             │    │
│  │ Prominent modals          │    │
│  └───────────────────────────┘    │
└───────────────────────────────────┘

┌────────────────────────────────────┐
│   EXTRA LARGE: 32px                │
│  ┌────────────────────────────┐    │
│  │ Extra large modals         │    │
│  │ Hero sections              │    │
│  │ Fullscreen overlays        │    │
│  └────────────────────────────┘    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   FULL CIRCLE: 50%                 │
│  ┌────────────────────────────┐    │
│  │        ○ ○ ○              │    │
│  │      ○       ○            │    │
│  │     ○         ○           │    │
│  │      ○       ○            │    │
│  │        ○ ○ ○              │    │
│  └────────────────────────────┘    │
└────────────────────────────────────┘
```

---

## Quick Component Reference

```
                    CARD                          BUTTON
┌────────────────────────────────┐  ┌──────────────────────────┐
│ ╭─────────────────────────────╮ │  │  ╭──────────────────╮   │
│ │   Title                     │ │  │  │   Press Me        │   │
│ │   Subtitle                  │ │  │  ╰──────────────────╯   │
│ ╰─────────────────────────────╯ │  └──────────────────────────┘
│ Shadow: Medium                  │  Shadow: Medium
│ Radius: 24px                    │  Radius: 16px
│ Color: Surface                  │  Color: Primary
└────────────────────────────────┘  └──────────────────────────┘

                    INPUT                      CHIP/BADGE
┌────────────────────────────────┐  ┌──────────────────────────┐
│ ╔════════════════════════════╗ │  │ ╭─────────────────────╮  │
│ ║ Enter your text...        ║ │  │ │ Filter             │  │
│ ╚════════════════════════════╝ │  │ ╰─────────────────────╯  │
│ Shadow: Soft                   │  │ Shadow: None
│ Radius: 16px                   │  Radius: 50px (full)
│ Color: Surface                 │  Color: PrimaryFaded
└────────────────────────────────┘  └──────────────────────────┘

                ICON WRAPPER               MODAL/BOTTOM SHEET
┌────────────────────────────────┐  ┌──────────────────────────┐
│              ●●●              │  │┌────────────────────────┐ │
│            ●●   ●●            │  ││                        │ │
│           ●        ●           │  ││    Modal Content       │ │
│            ●●   ●●             │  ││                        │ │
│              ●●●               │  │└────────────────────────┘ │
│ Shadow: Soft                   │  │ Shadow: Large
│ Radius: 50% (circular)         │  Radius: 32px (top only)
│ Color: PrimaryFaded            │  Color: Surface
└────────────────────────────────┘  └──────────────────────────┘
```

---

## Design Decision Matrix

```
                    CHOOSE SHADOW              CHOOSE COLOR
         ┌──────────────────────────┐  ┌──────────────────────┐
         │ Is it subtle?     SOFT   │  │ Primary action?      │
         │ Is it standard?   MEDIUM │  │ → Colors.primary     │
         │ Is it important?  PROM.  │  │                      │
         │ Is it a modal?    LARGE  │  │ Accent action?       │
         │                          │  │ → Colors.accent      │
         │ Is it primary?    GLOW   │  │                      │
         └──────────────────────────┘  │ Success state?       │
                                       │ → Colors.success     │
                                       │                      │
                                       │ Error state?         │
                                       │ → Colors.error       │
                                       │                      │
                                       │ Background?          │
                                       │ → Colors.background  │
                                       │                      │
                                       │ Card/Surface?        │
                                       │ → Colors.surface     │
                                       │                      │
                                       │ Text?                │
                                       │ → Colors.text        │
                                       └──────────────────────┘
```

---

## Migration Cheatsheet

```
OLD CODE                          →  NEW CODE
─────────────────────────────────────────────────────────────────
backgroundColor: '#0891B2'        →  backgroundColor: Colors.primary
backgroundColor: '#FFFFFF'       →  backgroundColor: Colors.surface
borderRadius: 8                   →  borderRadius: 18
borderRadius: 14                  →  borderRadius: 24
borderWidth: 1                    →  (remove, use shadow)
borderColor: '#E2E8F0'            →  (remove, use shadow)
shadowColor: '#000000'            →  ...ClayMorphism.shadow.medium
shadowOpacity: 0.3                →  (included above)
shadowRadius: 8                   →  (included above)
color: '#0F172A'                  →  color: Colors.text
color: '#64748B'                  →  color: Colors.textSecondary
padding: 16                       →  padding: 16 (stay same)
marginBottom: 16                  →  marginBottom: 16 (stay same)
```

---

## Files at a Glance

```
📁 PROJECT ROOT
├── 📄 constants/
│   ├── colors.ts ...................... All clay colors
│   └── clayMorphism.ts ................ All utilities
├── 📄 components/
│   ├── PaymentIcons.tsx ............... Updated icons
│   └── ClayMorphismExample.tsx ........ Visual examples
├── 📄 CLAY_MORPHISM_GUIDE.md ......... Deep dive guide
├── 📄 CLAY_MORPHISM_QUICK_START.md .. Get started
├── 📄 CLAY_MORPHISM_SNIPPETS.md ...... Code examples
├── 📄 IMPLEMENTATION_SUMMARY.md ...... Executive summary
└── 📄 README_CLAY_MORPHISM.md ........ This overview
```

---

## Your Next Steps

```
┌─────────────────────────────────────────────────┐
│  1. Read CLAY_MORPHISM_QUICK_START.md           │
│     (Take 5 minutes)                             │
├─────────────────────────────────────────────────┤
│  2. Look at ClayMorphismExample.tsx             │
│     (See the patterns in action)                │
├─────────────────────────────────────────────────┤
│  3. Try updating one component                  │
│     (Put it into practice)                      │
├─────────────────────────────────────────────────┤
│  4. Follow implementation phases                │
│     (Phase 1: Navigation - highest priority)    │
├─────────────────────────────────────────────────┤
│  5. Test on real devices                        │
│     (iOS + Android)                             │
└─────────────────────────────────────────────────┘
```

---

## Quick Wins

```
What's Easiest to Do First:
┌──────────────────────────────────┐
│ 1. Update app background color   │  2 minutes
│ 2. Update button colors          │  5 minutes
│ 3. Update card styling           │  10 minutes
│ 4. Update screen headers         │  15 minutes
│ 5. Update all text colors        │  20 minutes
└──────────────────────────────────┘
          Total: ~50 minutes
          Impact: HUGE! 🎉
```

---

## Remember

✨ **All utility functions are in `constants/clayMorphism.ts`**

🎨 **All colors are in `constants/colors.ts`**

📚 **All examples are in `components/ClayMorphismExample.tsx`**

💡 **All snippets are in `CLAY_MORPHISM_SNIPPETS.md`**

🚀 **You've got everything you need to succeed!**

---

**Happy designing! Transform LabadaGO into a beautiful, modern, warm, and inviting platform.** 💫
