// Data structure for storing games and play sessions
let games = [];

// Load data from localStorage on startup
function loadData() {
    const savedGames = localStorage.getItem('gamesData');
    if (savedGames) {
        games = JSON.parse(savedGames);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('gamesData', JSON.stringify(games));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Add a new game
function addGame(name) {
    const game = {
        id: generateId(),
        name: name,
        playSessions: []
    };
    games.push(game);
    saveData();
    renderGames();
}

// Delete a game
function deleteGame(gameId) {
    if (confirm('Weet je zeker dat je dit spel wilt verwijderen?')) {
        games = games.filter(game => game.id !== gameId);
        saveData();
        renderGames();
    }
}

// Add a play session to a game
function addPlaySession(gameId, date, winner, notes) {
    const game = games.find(g => g.id === gameId);
    if (game) {
        game.playSessions.push({
            id: generateId(),
            date: date,
            winner: winner,
            notes: notes
        });
        saveData();
        renderGames();
    }
}

// Get game statistics
function getGameStats(game) {
    const playCount = game.playSessions.length;
    const winners = {};
    
    game.playSessions.forEach(session => {
        if (session.winner) {
            winners[session.winner] = (winners[session.winner] || 0) + 1;
        }
    });
    
    const topWinner = Object.entries(winners).sort((a, b) => b[1] - a[1])[0];
    
    return {
        playCount,
        topWinner: topWinner ? `${topWinner[0]} (${topWinner[1]}x)` : 'Geen winnaar'
    };
}

// Render all games
function renderGames() {
    const gamesList = document.getElementById('gamesList');
    
    if (games.length === 0) {
        gamesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎮</div>
                <p>Nog geen spellen toegevoegd. Voeg je eerste spel toe!</p>
            </div>
        `;
        return;
    }
    
    gamesList.innerHTML = games.map(game => {
        const stats = getGameStats(game);
        return `
            <div class="game-item">
                <div class="game-header">
                    <div class="game-name">${escapeHtml(game.name)}</div>
                </div>
                <div class="game-stats">
                    <div class="stat">
                        <span class="stat-label">Aantal keer gespeeld</span>
                        <span class="stat-value">${stats.playCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Meeste overwinningen</span>
                        <span class="stat-value">${escapeHtml(stats.topWinner)}</span>
                    </div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-secondary" onclick="openPlaySessionModal('${game.id}')">
                        Speelsessie Toevoegen
                    </button>
                    <button class="btn btn-info" onclick="showGameDetails('${game.id}')">
                        Details Bekijken
                    </button>
                    <button class="btn btn-danger" onclick="deleteGame('${game.id}')">
                        Verwijderen
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open play session modal
function openPlaySessionModal(gameId) {
    const modal = document.getElementById('playSessionModal');
    document.getElementById('sessionGameId').value = gameId;
    document.getElementById('playDate').value = new Date().toISOString().split('T')[0];
    modal.style.display = 'block';
}

// Show game details
function showGameDetails(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    const modal = document.getElementById('gameDetailsModal');
    const content = document.getElementById('gameDetailsContent');
    
    const stats = getGameStats(game);
    
    let sessionsHtml = '';
    if (game.playSessions.length === 0) {
        sessionsHtml = '<div class="no-sessions">Nog geen speelsessies</div>';
    } else {
        // Sort sessions by date (newest first)
        const sortedSessions = [...game.playSessions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        sessionsHtml = sortedSessions.map(session => `
            <div class="play-session">
                <div class="session-date">📅 ${formatDate(session.date)}</div>
                ${session.winner ? `<div class="session-winner">🏆 Winnaar: ${escapeHtml(session.winner)}</div>` : ''}
                ${session.notes ? `<div class="session-notes">📝 ${escapeHtml(session.notes)}</div>` : ''}
            </div>
        `).join('');
    }
    
    content.innerHTML = `
        <h2>${escapeHtml(game.name)}</h2>
        <div class="game-stats" style="margin: 20px 0;">
            <div class="stat">
                <span class="stat-label">Aantal keer gespeeld</span>
                <span class="stat-value">${stats.playCount}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Meeste overwinningen</span>
                <span class="stat-value">${escapeHtml(stats.topWinner)}</span>
            </div>
        </div>
        <h3 style="margin-bottom: 15px; color: #333;">Speelsessies</h3>
        ${sessionsHtml}
    `;
    
    modal.style.display = 'block';
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('nl-NL', options);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderGames();
    
    // Add game form
    document.getElementById('addGameForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const gameName = document.getElementById('gameName').value.trim();
        if (gameName) {
            addGame(gameName);
            document.getElementById('gameName').value = '';
        }
    });
    
    // Add play session form
    document.getElementById('addPlaySessionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const gameId = document.getElementById('sessionGameId').value;
        const date = document.getElementById('playDate').value;
        const winner = document.getElementById('winner').value.trim();
        const notes = document.getElementById('notes').value.trim();
        
        addPlaySession(gameId, date, winner, notes);
        
        // Close modal and reset form
        document.getElementById('playSessionModal').style.display = 'none';
        document.getElementById('addPlaySessionForm').reset();
    });
    
    // Close modals when clicking on X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});
