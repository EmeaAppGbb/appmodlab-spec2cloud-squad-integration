# UrbanNest Entity Model

## Entities

### Property
Represents a rental property listing.

| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK, auto-increment |
| address | varchar | NOT NULL |
| city | varchar | NOT NULL |
| state | varchar | NOT NULL |
| zip_code | varchar | NOT NULL |
| property_type | enum(apartment, house, condo, townhouse) | NOT NULL |
| bedrooms | integer | nullable |
| bathrooms | integer | nullable |
| square_feet | integer | nullable |
| monthly_rent | decimal(10,2) | NOT NULL |
| is_available | boolean | NOT NULL, default true |
| created_at | timestamp | auto-generated |
| updated_at | timestamp | auto-updated |

### Tenant
Represents a person who rents a property.

| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK, auto-increment |
| first_name | varchar | NOT NULL |
| last_name | varchar | NOT NULL |
| email | varchar | NOT NULL, UNIQUE |
| phone | varchar | NOT NULL |
| created_at | timestamp | auto-generated |
| updated_at | timestamp | auto-updated |

### Lease
Binds a tenant to a property for a period of time.

| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK, auto-increment |
| property_id | integer | NOT NULL, FK → properties(id) |
| tenant_id | integer | NOT NULL, FK → tenants(id) |
| start_date | date | NOT NULL |
| end_date | date | NOT NULL |
| monthly_rent | decimal(10,2) | NOT NULL |
| status | enum(active, expired, terminated) | NOT NULL |
| created_at | timestamp | auto-generated |
| updated_at | timestamp | auto-updated |

### MaintenanceRequest
Tracks repair/service requests submitted by tenants for a property.

| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK, auto-increment |
| property_id | integer | NOT NULL, FK → properties(id) |
| tenant_id | integer | NOT NULL, FK → tenants(id) |
| vendor_id | integer | nullable |
| category | enum(plumbing, electrical, hvac, appliance, other) | NOT NULL |
| priority | enum(low, medium, high, emergency) | NOT NULL |
| description | text | NOT NULL |
| status | enum(open, assigned, in_progress, completed, closed) | NOT NULL, default 'open' |
| created_at | timestamp | auto-generated |
| updated_at | timestamp | auto-updated |

---

## Relationships

```
┌────────────┐       ┌──────────┐       ┌────────────┐
│  Property   │ 1───* │  Lease   │ *───1 │   Tenant   │
└────────────┘       └──────────┘       └────────────┘
      │                                       │
      │ 1───*                           *───1 │
      ▼                                       ▼
┌─────────────────────┐
│  MaintenanceRequest  │
└─────────────────────┘
```

### One-to-Many

| Parent | Child | FK column | Relationship |
|--------|-------|-----------|--------------|
| Property | Lease | `lease.property_id` | A property can have many leases |
| Tenant | Lease | `lease.tenant_id` | A tenant can have many leases |
| Property | MaintenanceRequest | `maintenance_requests.property_id` | A property can have many maintenance requests |
| Tenant | MaintenanceRequest | `maintenance_requests.tenant_id` | A tenant can submit many maintenance requests |

### Business Logic (computed, not stored)

- **Lease.totalCost** — `ceil((end_date − start_date) / 30) × monthly_rent`
- **Lease.isRenewable** — `true` when `end_date > NOW() + 30 days` AND `status = 'active'`
- **Tenant.fullName** — `first_name || ' ' || last_name` (derived getter)
