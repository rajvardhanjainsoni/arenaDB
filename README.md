# arenaDB - Esports & Gaming Tournament Database System

**arenaDB** is a full-stack, 3NF relational database system and web application designed for esports tournament organizers, university leagues, and sponsors.

---

## 🏗️ Tech Stack
- **Database Layer**: PostgreSQL (`db.sql`) with 11 normalized tables (3NF), foreign keys (`ON DELETE CASCADE`), indexes, and mock seed data.
- **Backend Layer**: Node.js, Express.js, `pg` driver (with dual-mode in-memory dev fallback).
- **Frontend Layer**: React.js, Tailwind CSS, Vite, Lucide Icons.

---

## 📊 Database Schema (3NF Baseline & Novelty Modules)

### Baseline Relational Entities
1. **`PUBLISHER`**: `publisher_id` (PK), `name`, `country`, `contact_email`
2. **`GAME`**: `game_id` (PK), `title`, `genre`, `release_year`, `publisher_id` (FK)
3. **`PLAYER`**: `player_id` (PK), `username` (UNIQUE), `email` (UNIQUE), `rank`, `joined_date`
4. **`TEAM`**: `team_id` (PK), `team_name` (UNIQUE), `created_date`, `captain_id` (FK to PLAYER)
5. **`TEAM_MEMBER`** (Bridge): `team_id` (FK), `player_id` (FK), `joined_date`
6. **`TOURNAMENT`**: `tournament_id` (PK), `name`, `prize_pool`, `start_date`, `end_date`, `game_id` (FK)
7. **`MATCH_TABLE`**: `match_id` (PK), `match_date`, `stage`, `tournament_id` (FK), `winner_team_id` (FK)
8. **`MATCH_PARTICIPANT`** (Bridge): `match_id` (FK), `team_id` (FK), `score`

### Novelty Modules
9. **`SPONSOR_ORG`**: `org_id` (PK), `name`, `org_type` (Student Club, External Brand, Corporate), `contact_email`
10. **`PUBLICITY_CAMPAIGN`**: `campaign_id` (PK), `org_id` (FK), `tournament_id` (FK), `budget`, `platform`, `reach_metrics`
11. **`MATCH_TELEMETRY`**: `telemetry_id` (PK), `match_id` (FK), `player_id` (FK), `avg_ping_ms`, `os_version`, `disconnect_count`

---

## 🚀 Quick Start Guide

### 1. Database Initialization (PostgreSQL)
Ensure PostgreSQL is running locally, then create and seed the database using `db.sql`:

```bash
# Create database
createdb arenadb

# Run SQL schema & insert seed data
psql -d arenadb -f db.sql
```

### 2. Backend API Setup
Install Node.js dependencies and start the Express server on port `5001`:

```bash
npm install
npm run server
```

#### Key API Endpoints
- `GET /api/tournaments` — List all tournaments with associated Game & Publisher details.
- `GET /api/leaderboard/:gameId` — Complex SQL JOIN computing standings, wins, and scores.
- `GET /api/campaigns` — Fetch publicity campaigns linked to sponsor orgs and budgets.
- `POST /api/telemetry` — Log player ping, OS version, and disconnect counts after a match.
- `GET /api/telemetry` — Fetch real-time hardware telemetry feed.

### 3. Frontend Dashboard Launch
In a new terminal window, run the Vite React dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the arenaDB dark-themed dashboard.

---

## 🌟 Key Features
- **Tournament Hub**: Browse upcoming tournaments, prize pools, game genres, and start/end dates.
- **Dynamic Leaderboard**: Select any game to run complex JOIN queries calculating wins, match rates, and scores.
- **Organization & Publicity Management**: Track brand partnerships, student club budgets, and platform impressions.
- **OS-Level Telemetry Widget**: Monitor hardware metrics, receive high-ping threshold alerts (>80ms), and submit telemetry logs in real time.
