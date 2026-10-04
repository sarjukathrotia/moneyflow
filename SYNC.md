# MoneyFlow Synchronization & Offline-First Engine

## 1. Product Philosophy

MoneyFlow follows an **offline-first local-master** pattern:
> **The user must be able to record money in or out in seconds without ever waiting on a network request.**

A network glitch or being offline in a basement or remote area must never prevent the user from recording an expense or viewing their current balance.

---

## 2. Sync Lifecycle

```text
       [ User Action ] (e.g. ₹300 XYZ Store)
              │
              ▼
   [ Instant Local Save ] (Room DB / Local Cache)
              │
              ├──────────────────────────┐
              ▼                          ▼
     [ UI Updates Immediately ]   [ Sync Queue Receives Op ]
              │                          │
              │                          ▼
              │                   [ Network Online? ]
              │                          │
              │               ┌──────────┴──────────┐
              │               ▼                     ▼
              │             [ YES ]                [ NO ]
              │               │                     │
              │               ▼                     ▼
              │        [ Push to Cloud ]     [ Keep in Queue ]
              │               │                     │
              │               ▼                     ▼
              │       [ Status = SYNCED ]    [ Wait for WorkManager / Online ]
              │                                     │
              └─────────────────────────────────────┘
```

---

## 3. Conflict Resolution Strategy

### 3.1 Client-Side UUID Generation
All entity identifiers (`id`) are standard Version 4 UUIDs generated directly on the client device. This guarantees that records created offline on two different devices never have identical or conflicting IDs.

### 3.2 Idempotent Upserts
Both Android WorkManager and Desktop sync workers push operations via `UPSERT` queries keyed on `id`. If a network timeout occurs and a transaction is retried, the database updates the existing row rather than inserting a duplicate.

### 3.3 Conflict Rule: Latest `updated_at` Wins
If a transaction is edited simultaneously on two devices, the record with the most recent ISO-8601 timestamp (`updated_at`) prevails.

### 3.4 Soft Deletion Propagation
Transactions are never immediately physically deleted from the database. Instead:
```sql
UPDATE transactions SET deleted_at = timezone('utc'::text, now()) WHERE id = '...';
```
When synchronizing, the `deleted_at` timestamp is replicated across all client devices. Clients automatically filter out records where `deleted_at IS NOT NULL`, preserving financial audit history and ensuring deletions propagate cleanly without resurrecting deleted items.

---

## 4. Multi-Device Realtime Convergence

When running on desktop or tablet:
- **Supabase Realtime Channel**: Subscribes to PostgreSQL `INSERT`, `UPDATE`, and `DELETE` changes on `transactions`, `transfers`, and `accounts`.
- When an expense is recorded on an Android phone, the desktop dashboard receives the Realtime event within milliseconds and automatically recalculates current balances without requiring a page refresh.
