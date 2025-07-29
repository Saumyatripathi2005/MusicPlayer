const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 2050;
const MUSIC_DIR = path.join(__dirname, 'music');
const SONGS_JSON = path.join(MUSIC_DIR, 'songs.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Supported audio file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac', '.wma'];

// Function to extract song details from filename
function extractSongDetails(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Try to parse artist - title format
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ');
    return {
      title: parts.slice(1).join(' - ').trim(), // In case there are multiple " - "
      artist: parts[0].trim()
    };
  }
  
  // If no artist separator, use filename as title with "Unknown Artist"
  return {
    title: nameWithoutExt.replace(/[_-]/g, ' ').trim(),
    artist: 'Unknown Artist'
  };
}

// API endpoint to get all music files from directory
app.get('/api/music-files', async (req, res) => {
  try {
    const files = await fs.readdir(MUSIC_DIR);
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    });
    
    res.json({ success: true, files: musicFiles });
  } catch (error) {
    console.error('Error reading music directory:', error);
    res.status(500).json({ success: false, error: 'Failed to read music directory' });
  }
});

// API endpoint to get current songs.json
app.get('/api/songs', async (req, res) => {
  try {
    const data = await fs.readFile(SONGS_JSON, 'utf8');
    const songs = JSON.parse(data);
    res.json({ success: true, songs });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      res.json({ success: true, songs: [] });
    } else {
      console.error('Error reading songs.json:', error);
      res.status(500).json({ success: false, error: 'Failed to read songs.json' });
    }
  }
});

// API endpoint to update songs.json
app.post('/api/songs', async (req, res) => {
  try {
    const { songs } = req.body;
    
    if (!Array.isArray(songs)) {
      return res.status(400).json({ success: false, error: 'Invalid songs data' });
    }
    
    // Ensure music directory exists
    await fs.mkdir(MUSIC_DIR, { recursive: true });
    
    // Write the updated songs.json
    await fs.writeFile(SONGS_JSON, JSON.stringify(songs, null, 2));
    
    res.json({ success: true, message: 'Songs updated successfully' });
  } catch (error) {
    console.error('Error writing songs.json:', error);
    res.status(500).json({ success: false, error: 'Failed to update songs.json' });
  }
});

// API endpoint to auto-update songs.json with new files and remove deleted files
app.post('/api/auto-update', async (req, res) => {
  try {
    // Get all music files from directory
    const files = await fs.readdir(MUSIC_DIR);
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    });
    
    // Get current songs from JSON
    let currentSongs = [];
    try {
      const data = await fs.readFile(SONGS_JSON, 'utf8');
      currentSongs = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, continue with empty array
    }
    
    // Get current file paths from JSON
    const currentFiles = currentSongs.map(song => {
      const filename = song.file.replace('music/', '');
      return filename;
    });
    
    // Find new songs that aren't already in the JSON
    const newFiles = musicFiles.filter(file => !currentFiles.includes(file));
    
    // Find deleted songs (in JSON but not in directory)
    const deletedFiles = currentFiles.filter(file => !musicFiles.includes(file));
    
    let updatedSongs = [...currentSongs];
    let changes = {
      newSongs: 0,
      deletedSongs: 0,
      addedFiles: [],
      deletedFiles: []
    };
    
    // Remove deleted songs from the array
    if (deletedFiles.length > 0) {
      console.log(`Found ${deletedFiles.length} deleted song(s):`, deletedFiles);
      updatedSongs = updatedSongs.filter(song => {
        const filename = song.file.replace('music/', '');
        return !deletedFiles.includes(filename);
      });
      changes.deletedSongs = deletedFiles.length;
      changes.deletedFiles = deletedFiles;
    }
    
    // Add new songs
    if (newFiles.length > 0) {
      console.log(`Found ${newFiles.length} new song(s):`, newFiles);
      
      // Create song objects for new files
      const newSongs = newFiles.map(filename => {
        const details = extractSongDetails(filename);
        return {
          title: details.title,
          artist: details.artist,
          file: `music/${filename}`,
          dateAdded: new Date().toISOString()
        };
      });
      
      // Add to existing songs
      updatedSongs = [...updatedSongs, ...newSongs];
      changes.newSongs = newFiles.length;
      changes.addedFiles = newFiles;
    }
    
    // Only write file if there were changes
    if (newFiles.length > 0 || deletedFiles.length > 0) {
      // Write updated songs.json
      await fs.writeFile(SONGS_JSON, JSON.stringify(updatedSongs, null, 2));
      
      res.json({ 
        success: true, 
        newSongs: changes.newSongs,
        deletedSongs: changes.deletedSongs,
        totalSongs: updatedSongs.length,
        addedFiles: changes.addedFiles,
        deletedFiles: changes.deletedFiles,
        songs: updatedSongs
      });
    } else {
      res.json({ 
        success: true, 
        newSongs: 0,
        deletedSongs: 0,
        totalSongs: currentSongs.length,
        message: 'No changes detected',
        songs: currentSongs
      });
    }
    
  } catch (error) {
    console.error('Error in auto-update:', error);
    res.status(500).json({ success: false, error: 'Auto-update failed' });
  }
});

// API endpoint to get file info
app.get('/api/file-info/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(MUSIC_DIR, filename);
    
    const stats = await fs.stat(filePath);
    const details = extractSongDetails(filename);
    
    res.json({
      success: true,
      file: {
        name: filename,
        size: stats.size,
        modified: stats.mtime,
        ...details
      }
    });
  } catch (error) {
    res.status(404).json({ success: false, error: 'File not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Music Player Server running on http://localhost:${PORT}`);
  console.log(`Music directory: ${MUSIC_DIR}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
