-- 1. Which teams are currently participating in tournaments (INNER JOIN across 3 tables)?
SELECT DISTINCT t.team_name, tor.name AS tournament_name
FROM TEAM t
INNER JOIN MATCH_PARTICIPANT mp ON t.team_id = mp.team_id
INNER JOIN MATCH_TABLE mt ON mp.match_id = mt.match_id
INNER JOIN TOURNAMENT tor ON mt.tournament_id = tor.tournament_id;

-- 2. What is the total reach for each sponsor across all campaigns, including those with no campaigns (LEFT JOIN, GROUP BY, COALESCE)?
SELECT o.name AS sponsor_name, COALESCE(SUM(c.reach_metrics), 0) AS total_reach
FROM SPONSOR_ORG o
LEFT JOIN PUBLICITY_CAMPAIGN c ON o.org_id = c.org_id
GROUP BY o.name;

-- 3. Which tournaments have an average match score greater than 10 (GROUP BY + HAVING)?
SELECT tor.name, AVG(mp.score) AS avg_score
FROM TOURNAMENT tor
INNER JOIN MATCH_TABLE mt ON tor.tournament_id = mt.tournament_id
INNER JOIN MATCH_PARTICIPANT mp ON mt.match_id = mp.match_id
GROUP BY tor.name
HAVING AVG(mp.score) > 10;

-- 4. Which players have a ping higher than the average ping in their respective matches (Correlated Subquery)?
SELECT p.username, mt.avg_ping_ms
FROM PLAYER p
INNER JOIN MATCH_TELEMETRY mt ON p.player_id = mt.player_id
WHERE mt.avg_ping_ms > (
    SELECT AVG(avg_ping_ms) 
    FROM MATCH_TELEMETRY 
    WHERE match_id = mt.match_id
);

-- 5. Which players own at least one 'Legendary' rarity item (EXISTS)?
SELECT p.username
FROM PLAYER p
WHERE EXISTS (
    SELECT 1 
    FROM PLAYER_INVENTORY pi
    INNER JOIN STORE_ITEM si ON pi.item_id = si.item_id
    WHERE pi.player_id = p.player_id AND si.rarity = 'Legendary'
);

-- 6. Which teams have won matches in Valorant or Counter-Strike 2 (IN)?
SELECT DISTINCT tm.team_name
FROM TEAM tm
INNER JOIN MATCH_TABLE mt ON tm.team_id = mt.winner_team_id
INNER JOIN TOURNAMENT tor ON mt.tournament_id = tor.tournament_id
INNER JOIN GAME g ON tor.game_id = g.game_id
WHERE g.title IN ('Valorant', 'Counter-Strike 2');

-- 7. What is the total prize pool per publisher (CTE)?
WITH PublisherPrize AS (
    SELECT g.publisher_id, SUM(tor.prize_pool) AS total_prize
    FROM GAME g
    INNER JOIN TOURNAMENT tor ON g.game_id = tor.game_id
    GROUP BY g.publisher_id
)
SELECT p.name, pp.total_prize
FROM PUBLISHER p
INNER JOIN PublisherPrize pp ON p.publisher_id = pp.publisher_id;

-- 8. How do teams rank by their total match wins per game (Window Function: RANK)?
SELECT 
    g.title, 
    tm.team_name, 
    COUNT(mt.match_id) AS wins,
    RANK() OVER (PARTITION BY g.game_id ORDER BY COUNT(mt.match_id) DESC) AS rank
FROM TEAM tm
INNER JOIN MATCH_TABLE mt ON tm.team_id = mt.winner_team_id
INNER JOIN TOURNAMENT tor ON mt.tournament_id = tor.tournament_id
INNER JOIN GAME g ON tor.game_id = g.game_id
GROUP BY g.game_id, g.title, tm.team_name;

-- 9. What is the dense rank of players by their current credit balance (Window Function: DENSE_RANK)?
SELECT 
    username, 
    credits,
    DENSE_RANK() OVER (ORDER BY credits DESC) AS credit_rank
FROM PLAYER;

-- 10. List all match participants with a row number ordered by score per match (Window Function: ROW_NUMBER)?
SELECT 
    match_id, 
    team_id, 
    score,
    ROW_NUMBER() OVER (PARTITION BY match_id ORDER BY score DESC) AS placement
FROM MATCH_PARTICIPANT;

-- 11. What is the score difference between a team and the next highest scoring team in each match (Window Function: LAG)?
SELECT 
    match_id, 
    team_id, 
    score,
    LAG(score) OVER (PARTITION BY match_id ORDER BY score DESC) - score AS diff_from_previous
FROM MATCH_PARTICIPANT;

-- 12. What is the running total of campaign budgets spent over time per tournament (Window Function: running SUM)?
SELECT 
    tournament_id,
    platform,
    budget,
    SUM(budget) OVER (PARTITION BY tournament_id ORDER BY campaign_id) AS running_budget
FROM PUBLICITY_CAMPAIGN;

-- 13. List all distinct game genres and sponsor org types (UNION)?
SELECT genre AS category FROM GAME
UNION
SELECT org_type AS category FROM SPONSOR_ORG;

-- 14. How many credits do players have categorized by wealth brackets (CASE)?
SELECT 
    username,
    credits,
    CASE 
        WHEN credits > 4000 THEN 'Wealthy'
        WHEN credits > 2000 THEN 'Average'
        ELSE 'Poor'
    END AS wealth_status
FROM PLAYER;

-- 15. Which tournaments took place or will take place in the year 2026 (Date Functions)?
SELECT name, start_date
FROM TOURNAMENT
WHERE EXTRACT(YEAR FROM start_date) = 2026;
