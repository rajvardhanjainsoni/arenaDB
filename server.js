import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Console logging middleware: logs HTTP method and route for every incoming request
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ============================================================
// PostgreSQL Database Connection Pool
// ============================================================
const pool = new Pool({
  user: 'rajvardhanjain04',
  host: 'localhost',
  database: 'arenadb',
  port: 5432,
});

let isPgConnected = false;

// Check DB connection on boot and log startup status. Exit process if connection fails.
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL database connection failed. Exiting process:', err.message);
    process.exit(1);
  } else {
    console.log('Database connected successfully');
    isPgConnected = true;
    release();
  }
});

// Helper for DB query execution
async function queryDB(sqlText, params = []) {
  const res = await pool.query(sqlText, params);
  return res.rows;
}

// ============================================================
// REST API ENDPOINTS (Strict PostgreSQL Execution)
// ============================================================

// 1. GET /api/tournaments
// List all tournaments directly from PostgreSQL database, ordered strictly by tournament_id DESC (newest first)
app.get('/api/tournaments', async (req, res) => {
  try {
    const sql = `
      SELECT 
        t.tournament_id,
        t.name,
        t.prize_pool,
        t.start_date,
        t.end_date,
        g.game_id,
        g.title AS game_title,
        g.genre,
        g.release_year,
        p.name AS publisher_name
      FROM TOURNAMENT t
      INNER JOIN GAME g ON t.game_id = g.game_id
      INNER JOIN PUBLISHER p ON g.publisher_id = p.publisher_id
      ORDER BY t.tournament_id DESC;
    `;
    const rows = await queryDB(sql);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch tournaments' });
  }
});

// 2. GET /api/leaderboard/:gameId
// Complex SQL JOIN query calculating top teams/players for a specific game (INNER JOIN, GROUP BY, Aggregate functions COUNT & SUM)
app.get('/api/leaderboard/:gameId', async (req, res) => {
  const gameId = parseInt(req.params.gameId);
  try {
    const sql = `
      SELECT 
        tm.team_id,
        tm.team_name,
        p.username AS captain_name,
        CAST(COUNT(DISTINCT mt.match_id) AS INT) AS total_matches,
        CAST(COUNT(DISTINCT CASE WHEN mt.winner_team_id = tm.team_id THEN mt.match_id END) AS INT) AS total_wins,
        CAST(COALESCE(SUM(mp.score), 0) AS INT) AS total_points
      FROM TEAM tm
      INNER JOIN PLAYER p ON tm.captain_id = p.player_id
      INNER JOIN MATCH_PARTICIPANT mp ON tm.team_id = mp.team_id
      INNER JOIN MATCH_TABLE mt ON mp.match_id = mt.match_id
      INNER JOIN TOURNAMENT t ON mt.tournament_id = t.tournament_id
      WHERE t.game_id = $1
      GROUP BY tm.team_id, tm.team_name, p.username
      ORDER BY total_wins DESC, total_points DESC;
    `;
    const rows = await queryDB(sql, [gameId]);
    return res.json(rows || []);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch leaderboard' });
  }
});

// 3. GET /api/campaigns
// Fetch publicity campaigns linked to sponsor orgs and tournaments
app.get('/api/campaigns', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.campaign_id,
        c.budget,
        c.platform,
        c.reach_metrics,
        o.org_id,
        o.name AS org_name,
        o.org_type,
        o.contact_email,
        t.tournament_id,
        t.name AS tournament_name
      FROM PUBLICITY_CAMPAIGN c
      INNER JOIN SPONSOR_ORG o ON c.org_id = o.org_id
      INNER JOIN TOURNAMENT t ON c.tournament_id = t.tournament_id
      ORDER BY c.budget DESC;
    `;
    const rows = await queryDB(sql);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch campaigns' });
  }
});

// 4. POST /api/telemetry
// Parameterized insert to log a player's ping and OS data after a match
app.post('/api/telemetry', async (req, res) => {
  const { match_id, player_id, avg_ping_ms, os_version, disconnect_count } = req.body;

  if (!match_id || !player_id || avg_ping_ms === undefined || !os_version) {
    return res.status(400).json({ error: 'Missing required fields: match_id, player_id, avg_ping_ms, os_version' });
  }

  try {
    const sql = `
      INSERT INTO MATCH_TELEMETRY (match_id, player_id, avg_ping_ms, os_version, disconnect_count)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const params = [
      parseInt(match_id),
      parseInt(player_id),
      parseFloat(avg_ping_ms),
      os_version,
      parseInt(disconnect_count || 0)
    ];
    const rows = await queryDB(sql, params);
    return res.status(201).json({ message: 'Telemetry logged successfully', data: rows[0] });
  } catch (err) {
    console.error('Error logging telemetry:', err);
    res.status(500).json({ error: err.message || 'Failed to log telemetry data' });
  }
});

