# Tenant Screening & Validation — Business Rules Specification

> **Source:** `legacy/app/models/tenant.rb`
> **Last Updated:** 2026-04-16

## 1. Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| `first_name` | String | Required |
| `last_name` | String | Required |
| `email` | String | Required, unique, must match email format |
| `phone` | String | Required |

### Relationships

| Association | Type | Description |
|-------------|------|-------------|
| `leases` | has_many | All leases (any status) for this tenant |
| `tenant_applications` | has_many | Screening/application records |
| `maintenance_requests` | has_many | Maintenance requests submitted by this tenant |

## 2. Validation Rules

### Required Fields

All four fields must be present on every create and update:

| Field | Presence | Additional Rules |
|-------|----------|-----------------|
| `first_name` | ✅ Required | — |
| `last_name` | ✅ Required | — |
| `email` | ✅ Required | Must be unique; must match email format |
| `phone` | ✅ Required | — |

### Email Uniqueness

- The `email` field has a **database-level uniqueness constraint** (via Rails `validates :email, uniqueness: true`).
- Two tenants **cannot** share the same email address.
- Uniqueness check is **case-sensitive** in the legacy system. The new system should enforce **case-insensitive** uniqueness (e.g., `john@example.com` and `John@Example.com` should be treated as the same).

### Email Format

- Validated against Ruby's `URI::MailTo::EMAIL_REGEXP`.
- This regex validates standard RFC-compliant email addresses.
- Examples:

| Input | Valid? |
|-------|--------|
| `tenant@example.com` | ✅ Yes |
| `jane.doe+tag@company.co.uk` | ✅ Yes |
| `user@sub.domain.org` | ✅ Yes |
| `plaintext` | ❌ No (no @ symbol) |
| `@missing-local.com` | ❌ No (no local part) |
| `user@` | ❌ No (no domain) |
| *(empty string)* | ❌ No (fails presence check) |

## 3. Computed Properties

### Full Name

```
full_name = "{first_name} {last_name}"
```

Simple concatenation with a space separator. Used for display purposes.

| first_name | last_name | full_name |
|------------|-----------|-----------|
| Jane | Doe | "Jane Doe" |
| José | García | "José García" |

## 4. Active Lease Tracking

### Rule

```ruby
active_leases = tenant.leases.where(status: 'active')
```

Returns all leases for the tenant where `status = 'active'`.

### SQL Equivalent

```sql
SELECT * FROM leases
WHERE tenant_id = :tenant_id
  AND status = 'active';
```

### Behavior

| Scenario | Result |
|----------|--------|
| Tenant has 2 active leases, 1 expired | Returns 2 leases |
| Tenant has no active leases | Returns empty collection |
| Tenant has never had a lease | Returns empty collection |

### Notes

- A tenant **can** have multiple active leases simultaneously (e.g., renting two units).
- The legacy model does not restrict the number of concurrent active leases.

## 5. Tenant Applications

- The `tenant_applications` association exists in the model but application logic is not defined in the legacy tenant model.
- This relationship suggests a **screening/application workflow** exists elsewhere in the system.
- The new system should define the full application lifecycle (see §7).

## 6. Relationship Diagram

```
Tenant
  │
  ├── has_many ──► Leases
  │                  └── belongs_to Property
  │
  ├── has_many ──► TenantApplications
  │
  └── has_many ──► MaintenanceRequests
                     └── belongs_to Property
```

## 7. Recommendations for New System

### Validation Enhancements

1. **Case-insensitive email uniqueness** — normalize emails to lowercase before storing.
2. **Phone format validation** — legacy code only checks presence. Add format validation (e.g., E.164 format).
3. **Name length limits** — add min (1) and max (100) length constraints for `first_name` and `last_name`.
4. **Email verification** — send a confirmation email to verify the address is deliverable.

### Screening Enhancements

5. **Credit check integration** — connect to a credit screening API during the application process.
6. **Background check** — integrate criminal/eviction history checks.
7. **Income verification** — require proof of income (typically 3× monthly rent).
8. **Rental history** — collect and verify previous landlord references.
9. **Application status workflow** — define statuses such as `submitted → under_review → approved → rejected`.

### Data Integrity

10. **Soft delete** — tenants with historical leases should not be hard-deleted; use a `deactivated_at` timestamp.
11. **Prevent deletion with active leases** — block tenant removal if any lease has `status = 'active'`.
12. **Audit log** — track all changes to tenant records for compliance.

### Privacy & Compliance

13. **PII handling** — encrypt sensitive fields (email, phone) at rest.
14. **Data retention** — define retention policies for tenant data after all leases end.
15. **GDPR/CCPA** — support data export and deletion requests.
