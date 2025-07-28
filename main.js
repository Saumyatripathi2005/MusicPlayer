// Symbols pool for random display (musical/emojis/unicode symbols)
const SYMBOLS = ['♪', '♫', '♬', '♩', '♭', '♯', '🎵', '🎶', '🎼', '🎧', '🎤', '🎹', '🎷', '🎺', '🥁'];

// Utility: generate random integer [min, max)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Helper to create an animated symbol element with random animation delay and position
function createAnimatedSymbol() {
  const el = document.createElement('span');
  el.className = 'symbol';
  el.textContent = SYMBOLS[randInt(0, SYMBOLS.length)];
  el.style.left = `${randInt(0, 60)}%`; // % left inside container
  el.style.animationDelay = `${Math.random() * 4}s`;
  el.style.fontSize = `${randInt(18, 28)}px`;
  return el;
}

// Generate multiple animated symbols inside a container element
function fillSymbolContainer(container, count=5) {
  container.innerHTML = ''; // Clear
  for(let i=0; i<count; i++) {
    container.appendChild(createAnimatedSymbol());
  }
}

// Example to simulate fetching music list dynamically
// In real environment, likely fetch '/music/songs.json' or server endpoint that returns 
// JSON array of {title, artist, file} objects.
// Here we simulate with a static array for demo purpose.
async function fetchSongs() {
  try {
    // Uncomment this when actual JSON endpoint is available:
    // const response = await fetch('music/songs.json');
    // if (!response.ok) throw new Error('Failed to fetch songs metadata');
    // const songs = await response.json();
    // return songs;

    // Demo static list:
    return [
      {title: "Night Drive", artist: "Aether", file: "music/night_drive.mp3"},
      {title: "Sunset Roads", artist: "Vastlane", file: "music/sunset_roads.mp3"},
      {title: "Midnight Jazz", artist: "The Skyliners", file: "music/midnight_jazz.mp3"},
      {title: "Aurora Dreams", artist: "Nora Nova", file: "music/aurora_dreams.mp3"}
    ];
  } catch (err) {
    console.error('Error fetching songs:', err);
    return [];
  }
}

// Create music blocks with song info and animated symbols
function renderMusicGrid(songs) {
  const grid = document.getElementById('musicGrid');
  if (!grid) return;

  grid.innerHTML = ''; // Clear old

  songs.forEach((song, idx) => {
    const block = document.createElement('div');
    block.className = 'music-block fade-in';
    // Random gradient background
    const gradients = [
      "linear-gradient(135deg, #e53935, #232526)",
      "linear-gradient(135deg, #b71c1c, #212121)",
      "linear-gradient(135deg, #7c0000, #333)",
      "linear-gradient(120deg, #ff1744, #111)"
    ];
    block.style.background = gradients[randInt(0, gradients.length)];
    block.tabIndex = 0;

    // Inner HTML without cover image, but with symbol container
    block.innerHTML = `
      <div class="symbol-container" aria-label="Music symbol"></div>
      <div class="song-title" title="${song.title}">${song.title}</div>
      <div class="song-artist" title="${song.artist}">${song.artist}</div>
    `;

    // Add animated symbols inside block
    const symbolContainer = block.querySelector('.symbol-container');
    fillSymbolContainer(symbolContainer, 5);

    // Click or keyboard to play
    block.onclick = () => playSong(idx);
    block.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        playSong(idx);
        e.preventDefault();
      }
    };

    grid.appendChild(block);
  });
}

// Player setup and controls
let audio = new Audio();
let songs = [];
let currentIdx = 0;

const playerDetails = document.getElementById('playerDetails');
const playerControls = document.getElementById('playerControls');
const playerProgress = document.getElementById('playerProgress');

function playSong(idx) {
  if (idx === currentIdx && !audio.paused) return;
  currentIdx = idx;

  if (songs.length === 0) return;

  audio.src = songs[idx].file;
  audio.play().catch(err => console.warn("Play interrupted:", err));
  updatePlayerUI();
}

function updatePlayerUI() {
  const song = songs[currentIdx];
  if (!song) return;

  // Player details with animated symbols container (no cover)
  playerDetails.innerHTML = `
    <div class="player-symbol-container" aria-label="Music playing symbol"></div>
    <div class="player-info">
      <div class="player-title">${song.title}</div>
      <div class="player-artist">${song.artist}</div>
    </div>
  `;

  // Fill symbol container with animated symbols (e.g. 7 symbols)
  const playerSymbolContainer = playerDetails.querySelector('.player-symbol-container');
  fillSymbolContainer(playerSymbolContainer, 7);

  // Controls
  playerControls.innerHTML = `
    <button id="prevBtn" aria-label="Previous">&#9198;</button>
    <button id="playPauseBtn" aria-label="Play/Pause">
      <span id="playPauseIcon">${audio.paused ? "&#9654;" : "&#10073;&#10073;"}</span>
    </button>
    <button id="nextBtn" aria-label="Next">&#9197;</button>
  `;

  // Progress bar and time
  playerProgress.innerHTML = `
    <span class="time" id="currentTime">0:00</span>
    <input type="range" id="progressBar" min="0" max="100" value="0" aria-label="Music progress bar">
    <span class="time" id="duration">0:00</span>
  `;

  bindPlayerEvents();
}

function bindPlayerEvents() {
  document.getElementById('playPauseBtn').onclick = () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    document.getElementById('playPauseIcon').innerHTML = audio.paused ? "&#9654;" : "&#10073;&#10073;";
  };

  document.getElementById('prevBtn').onclick = () => {
    playSong((currentIdx - 1 + songs.length) % songs.length);
  };

  document.getElementById('nextBtn').onclick = () => {
    playSong((currentIdx + 1) % songs.length);
  };

  const progressBar = document.getElementById('progressBar');
  progressBar.oninput = () => {
    audio.currentTime = (progressBar.value / 100) * (audio.duration || 0);
  };

  audio.ontimeupdate = () => {
    const curr = document.getElementById('currentTime');
    const dur = document.getElementById('duration');
    if (audio.duration) {
      curr.textContent = formatTime(audio.currentTime);
      dur.textContent = formatTime(audio.duration);
      progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
  };

  audio.onended = () => {
    playSong((currentIdx + 1) % songs.length);
  };
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Initialize player after DOM loaded
window.addEventListener('DOMContentLoaded', async () => {
  songs = await fetchSongs();
  renderMusicGrid(songs);

  if (songs.length > 0) {
    playSong(0);
  }
});
