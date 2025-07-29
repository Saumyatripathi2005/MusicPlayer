# Music Player

A web-based music player with automatic song discovery and real-time updates.

## Features

- 🎵 Auto-discovery of music files in the `music/` directory
- 🔄 Real-time updates every second when songs are added or removed
- 🗑️ Automatic removal of deleted songs from library
- 🎨 Beautiful animated UI with musical symbols
- 🎧 Full playback controls (play, pause, next, previous)
- 📱 Responsive design
- 🎯 Supports multiple audio formats (MP3, WAV, FLAC, M4A, OGG, AAC, WMA)

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your music files:**
   - Place your audio files in the `music/` directory
   - Supported formats: `.mp3`, `.wav`, `.flac`, `.m4a`, `.ogg`, `.aac`, `.wma`

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development (with auto-restart):
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:2050`
   - Your music player is ready!

## How It Works

### File Naming Convention
The app automatically extracts song information from filenames:
- `Artist - Song Title.mp3` → Artist: "Artist", Title: "Song Title"
- `Song_Title.mp3` → Artist: "Unknown Artist", Title: "Song Title"

### Auto-Discovery
- The app scans the `music/` directory every second
- New songs are automatically added to the library
- Deleted songs are automatically removed from the library
- No manual refresh needed - the UI updates instantly

### API Endpoints

The server provides these REST API endpoints:

- `GET /api/songs` - Get all songs from the library
- `GET /api/music-files` - Get all music files from directory
- `POST /api/auto-update` - Trigger auto-update process
- `POST /api/songs` - Update the songs library
- `GET /api/file-info/:filename` - Get file information

## File Structure

```
MusicPlayer/
├── index.html          # Main HTML file
├── style.css           # Styles and animations
├── main.js             # Frontend JavaScript
├── server.js           # Backend API server
├── package.json        # Node.js dependencies
├── music/              # Your music files go here
│   ├── songs.json      # Auto-generated song library
│   ├── florida.mp3     # Example music file
│   └── *.mp3           # Add more music files here
└── README.md          # This file
```

## Adding New Music

Simply copy audio files to the `music/` directory. The app will:
1. Detect new files automatically
2. Extract song information from filenames
3. Update the library in real-time
4. Display new songs in the interface

## Troubleshooting

### Port Already in Use
If port 3000 is busy, you can change it in `server.js`:
```javascript
const PORT = 3001; // Change to any available port
```

### Music Files Not Loading
- Ensure files are in the `music/` directory
- Check file extensions are supported
- Verify file permissions allow reading

### Auto-Update Not Working
- Check browser console for errors
- Ensure the server is running
- Verify the `music/` directory exists and is readable

## Development

To modify the app:
1. Edit frontend files (`index.html`, `style.css`, `main.js`)
2. Edit backend API (`server.js`)
3. The server serves static files, so changes are reflected immediately
4. Use `npm run dev` for auto-restart on server changes

## License

MIT License - feel free to use and modify!
