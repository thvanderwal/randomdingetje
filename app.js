/**
 * Board Game Collection Tracker
 * A lightweight, offline-first web application for tracking board game collections and play sessions.
 * 
 * Features:
 * - Game collection management with extended metadata
 * - Play session logging with player tracking
 * - Statistics and analytics
 * - Dark/light theme support
 * - Export/import data for backup
 * - PWA support for offline use
 */

// ============================================
// Data Structures
// ============================================

/**
 * @typedef {Object} Game
 * @property {string} id - Unique identifier
 * @property {string} title - Game title
 * @property {number} [yearPublished] - Year the game was published
 * @property {string} [designer] - Designer name(s)
 * @property {string} [publisher] - Publisher name
 * @property {number} [minPlayers] - Minimum player count
 * @property {number} [maxPlayers] - Maximum player count
 * @property {number} [playTime] - Average play time in minutes
 * @property {number} [complexity] - Complexity/weight rating (1-5)
 * @property {string} [categories] - Categories and mechanics
 * @property {number} [rating] - Personal rating (1-10)
 * @property {string} [acquisitionDate] - Date the game was acquired
 * @property {string} [notes] - Personal notes
 * @property {string} [imageUrl] - URL to box art image
 * @property {string} status - Ownership status: 'owned', 'wishlist', 'previously-owned'
 * @property {string} createdAt - ISO date string when added
 */

/**
 * @typedef {Object} PlaySession
 * @property {string} id - Unique identifier
 * @property {string} gameId - Reference to game
 * @property {string} date - Date of play session
 * @property {number} [duration] - Duration in minutes
 * @property {string[]} [players] - Array of player names
 * @property {string[]} [winners] - Array of winner names
 * @property {string} [notes] - Session notes
 * @property {string} createdAt - ISO date string when added
 */

// Application state
let games = [];
let sessions = [];
let currentTheme = 'light';

// ============================================
// Storage Functions
// ============================================

/**
 * Load all data from localStorage on startup
 */
