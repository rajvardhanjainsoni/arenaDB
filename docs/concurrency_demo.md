# Concurrency Demo: Avoiding Race Conditions

This walkthrough demonstrates how the `fn_buy_item` PL/pgSQL function leverages row-level locking (`SELECT ... FOR UPDATE`) to prevent race conditions during concurrent purchase attempts.

## The Scenario

Imagine Player 10 ("Bugha") has exactly 1,200 credits. They attempt to purchase an item that costs 850 credits (e.g., 'Glitchpop Spectre', `item_id = 5`).
Due to a network glitch or malicious user action, two parallel `POST /api/store/buy` requests are fired simultaneously.

Without row-level locking, both transactions might read the balance (1,200), verify affordability (1,200 > 850), and both update the balance to 350. The player would end up with two copies of the item and only 850 credits deducted, or worse, negative credits if the balance was exactly updated by subtracting 850 twice (-500).

## The Fix: `SELECT ... FOR UPDATE`

In `fn_buy_item`, the following line secures a lock on the player's row:
```sql
SELECT credits INTO v_credits FROM PLAYER WHERE player_id = p_player_id FOR UPDATE;
```

## Two-Session Walkthrough

To reproduce this safely in PostgreSQL, open two separate terminal sessions.

### Session 1 (Terminal A)

```sql
-- 1. Begin a transaction manually to simulate an active API request
BEGIN;

-- 2. Lock the player row (simulating the first half of fn_buy_item)
SELECT credits FROM PLAYER WHERE player_id = 10 FOR UPDATE;
-- Output: 1200
```

### Session 2 (Terminal B)

```sql
-- 1. Begin a transaction for the concurrent API request
BEGIN;

-- 2. Attempt to purchase the item
-- This will BLOCK and wait for Session 1 to finish its transaction.
SELECT fn_buy_item(10, 5);
```

*Terminal B will hang here because Terminal A holds the lock.*

### Session 1 (Terminal A)

```sql
-- 3. Complete the purchase in the first session
-- Simulate the rest of fn_buy_item
UPDATE PLAYER SET credits = credits - 850 WHERE player_id = 10;
INSERT INTO PLAYER_INVENTORY (player_id, item_id) VALUES (10, 5);

-- 4. Commit the transaction, releasing the lock
COMMIT;
```

### Session 2 (Terminal B)

*Immediately after Terminal A commits, Terminal B resumes execution.*

```sql
-- Terminal B resumes and throws an error:
-- ERROR:  Already owned
```

*Because Session 1 successfully inserted the item into the inventory, Session 2's `fn_buy_item` function sees the item is already owned (or it would see insufficient credits if it were a different item) and safely aborts.*

### Verifying the Result

In either session:
```sql
SELECT credits FROM PLAYER WHERE player_id = 10;
-- Output: 350 (Credits never went negative)

SELECT COUNT(*) FROM PLAYER_INVENTORY WHERE player_id = 10 AND item_id = 5;
-- Output: 1 (No duplicate items)
```

## Conclusion

By using `SELECT ... FOR UPDATE`, the database enforces sequential processing of operations that affect the player's balance, guaranteeing ACID compliance and preventing negative balances or duplicate inventory items.
