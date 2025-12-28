# Fantasy Football - Visual Design Reference

## 🎨 Color Palette

### Primary Colors
```
Primary Green:   #00ff87  ████████  (Actions, highlights, budget)
Primary Dark:    #00cc6a  ████████  (Hover states)
Secondary:       #3d195b  ████████  (Background elements)
Secondary Light: #571e87  ████████  (Hover backgrounds)
Accent Pink:     #ff2882  ████████  (Captain, warnings)
Accent Dark:     #e01566  ████████  (Accent hover)
```

### Background Colors
```
BG Primary:      #0a0e27  ████████  (Main background)
BG Secondary:    #141932  ████████  (Header, panels)
BG Tertiary:     #1e2540  ████████  (Inputs, buttons)
BG Card:         #1a1f3a  ████████  (Cards, modals)
```

### Text Colors
```
Text Primary:    #ffffff  ████████  (Main text)
Text Secondary:  #b8c1ec  ████████  (Labels, meta info)
Text Muted:      #7782ab  ████████  (Placeholders)
```

### Pitch Colors
```
Pitch Dark:      #0d4429  ████████  (Field gradient start)
Pitch Light:     #0e5530  ████████  (Field gradient end)
Pitch Line:      rgba(255,255,255,0.3)  (Field markings)
```

### Position Badge Colors
```
Goalkeeper:      #ffd900  ████████  (Yellow)
Defender:        #00ff87  ████████  (Green)
Midfielder:      #00b8ff  ████████  (Blue)
Striker:         #ff2882  ████████  (Pink)
```

## 📱 Screen Layouts

### Mobile View (320px - 640px)
```
┌─────────────────────────┐
│   ⚽ Fantasy Football   │  ← Header (Sticky)
│   Manager: Dzariq       │
│   Team: Badanamu        │
├─────────────────────────┤
│  ← [Matchweek 1] →     │  ← Matchweek Selector
├─────────────────────────┤
│ Budget | Squad | Trans  │  ← Stats Bar
│  $800  | 11/15 |   ∞   │
├─────────────────────────┤
│                         │
│    [Football Pitch]     │  ← Interactive Pitch
│       Strikers ↑        │
│      Midfielders        │
│       Defenders         │
│      Goalkeeper ↓       │
│                         │
├─────────────────────────┤
│   Substitutes Bench     │  ← Bench (if players exist)
│  [SUB1] [SUB2] [SUB3]  │
└─────────────────────────┘
                     [+]     ← Floating Action Button
```

### Player Selection Panel (Full Screen)
```
┌─────────────────────────┐
│  Select Players      [✕]│  ← Panel Header
├─────────────────────────┤
│ [ALL][GK][DF][MF][ST]  │  ← Position Filters
│ [🔍 Search players...] │  ← Search Input
├─────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐    │
│  │ P │ │ P │ │ P │    │  ← Player Grid
│  │ L │ │ L │ │ L │    │    (3 columns mobile)
│  │ 1 │ │ 2 │ │ 3 │    │
│  └───┘ └───┘ └───┘    │
│  ┌───┐ ┌───┐ ┌───┐    │
│  │ P │ │ P │ │ P │    │
│  │ L │ │ L │ │ L │    │
│  │ 4 │ │ 5 │ │ 6 │    │
│  └───┘ └───┘ └───┘    │
│         ...             │
└─────────────────────────┘
```

### Desktop View (1024px+)
```
┌──────────────────────────────────────────────────┐
│        ⚽ Fantasy Football                       │
│        Manager: Dzariq Mirza | Team: Badanamu   │
│                                                   │
│    ← [    Matchweek 1    ] →                    │
│                                                   │
│  Budget: $800  |  Squad: 11/15  |  Transfers: ∞ │
├──────────────────────────────────────────────────┤
│                                                   │
│              [Football Pitch View]               │
│                  (Wider layout)                  │
│                                                   │
│         ┌───────────────────────┐               │
│         │   Substitutes Bench   │               │
│         │  [S1] [S2] [S3] [S4]  │               │
│         └───────────────────────┘               │
│                                                   │
└──────────────────────────────────────────────────┘
                                              [+]
```