function loadData() {
    try {
        const savedGames = localStorage.getItem('boardGameTracker_games');
        const savedSessions = localStorage.getItem('boardGameTracker_sessions');
        const savedTheme = localStorage.getItem('boardGameTracker_theme');

        if (savedGames) {
            games = JSON.parse(savedGames);
            // Migrate old data format if necessary
            games = games.map(migrateGameData);
        }

        if (savedSessions) {
            sessions = JSON.parse(savedSessions);
        }

        if (savedTheme) {
            currentTheme = savedTheme;
            applyTheme(currentTheme);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        games = [];
        sessions = [];
    }
}

/**
 * Migrate old game data format to new format
 * @param {Object} game - Game object to migrate
 * @returns {Game} Migrated game object
 */
function migrateGameData(game) {
    // Support old format with just 'name' field
    if (game.name && !game.title) {
        return {
            ...game,
            title: game.name,
            status: game.status || 'owned',
            createdAt: game.createdAt || new Date().toISOString()
        };
    }
    return {
        ...game,
        status: game.status || 'owned',
        createdAt: game.createdAt || new Date().toISOString()
    };
}

/**
 * Save games to localStorage
 */
function saveGames() {
    try {
        localStorage.setItem('boardGameTracker_games', JSON.stringify(games));
    } catch (error) {
        console.error('Error saving games:', error);
        alert('Error saving data. Your browser storage might be full.');
    }
}

/**
 * Save sessions to localStorage
 */
function saveSessions() {
    try {
        localStorage.setItem('boardGameTracker_sessions', JSON.stringify(sessions));
    } catch (error) {
        console.error('Error saving sessions:', error);
        alert('Error saving data. Your browser storage might be full.');
    }
}

/**
 * Save theme preference
 */
function saveTheme() {
    localStorage.setItem('boardGameTracker_theme', currentTheme);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format duration in minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
function formatDuration(minutes) {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Convert rating to star display
 * @param {number} rating - Rating value (1-10)
 * @returns {string} Stars HTML
 */
function ratingToStars(rating) {
    if (!rating) return '';
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (halfStar) stars += '½';
    return stars;
}

// ============================================
// Theme Functions
// ============================================

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    saveTheme();
}

// ============================================
// Tab Navigation
// ============================================

/**
 * Switch to a different tab
 * @param {string} tabName - Name of the tab to switch to
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });

    // Update panels
    document.querySelectorAll('.panel').forEach(panel => {
        const isActive = panel.id === `${tabName}Panel`;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });

    // Refresh content based on tab
    switch (tabName) {
        case 'collection':
            renderGames();
            break;
        case 'sessions':
            renderSessions();
            break;
        case 'statistics':
            renderStatistics();
            break;
    }
}

// ============================================
// Game Management
// ============================================

/**
 * Add or update a game
 * @param {Game} gameData - Game data to save
 */
function saveGame(gameData) {
    if (gameData.id) {
        // Update existing game
        const index = games.findIndex(g => g.id === gameData.id);
        if (index !== -1) {
            games[index] = { ...games[index], ...gameData };
        }
    } else {
        // Add new game
        const newGame = {
            ...gameData,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        games.push(newGame);
    }
    saveGames();
    renderGames();
}

/**
 * Delete a game and its associated sessions
 * @param {string} gameId - ID of game to delete
 */
function deleteGame(gameId) {
    games = games.filter(g => g.id !== gameId);
    sessions = sessions.filter(s => s.gameId !== gameId);
    saveGames();
    saveSessions();
    renderGames();
}

/**
 * Get a game by ID
 * @param {string} gameId - Game ID
 * @returns {Game|undefined} Game object or undefined
 */
function getGameById(gameId) {
    return games.find(g => g.id === gameId);
}

/**
 * Get sessions for a specific game
 * @param {string} gameId - Game ID
 * @returns {PlaySession[]} Array of sessions
 */
function getSessionsForGame(gameId) {
    return sessions.filter(s => s.gameId === gameId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get play count for a game
 * @param {string} gameId - Game ID
 * @returns {number} Number of plays
 */
function getPlayCount(gameId) {
    return sessions.filter(s => s.gameId === gameId).length;
}

/**
 * Get last played date for a game
 * @param {string} gameId - Game ID
 * @returns {string|null} ISO date string or null
 */
function getLastPlayedDate(gameId) {
    const gameSessions = getSessionsForGame(gameId);
    return gameSessions.length > 0 ? gameSessions[0].date : null;
}

// ============================================
// Session Management
// ============================================

/**
 * Add or update a play session
 * @param {PlaySession} sessionData - Session data to save
 */
function saveSession(sessionData) {
    if (sessionData.id) {
        // Update existing session
        const index = sessions.findIndex(s => s.id === sessionData.id);
        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...sessionData };
        }
    } else {
        // Add new session
        const newSession = {
            ...sessionData,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        sessions.push(newSession);
    }
    saveSessions();
    renderSessions();
    renderGames();
}

/**
 * Delete a play session
 * @param {string} sessionId - ID of session to delete
 */
function deleteSession(sessionId) {
    sessions = sessions.filter(s => s.id !== sessionId);
    saveSessions();
    renderSessions();
    renderGames();
}

// ============================================
// Rendering Functions
// ============================================

/**
 * Render the games list with current filters and sorting
 */
function renderGames() {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;

    // Get filter and sort values
    const searchTerm = document.getElementById('searchGames')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    const sortBy = document.getElementById('sortGames')?.value || 'title';

    // Filter games
    let filteredGames = games.filter(game => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (game.title || '').toLowerCase().includes(searchTerm) ||
            (game.designer || '').toLowerCase().includes(searchTerm) ||
            (game.publisher || '').toLowerCase().includes(searchTerm) ||
            (game.categories || '').toLowerCase().includes(searchTerm);

        // Status filter
        const matchesStatus = statusFilter === 'all' || game.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Sort games
    filteredGames.sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'playTime':
                return (a.playTime || 0) - (b.playTime || 0);
            case 'plays':
                return getPlayCount(b.id) - getPlayCount(a.id);
            case 'lastPlayed':
                const dateA = getLastPlayedDate(a.id) || '1900-01-01';
                const dateB = getLastPlayedDate(b.id) || '1900-01-01';
                return new Date(dateB) - new Date(dateA);
            default:
                return 0;
        }
    });

    // Render
    if (filteredGames.length === 0) {
        if (games.length === 0) {
            gamesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎲</div>
                    <p>No games in your collection yet. Add your first game!</p>
                </div>
            `;
        } else {
            gamesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No games match your search or filter criteria.</p>
                </div>
            `;
        }
        return;
    }

    gamesList.innerHTML = filteredGames.map(game => renderGameCard(game)).join('');
}

/**
 * Render a single game card
 * @param {Game} game - Game to render
 * @returns {string} HTML string
 */
function renderGameCard(game) {
    const playCount = getPlayCount(game.id);
    const lastPlayed = getLastPlayedDate(game.id);
    const statusClass = `status-${game.status}`;
    const statusLabel = {
        'owned': 'Owned',
        'wishlist': 'Wishlist',
        'previously-owned': 'Prev. Owned'
    }[game.status] || 'Owned';

    const imageHtml = game.imageUrl
        ? `<img src="${escapeHtml(game.imageUrl)}" alt="${escapeHtml(game.title)} box art" class="game-card-image" loading="lazy" data-fallback="true">`
        : '<div class="game-card-placeholder">🎲</div>';

    const metaItems = [];
    if (game.minPlayers || game.maxPlayers) {
        const players = game.minPlayers === game.maxPlayers 
            ? `${game.minPlayers}` 
            : `${game.minPlayers || '?'}-${game.maxPlayers || '?'}`;
        metaItems.push(`<span>👥 ${players}</span>`);
    }
    if (game.playTime) {
        metaItems.push(`<span>⏱️ ${formatDuration(game.playTime)}</span>`);
    }
    if (game.complexity) {
        metaItems.push(`<span>⚖️ ${game.complexity}/5</span>`);
    }
    if (game.yearPublished) {
        metaItems.push(`<span>📅 ${game.yearPublished}</span>`);
    }

    const ratingHtml = game.rating 
        ? `<div class="game-card-rating">
            <span class="rating-stars">${ratingToStars(game.rating)}</span>
            <span class="rating-value">${game.rating}/10</span>
           </div>`
        : '';

    return `
        <article class="game-card">
            ${imageHtml}
            <div class="game-card-content">
                <div class="game-card-header">
                    <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
                    <span class="game-card-status ${statusClass}">${statusLabel}</span>
                </div>
                ${metaItems.length > 0 ? `<div class="game-card-meta">${metaItems.join('')}</div>` : ''}
                ${ratingHtml}
                <div class="game-card-stats">
                    <div class="game-stat">
                        <span class="game-stat-label">Plays</span>
                        <span class="game-stat-value">${playCount}</span>
                    </div>
                    <div class="game-stat">
                        <span class="game-stat-label">Last Played</span>
                        <span class="game-stat-value">${lastPlayed ? formatDate(lastPlayed) : 'Never'}</span>
                    </div>
                </div>
                <div class="game-card-actions">
                    <button class="btn btn-secondary btn-small" onclick="openPlaySessionModal('${game.id}')" title="Log a play">
                        ▶️ Log Play
                    </button>
                    <button class="btn btn-info btn-small" onclick="showGameDetails('${game.id}')" title="View details">
                        📋 Details
                    </button>
                    <button class="btn btn-ghost btn-small" onclick="openEditGameModal('${game.id}')" title="Edit game">
                        ✏️
                    </button>
                </div>
            </div>
        </article>
    `;
}

/**
 * Render recent play sessions
 */
function renderSessions() {
    const recentSessionsDiv = document.getElementById('recentSessions');
    if (!recentSessionsDiv) return;

    // Sort sessions by date, newest first
    const sortedSessions = [...sessions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    if (sortedSessions.length === 0) {
        recentSessionsDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎮</div>
                <p>No play sessions logged yet. Start by logging your first play!</p>
            </div>
        `;
        return;
    }

    recentSessionsDiv.innerHTML = `
        <div class="session-list">
            ${sortedSessions.slice(0, 50).map(session => renderSessionItem(session)).join('')}
        </div>
    `;

    // Update game dropdown for session modal
    updateGameDropdown();
}

/**
 * Render a single session item
 * @param {PlaySession} session - Session to render
 * @returns {string} HTML string
 */
function renderSessionItem(session) {
    const game = getGameById(session.gameId);
    const gameName = game ? game.title : 'Unknown Game';

    const detailItems = [];
    if (session.players && session.players.length > 0) {
        detailItems.push(`<span class="session-detail session-players">👥 ${session.players.map(escapeHtml).join(', ')}</span>`);
    }
    if (session.winners && session.winners.length > 0) {
        detailItems.push(`<span class="session-detail session-winners">🏆 ${session.winners.map(escapeHtml).join(', ')}</span>`);
    }
    if (session.duration) {
        detailItems.push(`<span class="session-detail session-duration">⏱️ ${formatDuration(session.duration)}</span>`);
    }

    return `
        <div class="play-session">
            <div class="session-header">
                <span class="session-game">${escapeHtml(gameName)}</span>
                <span class="session-date">📅 ${formatDate(session.date)}</span>
            </div>
            ${detailItems.length > 0 ? `<div class="session-details">${detailItems.join('')}</div>` : ''}
            ${session.notes ? `<div class="session-notes">📝 ${escapeHtml(session.notes)}</div>` : ''}
            <div class="session-actions">
                <button class="btn btn-ghost btn-small" onclick="editSession('${session.id}')" title="Edit session">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="confirmDeleteSession('${session.id}')" title="Delete session">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
}

/**
 * Update the game dropdown in session modal
 */
function updateGameDropdown() {
    const dropdown = document.getElementById('sessionGame');
    if (!dropdown) return;

    const ownedGames = games.filter(g => g.status === 'owned')
        .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    dropdown.innerHTML = `
        <option value="">Select a game...</option>
        ${ownedGames.map(game => 
            `<option value="${game.id}">${escapeHtml(game.title)}</option>`
        ).join('')}
    `;
}

/**
 * Render statistics
 */
function renderStatistics() {
    renderCollectionStats();
    renderMostPlayedGames();
    renderFrequentPlayers();
    renderPlayHistory();
}

/**
 * Render collection overview statistics
 */
function renderCollectionStats() {
    const container = document.getElementById('collectionStats');
    if (!container) return;

    const owned = games.filter(g => g.status === 'owned').length;
    const wishlist = games.filter(g => g.status === 'wishlist').length;
    const previouslyOwned = games.filter(g => g.status === 'previously-owned').length;
    const totalPlays = sessions.length;

    // Calculate total play time
    const totalPlayTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    container.innerHTML = `
        <div class="stat-item">
            <span class="stat-item-name">📚 Games Owned</span>
            <span class="stat-item-value">${owned}</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-name">⭐ Wishlist</span>
            <span class="stat-item-value">${wishlist}</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-name">📤 Previously Owned</span>
            <span class="stat-item-value">${previouslyOwned}</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-name">🎮 Total Plays</span>
            <span class="stat-item-value">${totalPlays}</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-name">⏱️ Total Play Time</span>
            <span class="stat-item-value">${formatDuration(totalPlayTime) || '0 min'}</span>
        </div>
    `;
}

/**
 * Render most played games
 */
function renderMostPlayedGames() {
    const container = document.getElementById('mostPlayedGames');
    if (!container) return;

    // Count plays per game
    const playCounts = {};
    sessions.forEach(session => {
        playCounts[session.gameId] = (playCounts[session.gameId] || 0) + 1;
    });

    // Sort and get top 10
    const topGames = Object.entries(playCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (topGames.length === 0) {
        container.innerHTML = '<p class="help-text">No plays logged yet.</p>';
        return;
    }

    const maxPlays = topGames[0][1];

    container.innerHTML = topGames.map(([gameId, count]) => {
        const game = getGameById(gameId);
        const name = game ? game.title : 'Unknown';
        const percentage = (count / maxPlays) * 100;

        return `
            <div class="stat-item">
                <div style="flex: 1;">
                    <div class="stat-item-name">${escapeHtml(name)}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="stat-item-value">${count}</span>
            </div>
        `;
    }).join('');
}

/**
 * Render frequent players
 */
function renderFrequentPlayers() {
    const container = document.getElementById('frequentPlayers');
    if (!container) return;

    // Count plays per player
    const playerCounts = {};
    sessions.forEach(session => {
        if (session.players) {
            session.players.forEach(player => {
                playerCounts[player] = (playerCounts[player] || 0) + 1;
            });
        }
    });

    // Sort and get top 10
    const topPlayers = Object.entries(playerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (topPlayers.length === 0) {
        container.innerHTML = '<p class="help-text">No players recorded yet.</p>';
        return;
    }

    const maxPlays = topPlayers[0][1];

    container.innerHTML = topPlayers.map(([player, count]) => {
        const percentage = (count / maxPlays) * 100;

        return `
            <div class="stat-item">
                <div style="flex: 1;">
                    <div class="stat-item-name">👤 ${escapeHtml(player)}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="stat-item-value">${count} plays</span>
            </div>
        `;
    }).join('');
}

/**
 * Render play history by month
 */
function renderPlayHistory() {
    const container = document.getElementById('playHistory');
    if (!container) return;

    // Group sessions by month
    const monthCounts = {};
    sessions.forEach(session => {
        const date = new Date(session.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Get last 12 months
    const months = Object.keys(monthCounts)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 12);

    if (months.length === 0) {
        container.innerHTML = '<p class="help-text">No play history available.</p>';
        return;
    }

    const maxCount = Math.max(...months.map(m => monthCounts[m]));

    container.innerHTML = months.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(year, parseInt(month) - 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const count = monthCounts[monthKey];
        const percentage = (count / maxCount) * 100;

        return `
            <div class="stat-item">
                <div style="flex: 1;">
                    <div class="stat-item-name">${monthName}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="stat-item-value">${count}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// Modal Functions
// ============================================

/**
 * Open a modal
 * @param {string} modalId - ID of the modal element
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Focus the first focusable element
        const focusable = modal.querySelector('button, input, select, textarea');
        if (focusable) {
            setTimeout(() => focusable.focus(), 100);
        }
    }
}

/**
 * Close a modal
 * @param {string} modalId - ID of the modal element
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

/**
 * Open the add game modal
 */
function openAddGameModal() {
    document.getElementById('gameModalTitle').textContent = 'Add New Game';
    document.getElementById('gameForm').reset();
    document.getElementById('gameId').value = '';
    document.getElementById('gameStatus').value = 'owned';
    openModal('gameModal');
}

/**
 * Open the edit game modal
 * @param {string} gameId - ID of game to edit
 */
function openEditGameModal(gameId) {
    const game = getGameById(gameId);
    if (!game) return;

    document.getElementById('gameModalTitle').textContent = 'Edit Game';
    document.getElementById('gameId').value = game.id;
    document.getElementById('gameTitle').value = game.title || '';
    document.getElementById('gameYear').value = game.yearPublished || '';
    document.getElementById('gameDesigner').value = game.designer || '';
    document.getElementById('gamePublisher').value = game.publisher || '';
    document.getElementById('gameMinPlayers').value = game.minPlayers || '';
    document.getElementById('gameMaxPlayers').value = game.maxPlayers || '';
    document.getElementById('gamePlayTime').value = game.playTime || '';
    document.getElementById('gameComplexity').value = game.complexity || '';
    document.getElementById('gameRating').value = game.rating || '';
    document.getElementById('gameStatus').value = game.status || 'owned';
    document.getElementById('gameCategories').value = game.categories || '';
    document.getElementById('gameAcquisitionDate').value = game.acquisitionDate || '';
    document.getElementById('gameImageUrl').value = game.imageUrl || '';
    document.getElementById('gameNotes').value = game.notes || '';

    openModal('gameModal');
}

/**
 * Open play session modal for a specific game
 * @param {string} gameId - ID of game to log play for
 */
function openPlaySessionModal(gameId) {
    updateGameDropdown();
    document.getElementById('playSessionForm').reset();
    document.getElementById('sessionId').value = '';
    document.getElementById('sessionGameId').value = gameId || '';
    document.getElementById('sessionGame').value = gameId || '';
    document.getElementById('sessionDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('playSessionModalTitle').textContent = 'Log Play Session';
    openModal('playSessionModal');
}

/**
 * Edit an existing session
 * @param {string} sessionId - ID of session to edit
 */
function editSession(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    updateGameDropdown();
    document.getElementById('sessionId').value = session.id;
    document.getElementById('sessionGameId').value = session.gameId;
    document.getElementById('sessionGame').value = session.gameId;
    document.getElementById('sessionDate').value = session.date;
    document.getElementById('sessionDuration').value = session.duration || '';
    document.getElementById('sessionPlayers').value = session.players ? session.players.join(', ') : '';
    document.getElementById('sessionWinners').value = session.winners ? session.winners.join(', ') : '';
    document.getElementById('sessionNotes').value = session.notes || '';

    document.getElementById('playSessionModalTitle').textContent = 'Edit Play Session';
    openModal('playSessionModal');
}

/**
 * Show game details modal
 * @param {string} gameId - ID of game to show
 */
function showGameDetails(gameId) {
    const game = getGameById(gameId);
    if (!game) return;

    const gameSessions = getSessionsForGame(gameId);
    const container = document.getElementById('gameDetailsContent');

    const imageHtml = game.imageUrl
        ? `<img src="${escapeHtml(game.imageUrl)}" alt="${escapeHtml(game.title)} box art" class="game-details-image" data-fallback="true">`
        : '<div class="game-details-image-placeholder">🎲</div>';

    const metaItems = [];
    if (game.yearPublished) metaItems.push(`<span>📅 ${game.yearPublished}</span>`);
    if (game.designer) metaItems.push(`<span>✏️ ${escapeHtml(game.designer)}</span>`);
    if (game.publisher) metaItems.push(`<span>🏭 ${escapeHtml(game.publisher)}</span>`);
    if (game.minPlayers || game.maxPlayers) {
        const players = game.minPlayers === game.maxPlayers 
            ? `${game.minPlayers}` 
            : `${game.minPlayers || '?'}-${game.maxPlayers || '?'}`;
        metaItems.push(`<span>👥 ${players} players</span>`);
    }
    if (game.playTime) metaItems.push(`<span>⏱️ ${formatDuration(game.playTime)}</span>`);
    if (game.complexity) metaItems.push(`<span>⚖️ Complexity: ${game.complexity}/5</span>`);
    if (game.rating) metaItems.push(`<span>⭐ Rating: ${game.rating}/10</span>`);
    if (game.categories) metaItems.push(`<span>🏷️ ${escapeHtml(game.categories)}</span>`);

    const sessionsHtml = gameSessions.length > 0
        ? gameSessions.slice(0, 20).map(session => {
            const details = [];
            if (session.players && session.players.length > 0) {
                details.push(`👥 ${session.players.map(escapeHtml).join(', ')}`);
            }
            if (session.winners && session.winners.length > 0) {
                details.push(`🏆 ${session.winners.map(escapeHtml).join(', ')}`);
            }
            if (session.duration) {
                details.push(`⏱️ ${formatDuration(session.duration)}`);
            }

            return `
                <div class="play-session">
                    <div class="session-date">📅 ${formatDate(session.date)}</div>
                    ${details.length > 0 ? `<div class="session-details">${details.map(d => `<span class="session-detail">${d}</span>`).join('')}</div>` : ''}
                    ${session.notes ? `<div class="session-notes">📝 ${escapeHtml(session.notes)}</div>` : ''}
                </div>
            `;
        }).join('')
        : '<div class="no-sessions">No play sessions logged for this game.</div>';

    container.innerHTML = `
        <div class="game-details-header">
            ${imageHtml}
            <div class="game-details-info">
                <h2 class="game-details-title">${escapeHtml(game.title)}</h2>
                <div class="game-details-meta">${metaItems.join('')}</div>
            </div>
        </div>
        ${game.notes ? `
            <div class="game-details-section">
                <h3>📝 Notes</h3>
                <p class="game-details-notes">${escapeHtml(game.notes)}</p>
            </div>
        ` : ''}
        <div class="game-details-section">
            <h3>🎮 Play History (${gameSessions.length} plays)</h3>
            ${sessionsHtml}
        </div>
        <div class="form-actions" style="border-top: 1px solid var(--border-color); margin-top: 20px; padding-top: 20px;">
            <button class="btn btn-secondary" onclick="openPlaySessionModal('${game.id}'); closeModal('gameDetailsModal');">
                ▶️ Log Play
            </button>
            <button class="btn btn-info" onclick="openEditGameModal('${game.id}'); closeModal('gameDetailsModal');">
                ✏️ Edit Game
            </button>
            <button class="btn btn-danger" onclick="confirmDeleteGame('${game.id}')">
                🗑️ Delete Game
            </button>
        </div>
    `;

    openModal('gameDetailsModal');
}

// ============================================
// Confirmation Dialogs
// ============================================

let pendingConfirmAction = null;

/**
 * Show confirmation dialog
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Function to call on confirm
 */
function showConfirm(message, onConfirm) {
    document.getElementById('confirmMessage').textContent = message;
    pendingConfirmAction = onConfirm;
    openModal('confirmModal');
}

/**
 * Confirm delete game
 * @param {string} gameId - ID of game to delete
 */
function confirmDeleteGame(gameId) {
    const game = getGameById(gameId);
    if (!game) return;

    showConfirm(
        `Are you sure you want to delete "${game.title}"? This will also delete all ${getPlayCount(gameId)} play sessions for this game.`,
        () => {
            deleteGame(gameId);
            closeAllModals();
        }
    );
}

/**
 * Confirm delete session
 * @param {string} sessionId - ID of session to delete
 */
function confirmDeleteSession(sessionId) {
    showConfirm(
        'Are you sure you want to delete this play session?',
        () => {
            deleteSession(sessionId);
            closeModal('confirmModal');
        }
    );
}

// ============================================
// Data Import/Export
// ============================================

/**
 * Export all data to JSON file
 */
function exportData() {
    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        games: games,
        sessions: sessions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-game-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 */
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.games || !Array.isArray(data.games)) {
                throw new Error('Invalid data format: missing games array');
            }

            // Confirm before importing
            const gameCount = data.games.length;
            const sessionCount = data.sessions?.length || 0;

            if (confirm(`Import ${gameCount} games and ${sessionCount} sessions? This will replace your current data.`)) {
                games = data.games.map(migrateGameData);
                sessions = data.sessions || [];
                saveGames();
                saveSessions();
                renderGames();
                renderSessions();
                alert('Data imported successfully!');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load data and render
    loadData();
    renderGames();
    updateGameDropdown();

    // Handle image load errors safely using event delegation
    // Handle image load errors safely using event delegation
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG' && e.target.dataset.fallback === 'true') {
            // Ensure parent node exists before attempting replacement
            if (e.target.parentNode) {
                const placeholder = document.createElement('div');
                placeholder.className = e.target.classList.contains('game-card-image') 
                    ? 'game-card-placeholder' 
                    : 'game-details-image-placeholder';
                placeholder.textContent = '🎲';
                e.target.parentNode.replaceChild(placeholder, e.target);
            }
        }
    }, true);

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Add game button
    document.getElementById('addGameBtn')?.addEventListener('click', openAddGameModal);

    // Quick play button
    document.getElementById('quickPlayBtn')?.addEventListener('click', () => openPlaySessionModal());

    // Game form submission
    document.getElementById('gameForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const gameData = {
            id: document.getElementById('gameId').value || undefined,
            title: document.getElementById('gameTitle').value.trim(),
            yearPublished: parseInt(document.getElementById('gameYear').value) || undefined,
            designer: document.getElementById('gameDesigner').value.trim() || undefined,
            publisher: document.getElementById('gamePublisher').value.trim() || undefined,
            minPlayers: parseInt(document.getElementById('gameMinPlayers').value) || undefined,
            maxPlayers: parseInt(document.getElementById('gameMaxPlayers').value) || undefined,
            playTime: parseInt(document.getElementById('gamePlayTime').value) || undefined,
            complexity: parseFloat(document.getElementById('gameComplexity').value) || undefined,
            rating: parseFloat(document.getElementById('gameRating').value) || undefined,
            status: document.getElementById('gameStatus').value,
            categories: document.getElementById('gameCategories').value.trim() || undefined,
            acquisitionDate: document.getElementById('gameAcquisitionDate').value || undefined,
            imageUrl: document.getElementById('gameImageUrl').value.trim() || undefined,
            notes: document.getElementById('gameNotes').value.trim() || undefined
        };

        saveGame(gameData);
        closeModal('gameModal');
    });

    // Cancel game button
    document.getElementById('cancelGameBtn')?.addEventListener('click', () => closeModal('gameModal'));

    // Play session form submission
    document.getElementById('playSessionForm')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const playersInput = document.getElementById('sessionPlayers').value.trim();
        const winnersInput = document.getElementById('sessionWinners').value.trim();

        const sessionData = {
            id: document.getElementById('sessionId').value || undefined,
            gameId: document.getElementById('sessionGame').value,
            date: document.getElementById('sessionDate').value,
            duration: parseInt(document.getElementById('sessionDuration').value) || undefined,
            players: playersInput ? playersInput.split(',').map(p => p.trim()).filter(Boolean) : undefined,
            winners: winnersInput ? winnersInput.split(',').map(w => w.trim()).filter(Boolean) : undefined,
            notes: document.getElementById('sessionNotes').value.trim() || undefined
        };

        saveSession(sessionData);
        closeModal('playSessionModal');
    });

    // Cancel session button
    document.getElementById('cancelSessionBtn')?.addEventListener('click', () => closeModal('playSessionModal'));

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Confirm dialog buttons
    document.getElementById('confirmOk')?.addEventListener('click', () => {
        if (pendingConfirmAction) {
            pendingConfirmAction();
            pendingConfirmAction = null;
        }
        closeModal('confirmModal');
    });

    document.getElementById('confirmCancel')?.addEventListener('click', () => {
        pendingConfirmAction = null;
        closeModal('confirmModal');
    });

    // Search and filter
    document.getElementById('searchGames')?.addEventListener('input', renderGames);
    document.getElementById('filterStatus')?.addEventListener('change', renderGames);
    document.getElementById('sortGames')?.addEventListener('change', renderGames);

    // Export button
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);

    // Import file input
    document.getElementById('importDataInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importData(file);
            e.target.value = ''; // Reset input
        }
    });

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
});