// 5. GET /api/telemetry
// Fetch all match telemetry records for dashboard widget
app.get('/api/telemetry', async (req, res) => {
  try {
    const sql = `
      SELECT 
        mt.telemetry_id,
        mt.match_id,
        m.stage AS match_stage,
        mt.player_id,
        p.username,
        mt.avg_ping_ms,
        mt.os_version,
        mt.disconnect_count,
        mt.created_at
      FROM MATCH_TELEMETRY mt
      INNER JOIN PLAYER p ON mt.player_id = p.player_id
      INNER JOIN MATCH_TABLE m ON mt.match_id = m.match_id
      ORDER BY mt.created_at DESC;
    `;
    const rows = await queryDB(sql);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching telemetry:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch telemetry data' });
  }
});

// 6. GET /api/games
app.get('/api/games', async (req, res) => {
  try {
    const rows = await queryDB('SELECT game_id, title, genre FROM GAME ORDER BY title;');
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch games' });
  }
});

// 7. GET /api/players
app.get('/api/players', async (req, res) => {
  try {
    const rows = await queryDB('SELECT player_id, username, email, rank, credits, joined_date FROM PLAYER ORDER BY username;');
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch players' });
  }
});

// 8. GET /api/teams/:id - Fetch full team detail & roster members
app.get('/api/teams/:id', async (req, res) => {
  const teamId = parseInt(req.params.id);
  try {
    const teamSql = `
      SELECT t.team_id, t.team_name, t.created_date, t.captain_id, p.username AS captain_name, p.email AS captain_email
      FROM TEAM t
      INNER JOIN PLAYER p ON t.captain_id = p.player_id
      WHERE t.team_id = $1;
    `;
    const membersSql = `
      SELECT p.player_id, p.username, p.email, p.rank, p.credits, tm.joined_date
      FROM TEAM_MEMBER tm
      INNER JOIN PLAYER p ON tm.player_id = p.player_id
      WHERE tm.team_id = $1;
    `;
    const teamRows = await queryDB(teamSql, [teamId]);
    if (!teamRows || teamRows.length === 0) return res.status(404).json({ error: 'Team not found' });
    const members = await queryDB(membersSql, [teamId]);
    return res.json({ ...teamRows[0], members });
  } catch (err) {
    console.error('Error fetching team details:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch team details' });
  }
});

