-- ============================================================
-- arenaDB - Relational Database Schema & Mock Data
-- Esports and Gaming Tournament Database System (3NF)
-- Compatible with PostgreSQL
-- ============================================================

-- Clean up existing tables if re-running script
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
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE
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

-- 9. SPONSOR_ORG Table (Novelty Module: Organization & Publicity)
CREATE TABLE SPONSOR_ORG (
    org_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    org_type VARCHAR(50) NOT NULL,
    contact_email VARCHAR(150) NOT NULL
);

-- 10. PUBLICITY_CAMPAIGN Table (Novelty Module: Organization & Publicity)
CREATE TABLE PUBLICITY_CAMPAIGN (
    campaign_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL REFERENCES SPONSOR_ORG(org_id) ON DELETE CASCADE,
    tournament_id INT NOT NULL REFERENCES TOURNAMENT(tournament_id) ON DELETE CASCADE,
    budget DECIMAL(12, 2) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    reach_metrics INT NOT NULL
);

-- 11. MATCH_TELEMETRY Table (Novelty Module: OS-Level Match Telemetry)
CREATE TABLE MATCH_TELEMETRY (
    telemetry_id SERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES MATCH_TABLE(match_id) ON DELETE CASCADE,
    player_id INT NOT NULL REFERENCES PLAYER(player_id) ON DELETE CASCADE,
    avg_ping_ms NUMERIC(6, 2) NOT NULL,
    os_version VARCHAR(100) NOT NULL,
    disconnect_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- 2. GAME Data
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

-- 3. PLAYER Data (38 Realistic Esports Competitors across CS2, Valorant, League, Apex, etc.)
INSERT INTO PLAYER (username, email, rank, avatar_id, joined_date) VALUES
('TenZ', 'tenz@sentinels.gg', 'Radiant', 'cyber-ninja', '2021-03-15'),
('s1mple', 's1mple@navi.gg', 'Global Elite', 'crimson-shades', '2016-08-04'),
('Faker', 'faker@t1.gg', 'Challenger', 'royal-champ', '2013-02-15'),
('ImperialHal', 'hal@tsm.gg', 'Apex Predator', 'stealth-hoodie', '2019-01-20'),
('Vatira', 'vatira@karminecorp.fr', 'Grand Champion', 'pro-headset', '2022-05-01'),
('Yatoro', 'yatoro@teamspirit.gg', 'Immortal', 'arcane-master', '2021-01-10'),
('Chronicle', 'chronicle@fnatic.gg', 'Radiant', 'pulse-ace', '2022-11-10'),
('Caps', 'caps@g2.esports', 'Challenger', 'vanguard-cap', '2018-11-20'),
('ZywOo', 'zywoo@vitality.fr', 'Global Elite', 'crimson-shades', '2018-01-01'),
('Bugha', 'bugha@sentinels.gg', 'Unreal Tier', 'pulse-ace', '2019-07-28'),
('Scump', 'scump@optic.gg', 'Champion', 'royal-champ', '2014-05-10'),
('Shroud', 'shroud@sentinels.gg', 'Radiant', 'cyber-ninja', '2022-07-08'),
('karrigan', 'karrigan@fazeclan.com', 'Global Elite', 'vanguard-cap', '2017-02-15'),
('ropz', 'ropz@fazeclan.com', 'Global Elite', 'pulse-ace', '2022-01-05'),
('broky', 'broky@fazeclan.com', 'Global Elite', 'stealth-hoodie', '2019-09-26'),
('rain', 'rain@fazeclan.com', 'Global Elite', 'crimson-shades', '2016-01-20'),
('frozen', 'frozen@fazeclan.com', 'Global Elite', 'pro-headset', '2023-12-04'),
('f0rsakeN', 'f0rsaken@paperrex.gg', 'Radiant', 'cyber-ninja', '2021-02-08'),
('jinggg', 'jinggg@paperrex.gg', 'Radiant', 'pulse-ace', '2021-09-28'),
('mindfreak', 'mindfreak@paperrex.gg', 'Radiant', 'arcane-master', '2020-02-08'),
('d4v41', 'd4v41@paperrex.gg', 'Radiant', 'royal-champ', '2020-02-08'),
('something', 'something@paperrex.gg', 'Radiant', 'crimson-shades', '2023-03-22'),
('Twistzz', 'twistzz@teamliquid.com', 'Global Elite', 'pro-headset', '2021-01-06'),
('NAF', 'naf@teamliquid.com', 'Global Elite', 'stealth-hoodie', '2018-02-05'),
('YEKINDAR', 'yekindar@teamliquid.com', 'Global Elite', 'pulse-ace', '2022-06-21'),
('Asuna', 'asuna@cloud9.gg', 'Radiant', 'cyber-ninja', '2020-10-02'),
('m0NESY', 'm0nesy@g2.esports', 'Global Elite', 'pulse-ace', '2022-01-03'),
('b1t', 'b1t@navi.gg', 'Global Elite', 'crimson-shades', '2020-12-20'),
('NiKo', 'niko@g2.esports', 'Global Elite', 'royal-champ', '2020-11-06'),
('Boaster', 'boaster@fnatic.gg', 'Radiant', 'pro-headset', '2021-02-03'),
('Derke', 'derke@fnatic.gg', 'Radiant', 'vanguard-cap', '2021-02-03'),
('Alfajer', 'alfajer@fnatic.gg', 'Radiant', 'pulse-ace', '2022-05-09'),
('ZmjjKK', 'kk@edg.cn', 'Radiant', 'arcane-master', '2021-09-15'),
('Aspas', 'aspas@leviatan.gg', 'Radiant', 'cyber-ninja', '2022-02-03'),
('Saadhak', 'saadhak@loud.gg', 'Radiant', 'stealth-hoodie', '2022-02-03'),
('Zellsis', 'zellsis@sentinels.gg', 'Radiant', 'royal-champ', '2023-10-25'),
('Sacy', 'sacy@sentinels.gg', 'Radiant', 'pro-headset', '2022-10-15'),
('jks', 'jks@g2.esports', 'Global Elite', 'vanguard-cap', '2022-08-16');

-- 4. TEAM Data (14 Tier 1 Esports Organizations)
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
('Cloud9', '2013-01-08', 26);

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
(14, 26, '2020-10-02');

-- 6. TOURNAMENT Data
INSERT INTO TOURNAMENT (name, prize_pool, start_date, end_date, game_id) VALUES
('VCT Masters Tokyo 2026', 1000000.00, '2026-10-15', '2026-10-30', 1),
('IEM Katowice 2027', 1250000.00, '2027-02-01', '2027-02-14', 2),
('League of Legends Worlds 2026', 2225000.00, '2026-11-01', '2026-12-15', 3),
('ALGS Global Championship 2026', 2000000.00, '2026-11-20', '2026-12-05', 4),
('Six Invitational 2027', 3000000.00, '2027-02-15', '2027-03-01', 9),
('Fortnite FNCS Global Finals 2026', 1500000.00, '2026-12-10', '2026-12-20', 8),
('EVO 2027 Championship', 250000.00, '2027-01-20', '2027-01-25', 10),
('Rocket League World Championship 2026', 600000.00, '2026-10-05', '2026-10-18', 5),
('VCT Champions 2026 - Seoul', 2250000.00, '2026-09-12', '2026-09-28', 1),
('ESL Pro League Season 20', 850000.00, '2026-09-20', '2026-10-04', 2);

-- 7. MATCH_TABLE Data (18 Matches across tournaments)
INSERT INTO MATCH_TABLE (match_date, stage, tournament_id, winner_team_id) VALUES
('2026-10-15 14:00:00', 'Group Stage', 1, 1),   -- Match 1: Sentinels win
('2026-10-16 18:30:00', 'Group Stage', 1, 12),  -- Match 2: Paper Rex win
('2026-10-18 20:00:00', 'Semifinals', 1, 7),    -- Match 3: Fnatic win
('2026-10-20 19:00:00', 'Grand Finals', 1, 1),  -- Match 4: Sentinels win
('2026-09-15 14:00:00', 'Upper Bracket', 9, 12),-- Match 5: Paper Rex win
('2026-09-18 16:00:00', 'Upper Bracket', 9, 1), -- Match 6: Sentinels win
('2026-09-22 18:00:00', 'Finals', 9, 7),        -- Match 7: Fnatic win
('2027-02-02 14:00:00', 'Group Stage', 2, 11),  -- Match 8: FaZe Clan win
('2027-02-05 16:30:00', 'Quarterfinals', 2, 2), -- Match 9: NaVi win
('2027-02-08 19:00:00', 'Semifinals', 2, 9),    -- Match 10: Vitality win
('2027-02-12 21:00:00', 'Grand Finals', 2, 11), -- Match 11: FaZe Clan win
('2026-09-22 15:00:00', 'Group Stage', 10, 8),  -- Match 12: G2 win
('2026-09-25 17:00:00', 'Semifinals', 10, 13),  -- Match 13: Team Liquid win
('2026-09-28 20:00:00', 'Quarterfinals', 3, 3), -- Match 14: T1 win
('2026-08-10 15:00:00', 'Finals', 4, 4),        -- Match 15: TSM win
('2026-07-18 17:00:00', 'Grand Finals', 5, 5),  -- Match 16: Karmine Corp win
('2026-11-01 19:00:00', 'Finals', 6, 6),        -- Match 17: Team Spirit win
('2026-10-10 18:00:00', 'Group Stage', 8, 8);   -- Match 18: G2 win

-- 8. MATCH_PARTICIPANT Data (Rich points and match participation data)
INSERT INTO MATCH_PARTICIPANT (match_id, team_id, score) VALUES
-- Valorant Matches (Tournaments 1 & 9: Sentinels(1), Fnatic(7), OpTic(10), Paper Rex(12), Cloud9(14))
(1, 1, 13), (1, 7, 11), (1, 10, 8),
(2, 12, 13), (2, 14, 9), (2, 1, 11),
(3, 7, 13), (3, 12, 10), (3, 10, 6),
(4, 1, 13), (4, 7, 9),
(5, 12, 13), (5, 1, 7), (5, 14, 5),
(6, 1, 13), (6, 12, 11), (6, 7, 8),
(7, 7, 13), (7, 1, 10), (7, 12, 9),

-- CS2 Matches (Tournaments 2 & 10: NaVi(2), G2(8), Vitality(9), FaZe(11), Liquid(13))
(8, 11, 16), (8, 2, 12), (8, 8, 9),
(9, 2, 16), (9, 9, 14), (9, 13, 10),
(10, 9, 16), (10, 11, 13), (10, 8, 11),
(11, 11, 16), (11, 9, 14),
(12, 8, 16), (12, 13, 12), (12, 2, 8),
(13, 13, 16), (13, 11, 14), (13, 9, 11),

-- Other Game Matches
(14, 3, 3), (14, 8, 1),
(15, 4, 50), (15, 10, 42),
(16, 5, 4), (16, 8, 2),
(17, 6, 3), (17, 1, 1),
(18, 8, 4), (18, 5, 2);

-- 9. SPONSOR_ORG Data
INSERT INTO SPONSOR_ORG (name, org_type, contact_email) VALUES
('IEEE ComSoc', 'Student Organization', 'comsoc@university.edu'),
('Mozilla Firefox Club', 'Student Organization', 'mozilla@university.edu'),
('Red Bull', 'External Brand', 'sponsorships@redbull.com'),
('Logitech G', 'Corporate Sponsor', 'gaming@logitech.com'),
('Monster Energy Gaming', 'External Brand', 'esports@monsterenergy.com'),
('ACM Student Chapter', 'Student Club', 'acm@university.edu');

-- 10. PUBLICITY_CAMPAIGN Data
INSERT INTO PUBLICITY_CAMPAIGN (org_id, tournament_id, budget, platform, reach_metrics) VALUES
(1, 1, 12000.00, 'Discord & Campus Posters', 28000),
(2, 4, 8500.00, 'YouTube & Web', 45000),
(3, 1, 250000.00, 'Twitch Mainstream', 2850000),
(4, 2, 180000.00, 'YouTube & Socials', 2100000),
(5, 3, 95000.00, 'X/Twitter', 1400000),
(6, 5, 5000.00, 'Instagram', 32000);

-- 11. MATCH_TELEMETRY Data
INSERT INTO MATCH_TELEMETRY (match_id, player_id, avg_ping_ms, os_version, disconnect_count) VALUES
(1, 1, 14.50, 'macOS 14.5 Sonoma', 0),
(1, 7, 88.20, 'Windows 11 23H2', 1),
(2, 18, 24.10, 'Windows 11 22H2', 0),
(4, 1, 12.80, 'macOS 14.5 Sonoma', 0),
(8, 13, 16.40, 'Windows 11 23H2', 0),
(9, 2, 18.00, 'Windows 11 22H2', 0),
(10, 9, 15.20, 'Windows 11 23H2', 0),
(11, 13, 19.50, 'Windows 11 23H2', 0);
