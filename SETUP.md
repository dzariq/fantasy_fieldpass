# Fantasy Football - Setup & Quick Start Guide

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Features Implemented

### ✅ Core Functionality
- **Player Selection System**: Click the floating "+" button to browse and select players
- **Position Filtering**: Filter players by ALL, GK, DF, MF, ST positions
- **Search Functionality**: Search players by name
- **Budget Management**: Real-time budget tracking ($1000 starting budget)
- **Squad Building**: 15-player squad (11 starting + 4 substitutes)
- **Formation Display**: Interactive pitch view with 4-4-2 formation
- **Matchweek Navigation**: Switch between matchweeks with arrow buttons

### ✅ Rules Implementation
All rules from `rules.json` are enforced:
- Starting budget: $1000
- Maximum 3 players from the same team
- Transfer limits: **Unlimited for new teams** (`is_new: true`), otherwise uses `rules.transfer` value
- Position limits: 2 GK, 5 DF, 5 MF, 3 ST
- Chip system ready (Triple Captain: 4, Wildcard: 2, Bench Boost: 6)

### ✅ Mobile-First Design
- Responsive layout optimized for mobile devices
- Touch-friendly tap targets
- Sticky header with key stats
- Bottom-positioned FAB for easy thumb reach
- Smooth animations and transitions

## 🎨 Design System

### Color Palette
- **Primary Green**: `#00ff87` - Actions, highlights, budget
- **Secondary Purple**: `#3d195b` - Background elements
- **Accent Pink**: `#ff2882` - Captain badge, warnings
- **Dark Background**: `#0a0e27` - Main background
- **Card Background**: `#1a1f3a` - Player cards, panels

### Typography
- **Barlow**: Headers (bold, athletic feel)
- **Manrope**: Body text (modern, readable)

### Components
1. **PlayerCard**: Displays player info with position badge
2. **Pitch**: Interactive football field with realistic styling
3. **Header**: Sticky navigation with stats bar
4. **Player Panel**: Full-screen overlay for player selection

## 📊 Data Structure

### Players (`public/data/players.json`)
18 sample players across 3 teams with positions:
- 3 Goalkeepers (GK)
- 6 Defenders (DF)
- 6 Midfielders (MF)
- 3 Strikers (ST)

### Teams (`public/data/teams.json`)
3 teams:
- Selangor FC (SEL)
- Kuala Lumpur City (KLC)
- AAK Puncak Alam (AAK)

### Rules (`public/data/rules.json`)
Global game rules for season 2025

### User Team (`public/data/userteam.json`)
Tracks user's team data per matchweek

## 🎮 How to Use

### Building Your Squad
1. Click the **+** floating button (bottom right)
2. Filter by position or search for specific players
3. Click a player card to add them (green checkmark appears)
4. Monitor your budget and squad count in the header
5. Click **✕** to close the player panel

### Managing Matchweeks
1. Use **← →** arrows to navigate between matchweeks
2. Each matchweek maintains its own team selection
3. First matchweek has unlimited transfers (`is_new: true`)
4. Subsequent matchweeks have limited transfers based on rules

### Budget & Transfers
- **Budget Bar**: Shows remaining money (starts at $1000)
- **Squad Counter**: Shows current squad size (must reach 15)
- **Transfer Counter**: Shows remaining transfers (∞ for new teams)

## 🔧 Customization

### Changing Formation
Edit `userteam.json`:
```json
"picks": {
  "formation": "433"  // or "352", "451", etc.
}
```

### Adjusting Rules
Edit `public/data/rules.json`:
```json
{
  "credit": 1200,        // Change starting budget
  "max_same_club": 4,    // Change max players per team
  "transfer": 3          // Change transfer limit
}
```

### Adding More Players
Add player objects to `public/data/players.json` following this structure:
```json
{
  "_id": "player019",
  "name": "PLAYER NAME",
  "team_id": 1,
  "position": "MF",  // GK, DF, MF, or ST
  "value": 85,       // Transfer value
  "jersey_number": 7,
  // ... other fields
}
```

## 📂 Project Structure

```
fantasy-football/
├── app/
│   ├── globals.css      # Design system & styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main app component
├── components/
│   ├── PlayerCard.tsx   # Player card UI
│   └── Pitch.tsx        # Football pitch view
├── types/
│   └── index.ts         # TypeScript definitions
├── public/
│   └── data/            # JSON data files
└── README.md
```

## 🐛 Troubleshooting

### Players not showing?
- Check that `public/data/players.json` exists
- Verify JSON is valid (no trailing commas)
- Clear browser cache and reload

### Budget calculation wrong?
- Check player values in players.json
- Verify rules.credit in rules.json
- Ensure no duplicate players selected

### Matchweek not changing?
- Check team_data array in userteam.json
- Ensure each matchweek has required structure
- Verify matchweek numbers are correct

## 🚀 Future Enhancements

Ready to implement:
- [ ] Captain selection (multiply points by 2)
- [ ] Vice-captain selection (backup captain)
- [ ] Chip activation UI (Triple Captain, Wildcard, Bench Boost)
- [ ] Points tracking and leaderboard
- [ ] Player statistics modal
- [ ] Live match updates
- [ ] Team comparison view
- [ ] Auto-save to localStorage
- [ ] Transfer history view
- [ ] Formation editor

## 📄 License

MIT License - Free to use and modify

---

**Built with**: Next.js 14, TypeScript, Modern CSS
**Design inspired by**: Fantasy Premier League
**Mobile-first**: Optimized for all devices