// 9. GET /api/players/:id - Fetch individual player profile details
app.get('/api/players/:id', async (req, res) => {
  const playerId = parseInt(req.params.id);
  try {
    const playerSql = `
      SELECT p.player_id, p.username, p.email, p.rank, p.credits, p.joined_date, tm.team_id, t.team_name
      FROM PLAYER p
      LEFT JOIN TEAM_MEMBER tm ON p.player_id = tm.player_id
      LEFT JOIN TEAM t ON tm.team_id = t.team_id
      WHERE p.player_id = $1;
    `;
    const rows = await queryDB(playerSql, [playerId]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching player profile:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch player details' });
  }
});

// 10. GET /api/stats
app.get('/api/stats', async (req, res) => {
  try {
    const tournaments = await queryDB('SELECT COUNT(*) FROM TOURNAMENT;');
    const sponsors = await queryDB('SELECT COUNT(*) FROM PUBLICITY_CAMPAIGN;');
    const highPing = await queryDB('SELECT COUNT(*) FROM MATCH_TELEMETRY WHERE avg_ping_ms > 80;');
    res.json({
      postgres_status: isPgConnected ? 'PostgreSQL Active' : 'Offline',
      tournaments_count: parseInt(tournaments[0]?.count || 0),
      sponsors_count: parseInt(sponsors[0]?.count || 0),
      high_ping_alerts: parseInt(highPing[0]?.count || 0)
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// 11. POST /api/tournaments
// Parameterized insert to add new tournament directly to PostgreSQL DB
app.post('/api/tournaments', async (req, res) => {
  const { name, prize_pool, start_date, end_date, game_id } = req.body;
  try {
    const sql = `INSERT INTO TOURNAMENT (name, prize_pool, start_date, end_date, game_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    const rows = await queryDB(sql, [name, parseFloat(prize_pool), start_date, end_date, parseInt(game_id)]);
    
    const detailsSql = `
      SELECT g.title AS game_title, g.genre, p.name AS publisher_name 
      FROM GAME g 
      INNER JOIN PUBLISHER p ON g.publisher_id = p.publisher_id 
      WHERE g.game_id = $1;
    `;
    const details = await queryDB(detailsSql, [parseInt(game_id)]);
    
    const newTournament = {
      ...rows[0],
      game_title: details[0]?.game_title || 'Valorant',
      genre: details[0]?.genre || 'Tactical Shooter',
      publisher_name: details[0]?.publisher_name || 'Riot Games'
    };
    return res.status(201).json(newTournament);
  } catch (err) { 
    console.error('Error in POST /api/tournaments:', err);
    res.status(500).json({ error: err.message || 'Failed to create tournament' }); 
  }
});

// 12. PUT /api/tournaments/:id - Edit full tournament details
// Parameterized update for tournament details
app.put('/api/tournaments/:id', async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  const { name, prize_pool, start_date, end_date, game_id } = req.body;

  try {
    const sql = `UPDATE TOURNAMENT SET name = $1, prize_pool = $2, start_date = $3, end_date = $4, game_id = $5 WHERE tournament_id = $6 RETURNING *;`;
    const rows = await queryDB(sql, [name, parseFloat(prize_pool), start_date, end_date, parseInt(game_id), tournamentId]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Tournament not found' });
    
    const detailsSql = `
      SELECT g.title AS game_title, g.genre, p.name AS publisher_name 
      FROM GAME g 
      INNER JOIN PUBLISHER p ON g.publisher_id = p.publisher_id 
      WHERE g.game_id = $1;
    `;
    const details = await queryDB(detailsSql, [parseInt(game_id)]);
    const result = {
      ...rows[0],
      game_title: details[0]?.game_title || 'Valorant',
      genre: details[0]?.genre || 'Tactical Shooter',
      publisher_name: details[0]?.publisher_name || 'Riot Games'
    };
    return res.json(result);
  } catch (err) {
    console.error('Error updating tournament:', err);
    res.status(500).json({ error: err.message || 'Failed to update tournament' });
  }
});

// 13. DELETE /api/tournaments/:id - Cancel & delete tournament
app.delete('/api/tournaments/:id', async (req, res) => {
  const tournamentId = parseInt(req.params.id);
  try {
    await queryDB('DELETE FROM TOURNAMENT WHERE tournament_id = $1;', [tournamentId]);
    return res.json({ message: 'Tournament deleted successfully' });
  } catch (err) {
    console.error('Error deleting tournament:', err);
    res.status(500).json({ error: err.message || 'Failed to delete tournament' });
  }
});

// 14. POST /api/players
app.post('/api/players', async (req, res) => {
  const username = req.body.username || 'UnknownPlayer';
  const email = req.body.email || 'unknown@example.com';
  const rank = req.body.rank || 'Unranked';
  const avatar_id = req.body.avatar_id || 'cyber-ninja';
  const joined_date = req.body.joined_date || new Date().toISOString().split('T')[0];

  try {
    const sql = `INSERT INTO PLAYER (username, email, rank, avatar_id, joined_date) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    const rows = await queryDB(sql, [username, email, rank, avatar_id, joined_date]);
    return res.status(201).json(rows[0]);
  } catch (err) { 
    console.error('Error in POST /api/players:', err);
    res.status(500).json({ error: err.message || 'Failed to create player' }); 
  }
});

// 15. POST /api/teams
app.post('/api/teams', async (req, res) => {
  const { team_name, created_date, captain_id } = req.body;
  const cId = parseInt(captain_id);
  try {
    const sql = `INSERT INTO TEAM (team_name, created_date, captain_id) VALUES ($1, $2, $3) RETURNING *;`;
    const rows = await queryDB(sql, [team_name, created_date, cId]);
    await queryDB(`INSERT INTO TEAM_MEMBER (team_id, player_id, joined_date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`, [rows[0].team_id, cId, created_date]);
    return res.status(201).json(rows[0]);
  } catch (err) { 
    console.error('Error in POST /api/teams:', err);
    res.status(500).json({ error: err.message || 'Failed to create team' }); 
  }
});

// 16. POST /api/teams/:id/members
app.post('/api/teams/:id/members', async (req, res) => {
  const teamId = parseInt(req.params.id);
  const { player_id } = req.body;
  const pId = parseInt(player_id);
  const joined_date = new Date().toISOString().split('T')[0];

  try {
    await queryDB(`INSERT INTO TEAM_MEMBER (team_id, player_id, joined_date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`, [teamId, pId, joined_date]);
    return res.status(201).json({ message: 'Player added to team roster' });
  } catch (err) {
    console.error('Error adding team member:', err);
    res.status(500).json({ error: err.message || 'Failed to add member' });
  }
});

// 17. DELETE /api/teams/:id
app.delete('/api/teams/:id', async (req, res) => {
  const teamId = parseInt(req.params.id);
  try {
    await queryDB('DELETE FROM TEAM WHERE team_id = $1;', [teamId]);
    return res.json({ message: 'Team disbanded successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: err.message || 'Failed to delete team' });
  }
});

// 18. PUT /api/players/:id
app.put('/api/players/:id', async (req, res) => {
  const playerId = parseInt(req.params.id);
  const { username, email, rank, avatar_id, team_id } = req.body;
  try {
    const sql = `UPDATE PLAYER SET username = $1, email = $2, rank = $3, avatar_id = $4 WHERE player_id = $5 RETURNING *;`;
    const rows = await queryDB(sql, [username, email, rank, avatar_id || 'cyber-ninja', playerId]);
    if (team_id) {
      await queryDB('DELETE FROM TEAM_MEMBER WHERE player_id = $1;', [playerId]);
      await queryDB('INSERT INTO TEAM_MEMBER (team_id, player_id) VALUES ($1, $2);', [parseInt(team_id), playerId]);
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error updating player:', err);
    res.status(500).json({ error: err.message || 'Failed to update player' });
  }
});

// 19. DELETE /api/players/:id
app.delete('/api/players/:id', async (req, res) => {
  const playerId = parseInt(req.params.id);
  try {
    await queryDB('DELETE FROM PLAYER WHERE player_id = $1;', [playerId]);
    return res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    console.error('Error deleting player:', err);
    res.status(500).json({ error: err.message || 'Failed to delete player' });
  }
});

// 20. GET /api/teams
app.get('/api/teams', async (req, res) => {
  try {
    const rows = await queryDB('SELECT * FROM TEAM ORDER BY team_name;');
    return res.json(rows);
  } catch (err) { 
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch teams' }); 
  }
});

// 21. POST /api/campaigns
app.post('/api/campaigns', async (req, res) => {
  const { org_name, tournament_id, budget, platform, reach_metrics } = req.body;
  try {
    let orgRes = await queryDB('SELECT org_id FROM SPONSOR_ORG WHERE name = $1;', [org_name]);
    if (orgRes.length === 0) {
      orgRes = await queryDB('INSERT INTO SPONSOR_ORG (name, org_type, contact_email) VALUES ($1, $2, $3) RETURNING org_id;', [org_name, 'External Brand', 'contact@' + org_name.replace(/\s/g, '').toLowerCase() + '.com']);
    }
    const org_id = orgRes[0].org_id;
    const sql = `INSERT INTO PUBLICITY_CAMPAIGN (org_id, tournament_id, budget, platform, reach_metrics) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    const rows = await queryDB(sql, [org_id, parseInt(tournament_id), parseFloat(budget), platform, parseInt(reach_metrics)]);
    return res.status(201).json(rows[0]);
  } catch (err) { 
    console.error('Error creating campaign:', err);
    res.status(500).json({ error: err.message || 'Failed to create campaign' }); 
  }
});

// ============================================================
// NOVELTY MODULE: IN-GAME STORE & VIRTUAL CURRENCY
// ============================================================

// 22. GET /api/store
app.get('/api/store', async (req, res) => {
  try {
    const sql = `
      SELECT s.item_id, s.name, s.item_type, s.rarity, s.price_credits, s.image_url, g.title AS game_title 
      FROM STORE_ITEM s 
      INNER JOIN GAME g ON s.game_id = g.game_id 
      ORDER BY s.price_credits DESC;
    `;
    const rows = await queryDB(sql);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching store items:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch store items' });
  }
});

// 23. GET /api/players/:playerId/inventory
app.get('/api/players/:playerId/inventory', async (req, res) => {
  const playerId = parseInt(req.params.playerId);
  try {
    const sql = `
      SELECT i.inventory_id, s.name, s.item_type, s.rarity, s.image_url, g.title AS game_title, i.purchase_date
      FROM PLAYER_INVENTORY i
      INNER JOIN STORE_ITEM s ON i.item_id = s.item_id
      INNER JOIN GAME g ON s.game_id = g.game_id
      WHERE i.player_id = $1
      ORDER BY i.purchase_date DESC;
    `;
    const rows = await queryDB(sql, [playerId]);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch inventory' });
  }
});

// 24. POST /api/store/buy (ACID Transaction)
app.post('/api/store/buy', async (req, res) => {
  const { player_id, item_id } = req.body;
  
  if (!player_id || !item_id) {
    return res.status(400).json({ error: 'Missing player_id or item_id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start Transaction
    
    // 1. Get player credits
    const playerRes = await client.query('SELECT credits FROM PLAYER WHERE player_id = $1', [player_id]);
    if (playerRes.rows.length === 0) {
      throw new Error('Player not found');
    }
    const credits = playerRes.rows[0].credits;
    
    // 2. Get item price
    const itemRes = await client.query('SELECT price_credits FROM STORE_ITEM WHERE item_id = $1', [item_id]);
    if (itemRes.rows.length === 0) {
      throw new Error('Item not found');
    }
    const price = itemRes.rows[0].price_credits;
    
    // 3. Check affordability
    if (credits < price) {
      throw new Error('Insufficient credits');
    }
    
    // 4. Deduct credits and add item
    await client.query('UPDATE PLAYER SET credits = credits - $1 WHERE player_id = $2', [price, player_id]);
    await client.query('INSERT INTO PLAYER_INVENTORY (player_id, item_id) VALUES ($1, $2)', [player_id, item_id]);
    
    await client.query('COMMIT'); // Commit Transaction
    
    return res.json({ message: 'Purchase successful', remaining_credits: credits - price });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback Transaction on error
    console.error('Error processing purchase:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 25. POST /api/store/refund (ACID Transaction)
app.post('/api/store/refund', async (req, res) => {
  const { player_id, item_id } = req.body;
  
  if (!player_id || !item_id) {
    return res.status(400).json({ error: 'Missing player_id or item_id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start Transaction
    
    // 1. Check if item exists in player inventory
    const invRes = await client.query(
      'SELECT inventory_id FROM PLAYER_INVENTORY WHERE player_id = $1 AND item_id = $2 LIMIT 1',
      [player_id, item_id]
    );
    if (invRes.rows.length === 0) {
      throw new Error('Item not found in player inventory');
    }
    const inventoryId = invRes.rows[0].inventory_id;

    // 2. Delete item from inventory
    await client.query('DELETE FROM PLAYER_INVENTORY WHERE inventory_id = $1', [inventoryId]);
    
    // 3. Get item price
    const itemRes = await client.query('SELECT price_credits FROM STORE_ITEM WHERE item_id = $1', [item_id]);
    if (itemRes.rows.length === 0) {
      throw new Error('Item not found');
    }
    const price = itemRes.rows[0].price_credits;
    
    // 4. Refund credits to player
    const playerRes = await client.query(
      'UPDATE PLAYER SET credits = credits + $1 WHERE player_id = $2 RETURNING credits',
      [price, player_id]
    );
    const updatedCredits = playerRes.rows[0].credits;
    
    await client.query('COMMIT'); // Commit Transaction
    
    return res.json({ message: 'Refund successful', remaining_credits: updatedCredits });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback Transaction on error
    console.error('Error processing refund:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 arenaDB Backend API running on http://localhost:${PORT}`);
});
