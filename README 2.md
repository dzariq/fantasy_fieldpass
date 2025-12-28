# Fantasy Football - Next.js App

A clean, mobile-first fantasy football application inspired by Fantasy Premier League, built with Next.js and TypeScript.

## Features

✨ **Core Features**
- Player selection from a comprehensive database
- Interactive pitch view with drag-and-drop-like experience
- Matchweek navigation and team management
- Budget management and transfer tracking
- Position-based filtering and search
- Mobile-first responsive design

🎮 **Game Rules**
- Starting budget: $1000
- 15 players per squad (11 starting + 4 bench)
- Formation: 1 GK, 3-5 DF, 2-5 MF, 1-3 ST
- Maximum 3 players from the same team
- Transfer system with unlimited transfers for new teams
- Triple Captain, Bench Boost, and Wildcard chips

🎨 **Design Highlights**
- Modern gradient-based color scheme
- Animated pitch with realistic football field styling
- Smooth transitions and micro-interactions
- Clean card-based UI components
- Position-coded player badges

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fantasy-football/
├── app/
│   ├── globals.css          # Global styles and design system
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/
│   ├── PlayerCard.tsx        # Player card component
│   └── Pitch.tsx             # Football pitch visualization
├── types/
│   └── index.ts              # TypeScript definitions
├── public/
│   └── data/
│       ├── players.json      # Player database
│       ├── teams.json        # Team information
│       ├── rules.json        # Game rules
│       └── userteam.json     # User team data
└── package.json
```

## Usage

### Selecting Players

1. Click the **+** floating action button to open the player selection panel
2. Use position filters (ALL, GK, DF, MF, ST) to narrow down choices
3. Search for specific players using the search bar
4. Click on a player card to add them to your squad
5. Click again to remove a player

### Managing Your Team

- **Budget**: Monitor remaining budget in the header stats bar
- **Squad**: Track player count (must reach 15/15)
- **Transfers**: View remaining transfers (unlimited when `is_new: true`)
- **Formation**: Players auto-assign to positions based on formation (442)

### Navigating Matchweeks

- Use the **←** and **→** arrows in the matchweek selector
- Each matchweek maintains its own team selection
- New matchweeks start with `is_new: true` for unlimited transfers
- Transfer limits apply to existing matchweeks

## Game Rules Reference

From `rules.json`:
- **Season**: 2025
- **Starting Credit**: $1000
- **Max Same Club**: 3 players
- **Transfer Limit**: Varies by matchweek (unlimited for new teams)
- **Triple Captain Chips**: 4 available
- **Wildcard Chips**: 2 available
- **Bench Boost Chips**: 6 available

## Data Format

### Players
Each player has:
- Personal info (name, nationality, DOB)
- Team association
- Position (GK/DF/MF/ST)
- Value (transfer cost)
- Jersey number
- Image URLs

### Teams
Team information includes:
- Team ID
- Full name and short name
- Official name
- Status

### User Team
Tracks:
- Manager information
- Team data per matchweek
- Picks (formation, starting XI, bench)
- Transfer history
- Chip usage

## Customization

### Colors
Edit CSS variables in `app/globals.css`:
```css
--primary: #00ff87;        /* Primary green */
--secondary: #3d195b;      /* Purple */
--accent: #ff2882;         /* Pink accent */
--bg-primary: #0a0e27;     /* Dark background */
```

### Fonts
Current fonts:
- **Barlow**: Headings (bold, athletic)
- **Manrope**: Body text (modern, readable)

Change in `globals.css` import or update `font-family` variables.

### Formation
Default is 442. Modify in `userteam.json`:
```json
"picks": {
  "formation": "433"  // Change to 433, 352, etc.
}
```

## Mobile Optimization

- Touch-friendly tap targets (minimum 44px)
- Swipe-friendly player lists
- Responsive grid layouts
- Fixed header for easy navigation
- Bottom-positioned FAB for thumb reach

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized images with Next.js Image component
- CSS-only animations (no JavaScript overhead)
- Lazy loading for player images
- Efficient state management with React hooks

## Future Enhancements

- [ ] Captain and Vice-captain selection
- [ ] Chip activation UI
- [ ] Points tracking per matchweek
- [ ] Player statistics and form
- [ ] Team comparison view
- [ ] Fixture difficulty ratings
- [ ] Auto-save to localStorage
- [ ] Export team data

## License

MIT License - feel free to use this project as a template for your own fantasy football application.

## Credits

Inspired by the Fantasy Premier League design and user experience.
Built with Next.js, TypeScript, and modern CSS.
