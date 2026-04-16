# Maintenance Request Workflow — Business Rules Specification

> **Source:** `legacy/app/models/maintenance_request.rb`
> **Last Updated:** 2026-04-16

## 1. Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| `description` | Text | Required |
| `category` | String | Required; enum (see §3) |
| `priority` | String | Required; enum (see §4) |
| `status` | String | Required; enum (see §2) |
| `property_id` | FK → Property | Required (belongs_to) |
| `tenant_id` | FK → Tenant | Required (belongs_to) |
| `vendor_id` | FK → Vendor | Optional (belongs_to, optional: true) |

## 2. Status Lifecycle

### Allowed Statuses

| Status | Description |
|--------|-------------|
| `open` | Newly created request, awaiting assignment |
| `assigned` | A vendor has been assigned to handle the request |
| `in_progress` | Work is actively underway |
| `completed` | Work is finished, pending verification/closure |
| `closed` | Request is fully resolved and archived |

### State Transition Diagram

```
                    ┌──────────────────────────────────────┐
                    │          (re-open if needed)          │
                    ▼                                       │
              ┌──────────┐    ┌────────────┐    ┌─────────────────┐
  [CREATE] ──►│   open   │───►│  assigned  │───►│  in_progress    │
              └──────────┘    └────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                              ┌────────────┐    ┌─────────────────┐
                              │   closed   │◄───│   completed     │
                              └────────────┘    └─────────────────┘
```

### Expected Transition Rules

| From | To | Trigger |
|------|----|---------|
| *(new)* | `open` | Tenant creates a maintenance request |
| `open` | `assigned` | Property manager assigns a vendor |
| `assigned` | `in_progress` | Vendor begins work |
| `in_progress` | `completed` | Vendor marks work as done |
| `completed` | `closed` | Property manager verifies and closes |
| `completed` | `in_progress` | Work needs additional attention (re-work) |
| `closed` | `open` | Re-opened if issue recurs |

### Notes on Legacy Implementation

- The legacy model validates that `status` is one of the five allowed values but **does not enforce transition order**. Any valid status can be set at any time.
- **Recommendation:** The new system should enforce valid transitions using a state machine (e.g., reject `open → completed` directly).

### Invalid Transitions (to enforce in new system)

| From | To | Reason |
|------|----|--------|
| `open` | `in_progress` | Must be assigned to a vendor first |
| `open` | `completed` | Cannot complete without assignment and work |
| `open` | `closed` | Cannot close without completing work |
| `assigned` | `closed` | Must go through in_progress → completed first |
| `assigned` | `open` | Use unassign action instead if needed |

## 3. Categories

| Value | Description |
|-------|-------------|
| `plumbing` | Water supply, drainage, pipes, fixtures, water heaters |
| `electrical` | Wiring, outlets, circuit breakers, lighting, panels |
| `hvac` | Heating, ventilation, air conditioning, thermostats |
| `appliance` | Refrigerator, oven, dishwasher, washer/dryer, microwave |
| `other` | General maintenance not covered by above categories |

### Validation

- `category` is **required**.
- Must be exactly one of the five values above (case-sensitive, lowercase).

## 4. Priorities

| Value | Description | Expected Response Time (recommendation) |
|-------|-------------|----------------------------------------|
| `low` | Cosmetic or minor issues; no immediate impact | 7–14 business days |
| `medium` | Functional issue with workaround available | 3–5 business days |
| `high` | Significant issue affecting habitability or safety | 24–48 hours |
| `emergency` | Immediate danger to life, health, or property (e.g., gas leak, flooding, fire damage) | Immediate / same-day |

### Validation

- `priority` is **required**.
- Must be exactly one of the four values above (case-sensitive, lowercase).

### High-Priority Scope

The legacy model provides a `high_priority` scope that returns requests where priority is `high` **or** `emergency`:

```sql
SELECT * FROM maintenance_requests
WHERE priority IN ('high', 'emergency');
```

## 5. Scopes

| Scope | Filter | SQL Equivalent |
|-------|--------|----------------|
| `open` | `status = 'open'` | `WHERE status = 'open'` |
| `high_priority` | `priority IN ('high', 'emergency')` | `WHERE priority IN ('high', 'emergency')` |

## 6. Auto-Notification on Create

### Behavior

When a maintenance request is created (`after_create` callback):

1. The system sends an email notification to the **property manager**.
2. The notification is dispatched **asynchronously** (`deliver_later`) via `MaintenanceMailer.request_created`.

### Notification Details

| Attribute | Value |
|-----------|-------|
| Trigger | Record successfully created (after_create) |
| Recipient | Property manager associated with the request's property |
| Delivery | Asynchronous (background job queue) |
| Mailer | `MaintenanceMailer#request_created` |
| Payload | The maintenance request object (includes property, tenant, category, priority, description) |

### Edge Cases

| Case | Behavior |
|------|----------|
| Validation fails on create | No notification sent (after_create only fires on successful save) |
| Property has no manager email | Legacy code does not handle — likely a silent failure. New system should validate. |
| Background job queue is down | Email will be retried per job queue retry policy |

### Recommendations for New System

1. **Extend notifications** — also notify on status changes (especially `assigned`, `completed`).
2. **Notify tenants** — send confirmation to the tenant who submitted the request.
3. **Priority-based routing** — emergency requests should trigger SMS/push in addition to email.
4. **Notification preferences** — allow managers to configure channels (email, SMS, in-app).

## 7. Relationships

```
Property ──┐
            ├──► MaintenanceRequest ◄── Tenant
Vendor ─────┘ (optional)
```

- A maintenance request **must** belong to a property and a tenant.
- A vendor is **optional** — assigned after the request is created.
- A property can have **many** maintenance requests.
- A tenant can have **many** maintenance requests.

## 8. Recommendations for New System

1. **Enforce state machine transitions** — prevent invalid status jumps.
2. **Add timestamps per status** — `assigned_at`, `started_at`, `completed_at`, `closed_at` for SLA tracking.
3. **Add resolution notes** — capture what was done to resolve the issue.
4. **Add estimated cost / actual cost** — for budgeting and invoice tracking.
5. **Add photos/attachments** — tenants should be able to upload images when creating requests.
6. **SLA enforcement** — auto-escalate if response time exceeds the expected window per priority level.
