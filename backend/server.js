const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tuxman_secret_key_change_in_production';
const SALT_ROUNDS = 10;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tuxman',
    password: process.env.DB_PASSWORD || 'tuxman123',
    database: process.env.DB_NAME || 'tuxman',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Initialize database tables
async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                coins INTEGER DEFAULT 50,
                best_score INTEGER DEFAULT 0,
                games_played INTEGER DEFAULT 0,
                equipped_skin VARCHAR(50) DEFAULT 'default',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS owned_skins (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skin_id VARCHAR(50) NOT NULL,
                purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, skin_id)
            );

            CREATE TABLE IF NOT EXISTS game_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                level INTEGER NOT NULL,
                tokens_earned INTEGER NOT NULL,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_owned_skins_user ON owned_skins(user_id);
            CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id);
            CREATE INDEX IF NOT EXISTS idx_users_best_score ON users(best_score DESC);
        `);
        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Auth middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Usuario mínimo 3 caracteres' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Contraseña mínimo 4 caracteres' });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Check if user exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE username = $1',
            [normalizedUsername]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await client.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [normalizedUsername, hashedPassword]
        );

        const userId = result.rows[0].id;

        // Add default skin
        await client.query(
            'INSERT INTO owned_skins (user_id, skin_id) VALUES ($1, $2)',
            [userId, 'default']
        );

        // Generate token
        const token = jwt.sign(
            { id: userId, username: normalizedUsername },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Usuario creado correctamente',
            token,
            user: {
                id: userId,
                username: normalizedUsername,
                coins: 50,
                bestScore: 0,
                equippedSkin: 'default',
                ownedSkins: ['default']
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Find user
        const userResult = await client.query(
            'SELECT * FROM users WHERE username = $1',
            [normalizedUsername]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const user = userResult.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Get owned skins
        const skinsResult = await client.query(
            'SELECT skin_id FROM owned_skins WHERE user_id = $1',
            [user.id]
        );
        const ownedSkins = skinsResult.rows.map(s => s.skin_id);

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login correcto',
            token,
            user: {
                id: user.id,
                username: user.username,
                coins: user.coins,
                bestScore: user.best_score,
                gamesPlayed: user.games_played,
                equippedSkin: user.equipped_skin,
                ownedSkins
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// Verify token & get user data
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userResult = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = userResult.rows[0];

        const skinsResult = await client.query(
            'SELECT skin_id FROM owned_skins WHERE user_id = $1',
            [user.id]
        );
        const ownedSkins = skinsResult.rows.map(s => s.skin_id);

        res.json({
            user: {
                id: user.id,
                username: user.username,
                coins: user.coins,
                bestScore: user.best_score,
                gamesPlayed: user.games_played,
                equippedSkin: user.equipped_skin,
                ownedSkins
            }
        });

    } catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// ==================== GAME ROUTES ====================

// Save game result
app.post('/api/game/save', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { score, level } = req.body;
        const userId = req.user.id;

        if (typeof score !== 'number' || typeof level !== 'number') {
            return res.status(400).json({ error: 'Score y level requeridos' });
        }

        const tokensEarned = Math.floor(score / 10);

        // Get current user data
        const userResult = await client.query(
            'SELECT best_score FROM users WHERE id = $1',
            [userId]
        );
        const currentBestScore = userResult.rows[0].best_score;
        const newBestScore = Math.max(currentBestScore, score);

        // Update user stats
        await client.query(
            `UPDATE users 
             SET coins = coins + $1, 
                 best_score = $2, 
                 games_played = games_played + 1 
             WHERE id = $3`,
            [tokensEarned, newBestScore, userId]
        );

        // Save to history
        await client.query(
            `INSERT INTO game_history (user_id, score, level, tokens_earned)
             VALUES ($1, $2, $3, $4)`,
            [userId, score, level, tokensEarned]
        );

        // Get updated user
        const updatedResult = await client.query(
            'SELECT coins, best_score, games_played FROM users WHERE id = $1',
            [userId]
        );
        const updatedUser = updatedResult.rows[0];

        res.json({
            message: 'Partida guardada',
            tokensEarned,
            newBest: score > currentBestScore,
            user: {
                coins: updatedUser.coins,
                bestScore: updatedUser.best_score,
                gamesPlayed: updatedUser.games_played
            }
        });

    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// ==================== SHOP ROUTES ====================

// Buy skin
app.post('/api/shop/buy', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { skinId, price } = req.body;
        const userId = req.user.id;

        if (!skinId || typeof price !== 'number') {
            return res.status(400).json({ error: 'Skin y precio requeridos' });
        }

        // Check if already owned
        const ownedResult = await client.query(
            'SELECT id FROM owned_skins WHERE user_id = $1 AND skin_id = $2',
            [userId, skinId]
        );

        if (ownedResult.rows.length > 0) {
            return res.status(400).json({ error: 'Ya tienes esta skin' });
        }

        // Check coins
        const userResult = await client.query(
            'SELECT coins FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows[0].coins < price) {
            return res.status(400).json({ error: 'No tienes suficientes tokens' });
        }

        // Purchase (transaction)
        await client.query('BEGIN');
        await client.query(
            'UPDATE users SET coins = coins - $1 WHERE id = $2',
            [price, userId]
        );
        await client.query(
            'INSERT INTO owned_skins (user_id, skin_id) VALUES ($1, $2)',
            [userId, skinId]
        );
        await client.query('COMMIT');

        const updatedResult = await client.query(
            'SELECT coins FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            message: 'Skin comprada',
            coins: updatedResult.rows[0].coins
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Buy skin error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// Equip skin
app.post('/api/shop/equip', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { skinId } = req.body;
        const userId = req.user.id;

        if (!skinId) {
            return res.status(400).json({ error: 'Skin requerida' });
        }

        // Check if owned
        const ownedResult = await client.query(
            'SELECT id FROM owned_skins WHERE user_id = $1 AND skin_id = $2',
            [userId, skinId]
        );

        if (ownedResult.rows.length === 0) {
            return res.status(400).json({ error: 'No tienes esta skin' });
        }

        // Equip
        await client.query(
            'UPDATE users SET equipped_skin = $1 WHERE id = $2',
            [skinId, userId]
        );

        res.json({ message: 'Skin equipada', equippedSkin: skinId });

    } catch (error) {
        console.error('Equip skin error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// ==================== LEADERBOARD ====================

app.get('/api/leaderboard', async (req, res) => {
    const client = await pool.connect();
    try {
        const limit = parseInt(req.query.limit) || 10;

        const result = await client.query(
            `SELECT username, best_score, games_played, equipped_skin
             FROM users
             WHERE best_score > 0
             ORDER BY best_score DESC
             LIMIT $1`,
            [limit]
        );

        res.json({ leaderboard: result.rows });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// ==================== USER STATS ====================

app.get('/api/user/history', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const limit = parseInt(req.query.limit) || 20;

        const result = await client.query(
            `SELECT score, level, tokens_earned, played_at
             FROM game_history
             WHERE user_id = $1
             ORDER BY played_at DESC
             LIMIT $2`,
            [req.user.id, limit]
        );

        res.json({ history: result.rows });

    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// Serve frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
    try {
        console.log('🔄 Connecting to PostgreSQL...');
        await initDatabase();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🐧 TuxMan server running on port ${PORT}`);
            console.log(`📦 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();
