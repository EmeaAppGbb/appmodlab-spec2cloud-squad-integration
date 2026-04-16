# UrbanNest — Spec Deviation Register

> **Generated**: 2026-04-16
> **Source**: [assets/outputs/step-07b-spec-validation.txt](../assets/outputs/step-07b-spec-validation.txt)
> **Conformance baseline**: 42 / 47 checks passed (89 % conformance)

---

## DEV-001 — TenantApplication Nested Resource Not Implemented

| Field | Detail |
|---|---|
| **Spec section** | `specs/architecture/system-overview.md` §3 — CRUD Endpoints |
| **Expected behavior** | A `TenantApplication` entity exists with full nested CRUD at `GET/POST/PUT/DELETE /tenants/:tenant_id/applications`. The resource tracks rental applications submitted by tenants including application status, screening results, and supporting documents. |
| **Actual implementation** | No `TenantApplication` entity, module, controller, or DTO exists anywhere in the codebase. The feature is entirely absent. |
| **Rationale / Plan** | This resource was deprioritised during the initial migration from the legacy system. It should be implemented as a new NestJS module (`TenantApplicationsModule`) with a `TenantApplication` entity related via `ManyToOne` to `Tenant`, exposed under a nested route. |
| **Priority** | **P1** — Core domain feature required for tenant onboarding workflow |
| **Estimated effort** | **M** (2–3 days) — New entity, DTO with validation, service, controller, module registration, and integration tests |

---

## DEV-002 — No `end_date > start_date` Validation on Lease DTO

| Field | Detail |
|---|---|
| **Spec section** | `specs/business-rules/lease-calculations.md` — Lease validation rules |
| **Expected behavior** | The system validates that `end_date` is strictly after `start_date` when creating or updating a lease. Requests where `end_date ≤ start_date` should be rejected with a 400 Bad Request. |
| **Actual implementation** | `api/src/leases/dto/create-lease.dto.ts` only applies `@IsDateString()` and `@IsNotEmpty()` to both date fields. No cross-field validation exists — a lease with `end_date` before `start_date` is accepted and persisted. |
| **Rationale / Plan** | Oversight during initial implementation. Fix by adding a custom class-validator decorator or a `@ValidateIf` cross-field check in the DTO that rejects `end_date ≤ start_date`. |
| **Priority** | **P1** — Data integrity issue; invalid leases break `calculateTotalCost` (negative durations) |
| **Estimated effort** | **S** (< 1 day) — Custom validator + unit tests |

---

## DEV-003 — `monthly_rent` Allows Zero Value

| Field | Detail |
|---|---|
| **Spec section** | `specs/business-rules/lease-calculations.md` — Lease validation rules |
| **Expected behavior** | `monthly_rent` must be strictly greater than zero (`> 0`). A zero-rent lease is not a valid business scenario. |
| **Actual implementation** | `api/src/leases/dto/create-lease.dto.ts:29` uses `@Min(0)`, which permits a `monthly_rent` of exactly `0`. |
| **Rationale / Plan** | Minor validation gap. Fix by changing `@Min(0)` to `@IsPositive()` (or `@Min(0.01)`) in the lease DTO. |
| **Priority** | **P2** — Low risk in practice but violates spec; zero-rent leases produce misleading analytics |
| **Estimated effort** | **S** (< 1 hour) — One-line decorator change + test update |

---

## DEV-004 — No Maintenance Status State-Transition Enforcement

| Field | Detail |
|---|---|
| **Spec section** | `specs/business-rules/maintenance-workflow.md` §2 — Status workflow & transitions |
| **Expected behavior** | Maintenance request status must follow a defined state machine: `open → assigned → in_progress → completed → closed`. Only valid forward transitions (and specific rollbacks, if any) should be allowed. Invalid transitions (e.g., `open → closed`) must be rejected. |
| **Actual implementation** | `api/src/maintenance/maintenance.service.ts:57-60` performs a plain `update()` — any valid enum value can be set on any request regardless of its current status. There is no transition validation. |
| **Rationale / Plan** | Carried over from the legacy system which had the same gap. Implement a state-machine guard in `MaintenanceService.update()` that maps each status to its allowed next statuses and rejects invalid transitions with a 422 Unprocessable Entity. |
| **Priority** | **P2** — Workflow correctness; prevents accidental status jumps in production |
| **Estimated effort** | **M** (1–2 days) — Transition map, guard logic in service, error handling, and tests for each valid/invalid transition |

---

## DEV-005 — No Auto-Notification on Maintenance Request Creation

| Field | Detail |
|---|---|
| **Spec section** | `specs/business-rules/maintenance-workflow.md` — `after_create` callback |
| **Expected behavior** | When a new maintenance request is created, the system should asynchronously dispatch a notification to the property manager via `MaintenanceMailer.request_created` (or equivalent notification service). |
| **Actual implementation** | `api/src/maintenance/maintenance.service.ts:52-54` creates the entity and returns it. No notification, event, or callback is triggered. |
| **Rationale / Plan** | Notification infrastructure was out of scope for the initial API build. To address: introduce an event-based approach (e.g., NestJS `EventEmitter2`) that emits a `maintenance.created` event, with a listener that dispatches the notification asynchronously. This keeps the service decoupled from the mailer. |
| **Priority** | **P3** — Desirable but not blocking core functionality; property managers currently rely on dashboard polling |
| **Estimated effort** | **M** (2–3 days) — Event emitter setup, notification listener, email/template integration, and tests |

---

## Summary Matrix

| ID | Title | Spec Area | Priority | Effort | Status |
|---|---|---|---|---|---|
| DEV-001 | TenantApplication not implemented | Architecture §3 | P1 | M (2–3 d) | Open |
| DEV-002 | No `end_date > start_date` validation | Lease rules | P1 | S (< 1 d) | Open |
| DEV-003 | `monthly_rent` allows zero | Lease rules | P2 | S (< 1 h) | Open |
| DEV-004 | No state-transition enforcement | Maintenance workflow §2 | P2 | M (1–2 d) | Open |
| DEV-005 | No auto-notification on create | Maintenance workflow | P3 | M (2–3 d) | Open |

### Priority Definitions

| Level | Definition |
|---|---|
| **P1** | Must fix — data integrity or missing core feature |
| **P2** | Should fix — workflow correctness or spec compliance |
| **P3** | Nice to have — enhances UX but has viable workaround |

### Effort Definitions

| Size | Definition |
|---|---|
| **S** | Small — less than 1 day |
| **M** | Medium — 1 to 3 days |
| **L** | Large — more than 3 days |
