# Lease Calculations — Business Rules Specification

> **Source:** `legacy/app/models/lease.rb`
> **Last Updated:** 2026-04-16

## 1. Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| `start_date` | Date | Required |
| `end_date` | Date | Required |
| `monthly_rent` | Decimal | Required |
| `status` | String | Required; one of `active`, `expired`, `terminated` |
| `property_id` | FK → Property | Required (belongs_to) |
| `tenant_id` | FK → Tenant | Required (belongs_to) |

## 2. Validation Rules

| Rule | Details |
|------|---------|
| Required fields | `start_date`, `end_date`, `monthly_rent` must all be present |
| Status values | Must be exactly one of: **active**, **expired**, **terminated** |
| `monthly_rent` | Must be present (no explicit min/max in legacy code — recommend adding `> 0` in new system) |

## 3. Calculate Total Cost

### Formula

```
months = CEIL( (end_date − start_date) / 30 )
total_cost = monthly_rent × months
```

### Semantics

- Uses a **30-day month approximation** — not calendar months.
- The difference `(end_date − start_date)` is measured in **days**.
- The result is rounded **up** (`CEIL`) so any partial 30-day period counts as a full month.

### Examples

| start_date | end_date | Days | months (ceil) | monthly_rent | total_cost |
|------------|----------|------|---------------|--------------|------------|
| 2026-01-01 | 2026-12-31 | 364 | ceil(364/30) = **13** | $1,200 | **$15,600** |
| 2026-01-01 | 2027-01-01 | 365 | ceil(365/30) = **13** | $1,200 | **$15,600** |
| 2026-03-01 | 2026-06-01 | 92 | ceil(92/30) = **4** | $950 | **$3,800** |
| 2026-06-01 | 2026-06-15 | 14 | ceil(14/30) = **1** | $2,000 | **$2,000** |
| 2026-01-01 | 2026-01-31 | 30 | ceil(30/30) = **1** | $1,500 | **$1,500** |
| 2026-01-01 | 2026-02-01 | 31 | ceil(31/30) = **2** | $1,500 | **$3,000** |

### Edge Cases

| Case | Behavior |
|------|----------|
| Same-day lease (`start_date == end_date`) | Days = 0 → `ceil(0/30) = 0` → total_cost = **$0** |
| Single-day lease (1 day apart) | Days = 1 → `ceil(1/30) = 1` → charges 1 full month |
| Exactly 30 days | `ceil(30/30) = 1` → 1 month |
| 31 days | `ceil(31/30) = 2` → 2 months (one extra day triggers a full additional month) |
| `end_date < start_date` | Legacy code does not guard against this — produces a **negative** total. New system **must** validate `end_date > start_date`. |

## 4. Renewable Check (`is_renewable?`)

### Rule

A lease is renewable when **both** conditions are true:

1. `end_date` is **more than 30 days** from the current date (`end_date > NOW + 30 days`)
2. `status` is `active`

### Truth Table

| end_date vs. now | status | is_renewable? |
|------------------|--------|---------------|
| > 30 days away | active | ✅ Yes |
| > 30 days away | expired | ❌ No |
| > 30 days away | terminated | ❌ No |
| ≤ 30 days away | active | ❌ No |
| ≤ 30 days away | expired | ❌ No |
| Exactly 31 days away | active | ✅ Yes |
| Exactly 30 days away | active | ❌ No (strict `>`, not `>=`) |

### Notes

- The comparison is **strictly greater than** 30 days — a lease ending in exactly 30 days is **not** renewable.
- The check is evaluated at query time against `NOW`.

## 5. Expiring Soon Scope

### Rule

Returns all leases where:

1. `end_date ≤ NOW + 60 days`
2. `status = 'active'`

### SQL Equivalent

```sql
SELECT * FROM leases
WHERE end_date <= CURRENT_DATE + INTERVAL '60 days'
  AND status = 'active';
```

### Behavior

| end_date vs. now | status | In scope? |
|------------------|--------|-----------|
| 59 days away | active | ✅ Yes |
| 60 days away | active | ✅ Yes (inclusive `<=`) |
| 61 days away | active | ❌ No |
| 30 days away | expired | ❌ No |
| Already past | active | ✅ Yes (end_date in the past still matches) |

### Notes

- **Already-past leases** with `status = 'active'` will appear in this scope. The new system should consider whether these should be auto-expired.
- The 60-day window uses `<=` (inclusive), unlike the renewable check which uses `>`.

## 6. Active Scope

```sql
SELECT * FROM leases WHERE status = 'active';
```

Simple filter — returns all leases with `status = 'active'` regardless of dates.

## 7. Relationship Between Renewable and Expiring Soon

The renewable window (>30 days) and the expiring-soon window (≤60 days) **overlap** between 31–60 days:

```
Timeline (days until end_date):
──────────────────────────────────────────────────────►
0          30          60
│◄─ NOT renewable ─►│◄─── renewable ───────────────►
│◄──── expiring_soon ────►│

Overlap (31–60 days): lease is BOTH renewable AND expiring soon
```

This overlap is intentional — it allows the system to prompt tenants about renewal while flagging leases that need attention.

## 8. Recommendations for New System

1. **Validate `end_date > start_date`** — legacy code has no guard.
2. **Validate `monthly_rent > 0`** — legacy only checks presence.
3. **Consider calendar-month calculation** — the 30-day approximation can produce unexpected results (e.g., a Feb 1–Mar 1 lease = 28 days = 1 month, but a Jan 1–Feb 1 lease = 31 days = 2 months).
4. **Auto-expire leases** whose `end_date` has passed but `status` is still `active`.
5. **Audit trail** — track status transitions with timestamps.
