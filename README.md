# 🎲 Board Game Collection Tracker

A lightweight, offline-first web application for tracking your board game collection and play sessions. Works entirely in the browser without requiring a backend server.

## Features

### 📚 Game Collection Management
- Add games with detailed information:
  - Title, year published, designer(s), publisher
  - Player count (min-max), play time, complexity/weight
  - Categories/mechanics, personal rating (1-10)
  - Acquisition date, notes, box art images
- Mark games as **Owned**, **Wishlist**, or **Previously Owned**
- Search games by title, designer, publisher, or categories
- Filter games by ownership status
- Sort by title, rating, play time, most played, or last played

### 🎮 Play Session Logging
- Record play sessions with:
  - Game played, date, duration
  - Players (multiple names supported)
  - Winner(s), personal notes
- Quick-add feature for minimal-click logging
- View play history for each game
- Edit or delete sessions

### 📊 Statistics
- Collection overview (games owned, wishlist, previously owned)
- Most played games with visual progress bars
- Frequent players tracking
- Play history by month

### ⚙️ Data Management
- All data stored in browser localStorage for offline access
- Export data to JSON for backup
- Import data from JSON to restore or migrate
- No server required - runs entirely client-side

### 🎨 UI Features
- Clean, intuitive interface with tabs for Collection, Sessions, Statistics, and Settings
- Dark/light theme toggle
- Responsive design for desktop and mobile
- Print-friendly views
- Accessible with proper ARIA labels and keyboard navigation

### 📱 PWA Support
- Installable as a Progressive Web App
- Works offline after first visit
- App-like experience on mobile devices

## Setup Instructions

### Option 1: Direct Use
1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Start adding your games!

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings > Pages
3. Select "GitHub Actions" as the source
4. Your site will be available at `https://<username>.github.io/<repo-name>/`

### Option 3: Local Development Server
For PWA features to work properly, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Usage

### Adding a Game
1. Click the "➕ Add New Game" button
2. Fill in the game details (only title is required)
3. Click "Save Game"

### Logging a Play Session
1. Click "▶️ Log Play" on a game card, or
2. Go to "Play Sessions" tab and click "⚡ Quick Log Play"
3. Select the game, enter date and optional details
4. Click "Save Session"

### Viewing Statistics
1. Click the "📊 Statistics" tab
2. View your collection overview, most played games, and play history

### Exporting/Importing Data
1. Go to "⚙️ Settings" tab
2. Click "📤 Export Data" to download your data as JSON
3. Click "📥 Import Data" to restore from a backup file

## Technology

- Pure HTML5, CSS3, and vanilla JavaScript
- No external dependencies or frameworks
- LocalStorage for data persistence
- Service Worker for PWA/offline support
- Responsive CSS Grid and Flexbox layout
- CSS Custom Properties for theming

## Browser Support

Works in all modern browsers:
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers (iOS Safari, Chrome for Android)

## Demo

The application works immediately after opening `index.html` in a modern web browser, or after deploying to GitHub Pages.

## Data Privacy

All your data is stored locally in your browser. No data is sent to any server. When you export your data, the JSON file is created entirely in your browser.

## License

MIT License - feel free to use, modify, and distribute.