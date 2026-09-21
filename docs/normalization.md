# Normalization Justification for arenaDB (3NF)

This document explains the functional dependencies and normalization rationale (1NF, 2NF, 3NF) for the tables in `arenaDB`. It also discusses deliberate design choices such as derived columns and bridge tables.

## 1. Normalization by Table

### PUBLISHER
*   **PK**: `publisher_id`
*   **1NF**: All attributes are atomic (no repeating groups).
*   **2NF**: The primary key is a single attribute (`publisher_id`), so all non-prime attributes are fully functionally dependent on the entire PK.
*   **3NF**: No transitive dependencies. `name`, `country`, and `contact_email` depend solely on `publisher_id`.

### GAME
*   **PK**: `game_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK; full functional dependency.
*   **3NF**: `title`, `genre`, `release_year`, and `publisher_id` depend only on `game_id`. There is no dependency between non-prime attributes.

### PLAYER
*   **PK**: `player_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK; full functional dependency.
*   **3NF**: `username`, `email`, `rank`, `avatar_id`, `joined_date`, and `credits` depend only on `player_id`. 
*   **Known Limitation**: The `rank` column is conceptually per-game. To achieve true 3NF for a multi-game scenario, `rank` should be extracted into a separate `PLAYER_GAME_RANK` table. It remains here as a legacy simplification.

### TEAM
*   **PK**: `team_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK; full functional dependency.
*   **3NF**: `team_name`, `created_date`, and `captain_id` depend on `team_id`. No transitive dependencies.

### TEAM_MEMBER
*   **PK**: `(team_id, player_id)`
*   **1NF**: Atomic attributes.
*   **2NF**: `joined_date` depends on the *entire* composite key `(team_id, player_id)`, not just part of it.
*   **3NF**: No transitive dependencies.
*   **Bridge Table Rationale**: A player could theoretically be on multiple teams (e.g., historically, or in different games), and a team definitely has multiple players. This many-to-many relationship necessitates a bridge table.

### TOURNAMENT
*   **PK**: `tournament_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: All attributes (`name`, `prize_pool`, `start_date`, `end_date`, `tier`, `game_id`) depend directly on `tournament_id`.

### MATCH_TABLE
*   **PK**: `match_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: All attributes depend directly on `match_id`.
*   **Deliberate Denormalization**: `winner_team_id` is functionally dependent on the scores in `MATCH_PARTICIPANT`. It is included here for query optimization (e.g., quickly finding match winners without aggregating participants). A database trigger (`trg_set_match_winner`) maintains its consistency, acting as a materialized derived column.

### MATCH_PARTICIPANT
*   **PK**: `(match_id, team_id)`
*   **1NF**: Atomic attributes.
*   **2NF**: `score` depends on the combination of `match_id` and `team_id`.
*   **3NF**: No transitive dependencies.
*   **Bridge Table Rationale**: A match involves multiple teams (usually 2, sometimes more in Battle Royales). A team participates in multiple matches. This resolves the many-to-many relationship.

### SPONSOR_ORG
*   **PK**: `org_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: No transitive dependencies.

### PUBLICITY_CAMPAIGN
*   **PK**: `campaign_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: `org_id`, `tournament_id`, `budget`, `platform`, `reach_metrics` depend only on `campaign_id`.

### MATCH_TELEMETRY
*   **PK**: `telemetry_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: All attributes depend on `telemetry_id`.

### STORE_ITEM
*   **PK**: `item_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: All attributes depend on `item_id`.

### PLAYER_INVENTORY
*   **PK**: `inventory_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK. (Additionally, `player_id` and `item_id` are restricted by a `UNIQUE` constraint).
*   **3NF**: `purchase_date` depends on the primary key.

### CREDIT_TRANSACTION
*   **PK**: `txn_id`
*   **1NF**: Atomic attributes.
*   **2NF**: Single attribute PK.
*   **3NF**: All attributes (including `balance_after`) depend on the specific transaction event represented by `txn_id`.

### PRIZE_DISTRIBUTION
*   **PK**: `(tournament_id, placement)`
*   **1NF**: Atomic attributes.
*   **2NF**: `team_id` and `payout` depend on the specific `tournament_id` and `placement` combination.
*   **3NF**: No transitive dependencies.