## 🎴 Component Anatomy

### Player Card
```
┌─────────────────┐
│ GK ← Position   │ (Color-coded badge)
│  ┌─────────┐   │
│  │         │   │ (Player image)
│  │  Photo  │   │
│  │         │   │
│  └─────────┘   │
│  PLAYER NAME    │ (Bold, truncated)
│  #1 | $45       │ (Jersey | Price)
│              [✓]│ (Selected checkmark)
└─────────────────┘
```

### Pitch Player
```
    ┌──────┐
    │      │ [C] ← Captain badge
    │Photo │
    │      │
    └──────┘
   ┌────────┐
   │ SURNAME│ ← Player name
   │  $85   │ ← Value
   └────────┘
```

### Stats Badge
```
┌─────────┐
│ Budget  │ ← Label (muted)
│  $800   │ ← Value (primary green)
└─────────┘
```

## 🎭 Animations & Interactions

### Hover States
- **Player Cards**: Lift up 2px, border glows green
- **Buttons**: Scale to 105%, color shift
- **FAB**: Scale to 110%, shadow intensifies

### Click Interactions
- **Player Card**: Instant checkmark appearance
- **Filter Button**: Background color change
- **Navigation**: Slide transition

### Page Load
- **Fade In**: All elements fade in with slight upward movement
- **Stagger**: Elements animate in sequence (0.05s delay each)

### Transitions
- **Fast**: 150ms for instant feedback (clicks)
- **Base**: 250ms for smooth interactions (hovers)
- **Slow**: 350ms for dramatic effects (panel open)

## 📐 Spacing System

```
XS:  0.25rem (4px)   ← Tight gaps
SM:  0.5rem  (8px)   ← Card padding
MD:  1rem    (16px)  ← Standard spacing
LG:  1.5rem  (24px)  ← Section gaps
XL:  2rem    (32px)  ← Page margins
```

## 🔤 Typography Scale

```
H1: 1.5rem (24px) - App logo
H2: 1.25rem (20px) - Panel headers
H3: 1rem (16px) - Section titles
Body: 0.875rem (14px) - Player names
Small: 0.75rem (12px) - Meta info
Tiny: 0.7rem (11px) - Labels
```

## 🎯 Interactive Elements

### Minimum Touch Targets
- Buttons: 44px × 44px
- Player cards: 48px minimum height
- FAB: 60px × 60px (56px mobile)

### Visual Feedback
- Selected state: Green border + checkmark
- Disabled state: 30% opacity
- Error state: Red border + warning text
- Success state: Green glow

## 🌈 Gradients Used

### Background Gradient
```css
linear-gradient(180deg, #141932 0%, #0a0e27 100%)
```

### Card Hover Gradient
```css
linear-gradient(135deg, transparent 0%, rgba(0,255,135,0.05) 100%)
```

### Button Gradient
```css
linear-gradient(135deg, #00ff87 0%, #00cc6a 100%)
```

### Pitch Gradient
```css
linear-gradient(180deg, #0d4429 0%, #0e5530 50%, #0d4429 100%)
```

## 🎨 Design Principles Applied

1. **Hierarchy**: Clear visual hierarchy through size, color, and spacing
2. **Contrast**: High contrast for readability on dark backgrounds
3. **Consistency**: Uniform spacing and styling across components
4. **Feedback**: Immediate visual response to all user actions
5. **Mobile-First**: Touch-optimized with generous hit areas
6. **Performance**: CSS-only animations, no JavaScript overhead

## 🖼️ Key Visual Moments

### Empty State
- Centered message on pitch
- Large, semi-transparent formation number
- Inviting call-to-action

### Full Squad
- Vibrant, populated pitch with player avatars
- Color-coded positions creating visual harmony
- Clear team structure visible at a glance

### Selection Active
- Green checkmarks on selected players
- Decreasing budget counter
- Squad counter incrementing

### Matchweek Change
- Smooth transition between team states
- Stats update animation
- Content fade-in effect

---

This design creates a premium, modern fantasy football experience that feels professional and polished while maintaining excellent usability across all devices.
