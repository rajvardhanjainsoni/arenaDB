-- ============================================================
-- arenaDB - Relational Database Schema & Mock Data (v2.0 Overhaul)
-- Esports and Gaming Tournament Database System (3NF)
-- Compatible with PostgreSQL
-- ============================================================

-- Clean up existing tables if re-running script
DROP TABLE IF EXISTS PLAYER_INVENTORY CASCADE;
DROP TABLE IF EXISTS STORE_ITEM CASCADE;
DROP TABLE IF EXISTS MATCH_TELEMETRY CASCADE;
DROP TABLE IF EXISTS PUBLICITY_CAMPAIGN CASCADE;
DROP TABLE IF EXISTS SPONSOR_ORG CASCADE;
DROP TABLE IF EXISTS MATCH_PARTICIPANT CASCADE;
DROP TABLE IF EXISTS MATCH_TABLE CASCADE;
DROP TABLE IF EXISTS TOURNAMENT CASCADE;
DROP TABLE IF EXISTS TEAM_MEMBER CASCADE;
DROP TABLE IF EXISTS TEAM CASCADE;
DROP TABLE IF EXISTS PLAYER CASCADE;
DROP TABLE IF EXISTS GAME CASCADE;
DROP TABLE IF EXISTS PUBLISHER CASCADE;

-- 1. PUBLISHER Table
CREATE TABLE PUBLISHER (
    publisher_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    contact_email VARCHAR(150) NOT NULL
);

-- 2. GAME Table
CREATE TABLE GAME (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    release_year INT NOT NULL,
    publisher_id INT NOT NULL REFERENCES PUBLISHER(publisher_id) ON DELETE CASCADE
);

-- 3. PLAYER Table
CREATE TABLE PLAYER (
    player_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    rank VARCHAR(50) NOT NULL,
    avatar_id VARCHAR(50) DEFAULT 'cyber-ninja',
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    credits INT DEFAULT 2500
);

-- 4. TEAM Table
CREATE TABLE TEAM (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    captain_id INT NOT NULL REFERENCES PLAYER(player_id) ON DELETE RESTRICT
);

-- 5. TEAM_MEMBER Table (Bridge Table between TEAM and PLAYER)
CREATE TABLE TEAM_MEMBER (
    team_id INT NOT NULL REFERENCES TEAM(team_id) ON DELETE CASCADE,
    player_id INT NOT NULL REFERENCES PLAYER(player_id) ON DELETE CASCADE,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (team_id, player_id)
);

-- 6. TOURNAMENT Table
CREATE TABLE TOURNAMENT (
    tournament_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    prize_pool DECIMAL(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    tier VARCHAR(100) DEFAULT 'Tier 1 Premier Major',
    game_id INT NOT NULL REFERENCES GAME(game_id) ON DELETE CASCADE
);

-- 7. MATCH_TABLE Table
CREATE TABLE MATCH_TABLE (
    match_id SERIAL PRIMARY KEY,
    match_date TIMESTAMP NOT NULL,
    stage VARCHAR(50) NOT NULL,
    tournament_id INT NOT NULL REFERENCES TOURNAMENT(tournament_id) ON DELETE CASCADE,
    winner_team_id INT REFERENCES TEAM(team_id) ON DELETE SET NULL
);

-- 8. MATCH_PARTICIPANT Table (Bridge Table for Teams in a Match)
CREATE TABLE MATCH_PARTICIPANT (
    match_id INT NOT NULL REFERENCES MATCH_TABLE(match_id) ON DELETE CASCADE,
    team_id INT NOT NULL REFERENCES TEAM(team_id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    PRIMARY KEY (match_id, team_id)
);

-- 9. SPONSOR_ORG Table
CREATE TABLE SPONSOR_ORG (
    org_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    org_type VARCHAR(50) NOT NULL,
    contact_email VARCHAR(150) NOT NULL
);

-- 10. PUBLICITY_CAMPAIGN Table
CREATE TABLE PUBLICITY_CAMPAIGN (
    campaign_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES SPONSOR_ORG(org_id) ON DELETE CASCADE,
    tournament_id INT NOT NULL REFERENCES TOURNAMENT(tournament_id) ON DELETE CASCADE,
    budget DECIMAL(12, 2) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    reach_metrics INT NOT NULL
);

-- 11. MATCH_TELEMETRY Table
CREATE TABLE MATCH_TELEMETRY (
    telemetry_id SERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES MATCH_TABLE(match_id) ON DELETE CASCADE,
    player_id INT NOT NULL REFERENCES PLAYER(player_id) ON DELETE CASCADE,
    avg_ping_ms NUMERIC(6, 2) NOT NULL,
    os_version VARCHAR(100) NOT NULL,
    disconnect_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. STORE_ITEM Table
CREATE TABLE STORE_ITEM (
    item_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES GAME(game_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) DEFAULT 'Rare',
    price_credits INT NOT NULL,
    image_url VARCHAR(500)
);

-- 13. PLAYER_INVENTORY Table
CREATE TABLE PLAYER_INVENTORY (
    inventory_id SERIAL PRIMARY KEY,
    player_id INT REFERENCES PLAYER(player_id) ON DELETE CASCADE,
    item_id INT REFERENCES STORE_ITEM(item_id) ON DELETE CASCADE,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================================
CREATE INDEX idx_game_publisher ON GAME(publisher_id);
CREATE INDEX idx_tournament_game ON TOURNAMENT(game_id);
CREATE INDEX idx_match_tournament ON MATCH_TABLE(tournament_id);
CREATE INDEX idx_telemetry_match_player ON MATCH_TELEMETRY(match_id, player_id);
CREATE INDEX idx_campaign_org_tournament ON PUBLICITY_CAMPAIGN(org_id, tournament_id);

-- ============================================================
-- SEED MOCK DATA
-- ============================================================

-- 1. PUBLISHER Data
INSERT INTO PUBLISHER (name, country, contact_email) VALUES
('Riot Games', 'United States', 'esports@riotgames.com'),
('Valve Corporation', 'United States', 'esports@valvesoftware.com'),
('Epic Games', 'United States', 'pub@epicgames.com'),
('Blizzard Entertainment', 'United States', 'tournaments@blizzard.com'),
('Electronic Arts', 'United States', 'ea-esports@ea.com'),
('Ubisoft', 'France', 'r6-esports@ubisoft.com'),
('Capcom', 'Japan', 'capcomprotour@capcom.com');

-- 2. GAME Data (10 Games)
INSERT INTO GAME (title, genre, release_year, publisher_id) VALUES
('Valorant', 'Tactical Shooter', 2020, 1),
('Counter-Strike 2', 'Tactical Shooter', 2023, 2),
('League of Legends', 'MOBA', 2009, 1),
('Apex Legends', 'Battle Royale', 2019, 5),
('Rocket League', 'Sports Racing', 2015, 3),
('Dota 2', 'MOBA', 2013, 2),
('Overwatch 2', 'Hero Shooter', 2022, 4),
('Fortnite', 'Battle Royale', 2017, 3),
('Rainbow Six Siege', 'Tactical Shooter', 2015, 6),
('Street Fighter 6', 'Fighting', 2023, 7);

-- 3. PLAYER Data (38 Players)
INSERT INTO PLAYER (username, email, rank, avatar_id, joined_date, credits) VALUES
('TenZ', 'tenz@sentinels.gg', 'Radiant', 'cyber-ninja', '2021-03-15', 3500),
('s1mple', 's1mple@navi.gg', 'Global Elite', 'crimson-shades', '2016-08-04', 4200),
('Faker', 'faker@t1.gg', 'Challenger', 'royal-champ', '2013-02-15', 5000),
('ImperialHal', 'hal@tsm.gg', 'Apex Predator', 'stealth-hoodie', '2019-01-20', 2800),
('Vatira', 'vatira@karminecorp.fr', 'Grand Champion', 'pro-headset', '2022-05-01', 1900),
('Yatoro', 'yatoro@teamspirit.gg', 'Immortal', 'arcane-master', '2021-01-10', 3100),
('Chronicle', 'chronicle@fnatic.gg', 'Radiant', 'pulse-ace', '2022-11-10', 2600),
('Caps', 'caps@g2.esports', 'Challenger', 'vanguard-cap', '2018-11-20', 3800),
('ZywOo', 'zywoo@vitality.fr', 'Global Elite', 'crimson-shades', '2018-01-01', 4500),
('Bugha', 'bugha@sentinels.gg', 'Unreal Tier', 'pulse-ace', '2019-07-28', 1200),
('Scump', 'scump@optic.gg', 'Champion', 'royal-champ', '2014-05-10', 2100),
('Shroud', 'shroud@sentinels.gg', 'Radiant', 'cyber-ninja', '2022-07-08', 5500),
('karrigan', 'karrigan@fazeclan.com', 'Global Elite', 'vanguard-cap', '2017-02-15', 1800),
('ropz', 'ropz@fazeclan.com', 'Global Elite', 'pulse-ace', '2022-01-05', 2900),
('broky', 'broky@fazeclan.com', 'Global Elite', 'stealth-hoodie', '2019-09-26', 1500),
('rain', 'rain@fazeclan.com', 'Global Elite', 'crimson-shades', '2016-01-20', 2400),
('frozen', 'frozen@fazeclan.com', 'Global Elite', 'pro-headset', '2023-12-04', 1600),
('f0rsakeN', 'f0rsaken@paperrex.gg', 'Radiant', 'cyber-ninja', '2021-02-08', 2700),
('jinggg', 'jinggg@paperrex.gg', 'Radiant', 'pulse-ace', '2021-09-28', 3300),
('mindfreak', 'mindfreak@paperrex.gg', 'Radiant', 'arcane-master', '2020-02-08', 1400),
('d4v41', 'd4v41@paperrex.gg', 'Radiant', 'royal-champ', '2020-02-08', 2200),
('something', 'something@paperrex.gg', 'Radiant', 'crimson-shades', '2023-03-22', 3100),
('Twistzz', 'twistzz@teamliquid.com', 'Global Elite', 'pro-headset', '2021-01-06', 4000),
('NAF', 'naf@teamliquid.com', 'Global Elite', 'stealth-hoodie', '2018-02-05', 2300),
('YEKINDAR', 'yekindar@teamliquid.com', 'Global Elite', 'pulse-ace', '2022-06-21', 1900),
('Asuna', 'asuna@cloud9.gg', 'Radiant', 'cyber-ninja', '2020-10-02', 2500),
('m0NESY', 'm0nesy@g2.esports', 'Global Elite', 'pulse-ace', '2022-01-03', 3900),
('b1t', 'b1t@navi.gg', 'Global Elite', 'crimson-shades', '2020-12-20', 2700),
('NiKo', 'niko@g2.esports', 'Global Elite', 'royal-champ', '2020-11-06', 4800),
('Boaster', 'boaster@fnatic.gg', 'Radiant', 'pro-headset', '2021-02-03', 3100),
('Derke', 'derke@fnatic.gg', 'Radiant', 'vanguard-cap', '2021-02-03', 3400),
('Alfajer', 'alfajer@fnatic.gg', 'Radiant', 'pulse-ace', '2022-05-09', 2800),
('ZmjjKK', 'kk@edg.cn', 'Radiant', 'arcane-master', '2021-09-15', 4600),
('Aspas', 'aspas@leviatan.gg', 'Radiant', 'cyber-ninja', '2022-02-03', 3700),
('Saadhak', 'saadhak@loud.gg', 'Radiant', 'stealth-hoodie', '2022-02-03', 2900),
('Zellsis', 'zellsis@sentinels.gg', 'Radiant', 'royal-champ', '2023-10-25', 1800),
('Sacy', 'sacy@sentinels.gg', 'Radiant', 'pro-headset', '2022-10-15', 2100),
('jks', 'jks@g2.esports', 'Global Elite', 'vanguard-cap', '2022-08-16', 2600);

-- 4. TEAM Data (18 Tier-1 Esports Teams)
INSERT INTO TEAM (team_name, created_date, captain_id) VALUES
('Sentinels', '2020-06-01', 1),
('Natus Vincere', '2010-01-01', 2),
('T1 Esports', '2012-05-20', 3),
('TSM', '2011-01-01', 4),
('Karmine Corp', '2020-03-30', 5),
('Team Spirit', '2015-12-06', 6),
('Fnatic', '2011-03-14', 7),
('G2 Esports', '2014-11-24', 8),
('Team Vitality', '2013-08-05', 9),
('OpTic Gaming', '2006-04-12', 11),
('FaZe Clan', '2010-05-30', 13),
('Paper Rex', '2020-01-15', 18),
('Team Liquid', '2000-05-01', 23),
('Cloud9', '2013-01-08', 26),
('DRX', '2019-12-10', 33),
('LOUD Esports', '2022-02-01', 35),
('NRG Esports', '2015-11-16', 34),
('Gen.G Esports', '2017-08-15', 14);

-- 5. TEAM_MEMBER Data
INSERT INTO TEAM_MEMBER (team_id, player_id, joined_date) VALUES
(1, 1, '2021-03-10'), (1, 10, '2020-02-01'), (1, 12, '2022-07-08'), (1, 36, '2023-10-25'), (1, 37, '2022-10-15'),
(2, 2, '2016-08-04'), (2, 28, '2020-12-20'),
(3, 3, '2013-02-15'),
(4, 4, '2019-01-10'),
(5, 5, '2022-05-01'),
(6, 6, '2021-01-01'),
(7, 7, '2022-11-10'), (7, 30, '2021-02-03'), (7, 31, '2021-02-03'), (7, 32, '2022-05-09'),
(8, 8, '2018-11-20'), (8, 27, '2022-01-03'), (8, 29, '2020-11-06'), (8, 38, '2022-08-16'),
(9, 9, '2018-01-01'),
(10, 11, '2014-05-01'),
(11, 13, '2017-02-15'), (11, 14, '2022-01-05'), (11, 15, '2019-09-26'), (11, 16, '2016-01-20'), (11, 17, '2023-12-04'),
(12, 18, '2021-02-08'), (12, 19, '2021-09-28'), (12, 20, '2020-02-08'), (12, 21, '2020-02-08'), (12, 22, '2023-03-22'),
(13, 23, '2021-01-06'), (13, 24, '2018-02-05'), (13, 25, '2022-06-21'),
(14, 26, '2020-10-02'),
(15, 33, '2021-09-15'),
(16, 35, '2022-02-03'),
(17, 34, '2022-02-03'),
(18, 14, '2022-01-05');

-- 6. TOURNAMENT Data (Tournaments for ALL 10 Games)
INSERT INTO TOURNAMENT (name, prize_pool, start_date, end_date, game_id) VALUES
('VCT Champions 2026 - Seoul', 2250000.00, '2026-09-12', '2026-09-28', 1),
('IEM Katowice 2027 Major', 1250000.00, '2027-02-01', '2027-02-14', 2),
('League of Legends Worlds 2026', 2225000.00, '2026-11-01', '2026-12-15', 3),
('ALGS Global Championship 2026', 2000000.00, '2026-11-20', '2026-12-05', 4),
('Rocket League World Championship 2026', 600000.00, '2026-10-05', '2026-10-18', 5),
('The International Dota 2 2026', 15000000.00, '2026-10-01', '2026-10-20', 6),
('Overwatch League Grand Finals 2026', 1000000.00, '2026-09-15', '2026-09-30', 7),
('Fortnite FNCS Global Finals 2026', 1500000.00, '2026-12-10', '2026-12-20', 8),
('Six Invitational 2027', 3000000.00, '2027-02-15', '2027-03-01', 9),
('EVO 2027 World Championship', 250000.00, '2027-01-20', '2027-01-25', 10);

-- 7. MATCH_TABLE & MATCH_PARTICIPANT Data (Comprehensive Seeding so ALL 10 games have 5-8 competing teams)

-- Game 1: Valorant (Tournament 1)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-09-12 14:00:00', 'Group Stage A', 1, 1),   -- Sentinels win
('2026-09-13 16:00:00', 'Group Stage A', 1, 12),  -- Paper Rex win
('2026-09-14 18:00:00', 'Group Stage B', 1, 7),   -- Fnatic win
('2026-09-15 20:00:00', 'Group Stage B', 1, 16),  -- LOUD win
('2026-09-18 16:00:00', 'Semifinals', 1, 1),    -- Sentinels win
('2026-09-20 18:00:00', 'Semifinals', 1, 15),   -- DRX win
('2026-09-22 19:00:00', 'Grand Finals', 1, 1);   -- Sentinels win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(1, 1, 13), (1, 14, 9), (1, 17, 7),
(2, 12, 13), (2, 16, 11), (2, 15, 8),
(3, 7, 13), (3, 10, 8), (3, 1, 10),
(4, 16, 13), (4, 17, 10), (4, 12, 9),
(5, 1, 13), (5, 7, 11), (5, 16, 6),
(6, 15, 13), (6, 12, 10), (6, 14, 8),
(7, 1, 13), (7, 15, 11), (7, 7, 9);

-- Game 2: Counter-Strike 2 (Tournament 2)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2027-02-01 14:00:00', 'Group Stage', 2, 11),  -- FaZe win
('2027-02-02 16:30:00', 'Group Stage', 2, 2),   -- NaVi win
('2027-02-03 19:00:00', 'Group Stage', 2, 9),   -- Vitality win
('2027-02-05 15:00:00', 'Quarterfinals', 2, 8), -- G2 win
('2027-02-08 18:00:00', 'Semifinals', 2, 11),  -- FaZe win
('2027-02-10 20:00:00', 'Grand Finals', 2, 9);  -- Vitality win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(8, 11, 16), (8, 2, 12), (8, 13, 9), (8, 18, 7),
(9, 2, 16), (9, 9, 14), (9, 8, 11), (9, 14, 6),
(10, 9, 16), (10, 11, 13), (10, 13, 10), (10, 2, 8),
(11, 8, 16), (11, 14, 12), (11, 18, 9),
(12, 11, 16), (12, 8, 14), (12, 2, 10),
(13, 9, 16), (13, 11, 13), (13, 8, 11);

-- Game 3: League of Legends (Tournament 3)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-11-01 15:00:00', 'Group Stage', 3, 3),   -- T1 win
('2026-11-03 17:00:00', 'Group Stage', 3, 8),   -- G2 win
('2026-11-05 19:00:00', 'Quarterfinals', 3, 18),-- Gen.G win
('2026-11-10 18:00:00', 'Semifinals', 3, 3),   -- T1 win
('2026-11-15 20:00:00', 'Grand Finals', 3, 3);  -- T1 win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(14, 3, 3), (14, 8, 1), (14, 7, 0), (14, 13, 2),
(15, 8, 3), (15, 5, 1), (15, 18, 2), (15, 14, 0),
(16, 18, 3), (16, 7, 1), (16, 8, 2), (16, 5, 0),
(17, 3, 3), (17, 18, 2), (17, 8, 1),
(18, 3, 3), (18, 8, 1);

-- Game 4: Apex Legends (Tournament 4)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-11-20 14:00:00', 'Round 1', 4, 4),   -- TSM win
('2026-11-22 16:00:00', 'Round 2', 4, 17),  -- NRG win
('2026-11-25 18:00:00', 'Round 3', 4, 1),   -- Sentinels win
('2026-11-28 20:00:00', 'Finals', 4, 4);   -- TSM win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(19, 4, 65), (19, 17, 52), (19, 1, 48), (19, 14, 35), (19, 10, 30),
(20, 17, 70), (20, 4, 62), (20, 1, 55), (20, 10, 40), (20, 14, 28),
(21, 1, 68), (21, 4, 60), (21, 17, 58), (21, 10, 44),
(22, 4, 80), (22, 17, 72), (22, 1, 64);

-- Game 5: Rocket League (Tournament 5)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-10-05 14:00:00', 'Group Stage', 5, 5),  -- Karmine Corp win
('2026-10-07 16:00:00', 'Group Stage', 5, 8),  -- G2 win
('2026-10-10 18:00:00', 'Semifinals', 5, 9),   -- Vitality win
('2026-10-12 20:00:00', 'Grand Finals', 5, 5); -- Karmine Corp win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(23, 5, 4), (23, 8, 2), (23, 9, 3), (23, 7, 1), (23, 11, 0),
(24, 8, 4), (24, 9, 3), (24, 5, 2), (24, 7, 1),
(25, 9, 4), (25, 8, 1), (25, 5, 3),
(26, 5, 4), (26, 9, 3);

-- Game 6: Dota 2 (Tournament 6)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-10-01 14:00:00', 'Group Stage', 6, 6),  -- Team Spirit win
('2026-10-04 16:00:00', 'Group Stage', 6, 2),  -- NaVi win
('2026-10-08 18:00:00', 'Upper Bracket', 6, 13),-- Team Liquid win
('2026-10-15 20:00:00', 'Grand Finals', 6, 6);  -- Team Spirit win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(27, 6, 2), (27, 2, 1), (27, 13, 0), (27, 7, 1), (27, 8, 0),
(28, 2, 2), (28, 13, 1), (28, 6, 0), (28, 7, 0),
(29, 13, 2), (29, 6, 1), (29, 2, 0),
(30, 6, 3), (30, 13, 2);

-- Game 7: Overwatch 2 (Tournament 7)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-09-15 14:00:00', 'Group Stage', 7, 8),  -- G2 win
('2026-09-18 16:00:00', 'Group Stage', 7, 14), -- Cloud9 win
('2026-09-22 18:00:00', 'Semifinals', 7, 3),   -- T1 win
('2026-09-25 20:00:00', 'Grand Finals', 7, 8);  -- G2 win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(31, 8, 3), (31, 14, 1), (31, 3, 2), (31, 1, 0), (31, 17, 1),
(32, 14, 3), (32, 3, 2), (32, 8, 1), (32, 1, 0),
(33, 3, 3), (33, 14, 1), (33, 8, 2),
(34, 8, 4), (34, 3, 2);

-- Game 8: Fortnite (Tournament 8)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-12-10 14:00:00', 'Finals Day 1', 8, 1),  -- Sentinels win
('2026-12-15 16:00:00', 'Finals Day 2', 8, 4),  -- TSM win
('2026-12-20 18:00:00', 'Grand Finals', 8, 1);  -- Sentinels win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(35, 1, 95), (35, 4, 82), (35, 10, 70), (35, 14, 65), (35, 17, 50),
(36, 4, 102), (36, 1, 90), (36, 17, 75), (36, 10, 60),
(37, 1, 120), (37, 4, 110), (37, 17, 85);

-- Game 9: Rainbow Six Siege (Tournament 9)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2027-02-15 14:00:00', 'Group Stage', 9, 8),  -- G2 win
('2027-02-20 16:00:00', 'Semifinals', 9, 11), -- FaZe win
('2027-02-25 18:00:00', 'Grand Finals', 9, 8); -- G2 win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(38, 8, 7), (38, 11, 5), (38, 13, 4), (38, 9, 3), (38, 7, 2),
(39, 11, 7), (39, 8, 6), (39, 13, 4),
(40, 8, 7), (40, 11, 5);

-- Game 10: Street Fighter 6 (Tournament 10)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2027-01-20 14:00:00', 'Top 16', 10, 10), -- OpTic win
('2027-01-22 16:00:00', 'Top 8', 10, 3),   -- T1 win
('2027-01-25 18:00:00', 'Grand Finals', 10, 10); -- OpTic win

INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
(41, 10, 3), (41, 3, 2), (41, 8, 1), (41, 1, 0), (41, 14, 0),
(42, 3, 3), (42, 10, 2), (42, 8, 1),
(43, 10, 3), (43, 3, 1);

-- 8. SPONSOR_ORG Data (Authentic Top Gaming & Tech Brands)
INSERT INTO SPONSOR_ORG (name, org_type, contact_email) VALUES
('Red Bull Esports', 'External Brand', 'sponsorships@redbull.com'),
('Intel Gaming', 'Corporate Sponsor', 'esports@intel.com'),
('Secretlab', 'Hardware Partner', 'partnerships@secretlab.co'),
('Logitech G', 'Peripheral Sponsor', 'gaming@logitech.com'),
('Monster Energy', 'External Brand', 'esports@monsterenergy.com'),
('Razer Chroma', 'Peripheral Sponsor', 'esports@razer.com'),
('HyperX', 'Hardware Partner', 'contact@hyperx.com'),
('ASUS ROG', 'Hardware Partner', 'rog-esports@asus.com'),
('Alienware', 'Corporate Sponsor', 'alienware@dell.com'),
('IEEE ComSoc Student Guild', 'Campus Orgs', 'comsoc@university.edu'),
('Mozilla Firefox Club', 'Campus Orgs', 'mozilla@university.edu'),
('ACM Student Chapter', 'Campus Orgs', 'acm@university.edu');

-- 9. PUBLICITY_CAMPAIGN Data (Rich Budgets, Reach, and Target Platforms)
INSERT INTO PUBLICITY_CAMPAIGN (org_id, tournament_id, budget, platform, reach_metrics) VALUES
(1, 1, 350000.00, 'Twitch', 4850000),
(2, 2, 450000.00, 'YouTube', 6200000),
(3, 3, 280000.00, 'Twitch', 3900000),
(4, 1, 220000.00, 'YouTube', 3100000),
(5, 4, 310000.00, 'X/Twitter', 4200000),
(6, 1, 190000.00, 'Instagram', 2600000),
(7, 2, 175000.00, 'Twitch', 2400000),
(8, 6, 500000.00, 'YouTube', 7500000),
(9, 7, 240000.00, 'Twitch', 3200000),
(10, 1, 15000.00, 'Campus Posters', 35000),
(11, 4, 12000.00, 'Discord & Web', 48000),
(12, 5, 18000.00, 'Instagram', 52000);

-- 10. MATCH_TELEMETRY Data
INSERT INTO MATCH_TELEMETRY (match_id, player_id, avg_ping_ms, os_version, disconnect_count) VALUES
(1, 1, 14.50, 'macOS 14.5 Sonoma', 0),
(1, 7, 88.20, 'Windows 11 23H2', 1),
(2, 18, 24.10, 'Windows 11 22H2', 0),
(5, 1, 12.80, 'macOS 14.5 Sonoma', 0),
(8, 13, 16.40, 'Windows 11 23H2', 0),
(9, 2, 18.00, 'Windows 11 22H2', 0),
(10, 9, 15.20, 'Windows 11 23H2', 0),
(12, 13, 19.50, 'Windows 11 23H2', 0);

-- 11. STORE_ITEM Data (High-Definition Cyberpunk & Esports Visuals)
INSERT INTO STORE_ITEM (game_id, name, item_type, rarity, price_credits, image_url) VALUES
(1, 'AWP | Dragon Lore', 'Weapon Skin', 'Legendary', 4500, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'),
(1, 'Prime Vandal', 'Weapon Skin', 'Legendary', 1775, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop'),
(1, 'Reaver Karambit', 'Melee Skin', 'Legendary', 4350, 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop'),
(1, 'Ion Phantom', 'Weapon Skin', 'Epic', 1775, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop'),
(1, 'Glitchpop Spectre', 'Weapon Skin', 'Rare', 850, 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop'),
(2, 'Asiimov M4A4', 'Weapon Skin', 'Epic', 2500, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop'),
(2, 'Fade Butterfly Knife', 'Melee Skin', 'Legendary', 5000, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop'),
(2, 'Hyper Beast AWP', 'Weapon Skin', 'Rare', 650, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop'),
(2, 'Doppler Bayonet Knife', 'Melee Skin', 'Legendary', 4800, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop'),
(3, 'K/DA Ahri', 'Champion Skin', 'Epic', 1350, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop'),
(3, 'Elementalist Lux', 'Champion Skin', 'Legendary', 3250, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'),
(3, 'PROJECT: Vayne', 'Champion Skin', 'Legendary', 1820, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop'),
(4, 'Wraith Kunai Heirloom', 'Melee Skin', 'Legendary', 4800, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop'),
(4, 'Octane Butterfly Heirloom', 'Melee Skin', 'Legendary', 4600, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'),
(5, 'Titanium White Octane', 'Vehicle Body', 'Epic', 2200, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop'),
(5, 'Alpha Gold Boost', 'Rocket Boost', 'Legendary', 6000, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'),
(6, 'Dragonclaw Hook', 'Equipment', 'Legendary', 5500, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop'),
(6, 'Arcana Phantom Assassin', 'Hero Arcana', 'Legendary', 3500, 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop'),
(8, 'Galaxy Outfit', 'Player Outfit', 'Legendary', 2000, 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop'),
(1, 'Cyberpunk Laser Katana', 'Melee Skin', 'Legendary', 4100, 'https://images.unsplash.com/photo-1614680376593-902f749f7edc?q=80&w=800&auto=format&fit=crop');

-- 12. PLAYER_INVENTORY Initial Data
INSERT INTO PLAYER_INVENTORY (player_id, item_id) VALUES
(1, 2), -- TenZ owns Prime Vandal
(2, 6), -- s1mple owns Asiimov M4A4
(3, 10), -- Faker owns K/DA Ahri
(13, 8), -- karrigan owns Hyper Beast AWP
(1, 1), -- TenZ owns AWP | Dragon Lore
(4, 15); -- ImperialHal owns Titanium White Octane
