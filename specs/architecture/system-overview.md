# UrbanNest Property Management — System Overview

> **Source**: Legacy Ruby on Rails 5.2 monolith located in `legacy/`
> **Generated**: 2026-04-16

---

## 1. Current Architecture

### Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Ruby on Rails | 5.2.8 | Web framework (MVC monolith) |
| Language | Ruby | 3.1.2 | Runtime |
| Database | PostgreSQL | 16 | Primary data store (`urbannest_dev`) |
| Cache / Queue Broker | Redis | 7 (Alpine) | Sidekiq job backend and caching |
| Background Jobs | Sidekiq | 6.5 | Async task processing (emails, etc.) |
| Web Server | Puma | 3.12 | Application server |
| Payments | Stripe | 7.0 | Payment processing integration |
| Email | SendGrid (sendgrid-ruby) | 6.6 | Transactional email delivery |
| JSON Rendering | Jbuilder | 2.7 | JSON API view templates |
| Testing | RSpec | 5.0 | Test framework |

### Deployment Topology

```
┌─────────────┐     ┌──────────┐     ┌────────────┐
│   Puma       │────▶│PostgreSQL│     │   Redis     │
│  (Rails 5.2) │     │  :5432   │     │   :6379    │
└──────┬───────┘     └──────────┘     └─────┬──────┘
       │                                    │
       │            ┌───────────┐           │
       └───────────▶│  Sidekiq  │◀──────────┘
                    └─────┬─────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        ┌──────────┐          ┌────────────┐
        │  Stripe  │          │  SendGrid  │
        │  (API)   │          │  (SMTP/API)│
        └──────────┘          └────────────┘
```

Infrastructure is containerized via `docker-compose.yml` with PostgreSQL and Redis services. Puma and Sidekiq run on the host or in separate containers (not defined in the current compose file).

---

## 2. Domain Models & Relationships

### Entity-Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Owner   │──1:N──│ Property │──1:N──│  Lease   │──N:1──┐
└──────────┘       └────┬─────┘       └──────────┘       │
                        │                                 │
                        │ 1:N                             │
                        ▼                                 ▼
              ┌──────────────────┐               ┌──────────┐
              │MaintenanceRequest│──N:1──────────▶│  Tenant  │
              └────────┬─────────┘               └──────────┘
                       │                                │
                       │ N:1 (optional)                 │ 1:N
                       ▼                                ▼
                 ┌──────────┐              ┌─────────────────────┐
                 │  Vendor  │              │ TenantApplication   │
                 └──────────┘              └─────────────────────┘
```

### Model Details

#### Property (`app/models/property.rb`)

| Attribute | Type | Constraints |
|---|---|---|
| address | string | required |
| city | string | required |
| state | string | required |
| zip_code | string | required |
| property_type | string | required; one of: `apartment`, `house`, `condo`, `townhouse` |
| bedrooms | integer | — |
| bathrooms | integer | — |
| square_feet | integer | — |
| monthly_rent | decimal | required |
| is_available | boolean | — |

- **Associations**: `belongs_to :owner`, `has_many :leases`, `has_many :maintenance_requests`
- **Scopes**: `available` (where `is_available = true`), `in_city(city)`

#### Tenant (`app/models/tenant.rb`)

| Attribute | Type | Constraints |
|---|---|---|
| first_name | string | required |
| last_name | string | required |
| email | string | required, unique, RFC-compliant format |
| phone | string | required |

- **Associations**: `has_many :leases`, `has_many :tenant_applications`, `has_many :maintenance_requests`
- **Methods**: `full_name` (concatenation), `active_leases` (leases with status `active`)

#### Lease (`app/models/lease.rb`)

| Attribute | Type | Constraints |
|---|---|---|
| start_date | date | required |
| end_date | date | required |
| monthly_rent | decimal | required |
| status | string | required; one of: `active`, `expired`, `terminated` |

- **Associations**: `belongs_to :property`, `belongs_to :tenant`
- **Scopes**: `active`, `expiring_soon` (active leases ending within 60 days)
- **Business Logic**:
  - `calculate_total_cost` — estimates total lease cost: `ceil((end_date - start_date) / 30) × monthly_rent`
  - `is_renewable?` — returns `true` if end_date > 30 days from now **and** status is `active`

#### MaintenanceRequest (`app/models/maintenance_request.rb`)

| Attribute | Type | Constraints |
|---|---|---|
| category | string | required; one of: `plumbing`, `electrical`, `hvac`, `appliance`, `other` |
| priority | string | required; one of: `low`, `medium`, `high`, `emergency` |
| description | text | required |
| status | string | required; one of: `open`, `assigned`, `in_progress`, `completed`, `closed` |

- **Associations**: `belongs_to :property`, `belongs_to :tenant`, `belongs_to :vendor` (optional)
- **Scopes**: `open`, `high_priority` (priority `high` or `emergency`)
- **Callbacks**: `after_create :notify_property_manager` — dispatches `MaintenanceMailer.request_created` via `deliver_later` (Sidekiq)

---

## 3. API Endpoints (from `config/routes.rb`)

All routes follow standard Rails RESTful conventions.

### Properties

| Verb | Path | Action | Notes |
|---|---|---|---|
| GET | `/properties` | `PropertiesController#index` | Returns available properties (scope: `available`) |
| GET | `/properties/:id` | `PropertiesController#show` | Single property JSON |
| POST | `/properties` | `PropertiesController#create` | Creates property; returns 201 or 422 |
| PATCH/PUT | `/properties/:id` | `PropertiesController#update` | Updates property; returns 200 or 422 |
| DELETE | `/properties/:id` | `PropertiesController#destroy` | Deletes property; returns 204 |

### Tenants

| Verb | Path | Action |
|---|---|---|
| GET | `/tenants` | `TenantsController#index` |
| GET | `/tenants/:id` | `TenantsController#show` |
| POST | `/tenants` | `TenantsController#create` |
| PATCH/PUT | `/tenants/:id` | `TenantsController#update` |
| DELETE | `/tenants/:id` | `TenantsController#destroy` |

### Tenant Applications (nested under tenants)

| Verb | Path | Action |
|---|---|---|
| GET | `/tenants/:tenant_id/applications` | `TenantApplicationsController#index` |
| GET | `/tenants/:tenant_id/applications/:id` | `TenantApplicationsController#show` |
| POST | `/tenants/:tenant_id/applications` | `TenantApplicationsController#create` |
| PATCH/PUT | `/tenants/:tenant_id/applications/:id` | `TenantApplicationsController#update` |
| DELETE | `/tenants/:tenant_id/applications/:id` | `TenantApplicationsController#destroy` |

### Leases

| Verb | Path | Action |
|---|---|---|
| GET | `/leases` | `LeasesController#index` |
| GET | `/leases/:id` | `LeasesController#show` |
| POST | `/leases` | `LeasesController#create` |
| PATCH/PUT | `/leases/:id` | `LeasesController#update` |
| DELETE | `/leases/:id` | `LeasesController#destroy` |

### Maintenance Requests

| Verb | Path | Action |
|---|---|---|
| GET | `/maintenance/requests` | `MaintenanceRequestsController#index` |
| GET | `/maintenance/requests/:id` | `MaintenanceRequestsController#show` |
| POST | `/maintenance/requests` | `MaintenanceRequestsController#create` |
| PATCH/PUT | `/maintenance/requests/:id` | `MaintenanceRequestsController#update` |
| DELETE | `/maintenance/requests/:id` | `MaintenanceRequestsController#destroy` |

**Root route**: `GET /` → `PropertiesController#index`

---

## 4. Business Rules

### Lease Calculations

| Rule | Implementation | Location |
|---|---|---|
| **Total cost estimation** | `ceil((end_date - start_date) / 30) × monthly_rent` | `Lease#calculate_total_cost` |
| **Renewability check** | Lease is renewable if `end_date > 30.days.from_now` AND `status == 'active'` | `Lease#is_renewable?` |
| **Expiring-soon detection** | Active leases with `end_date ≤ 60.days.from_now` | `Lease.expiring_soon` scope |

> ⚠️ **Note**: The total cost calculation uses a simplified 30-day month approximation, which may produce slightly inaccurate results for varying month lengths.

### Maintenance Request Workflow

```
  ┌──────┐    assign    ┌──────────┐   begin work   ┌─────────────┐
  │ open │─────────────▶│ assigned │───────────────▶│ in_progress │
  └──────┘              └──────────┘                └──────┬──────┘
                                                           │
                                                    finish │
                                                           ▼
                                                   ┌───────────┐   close   ┌────────┐
                                                   │ completed │─────────▶│ closed │
                                                   └───────────┘          └────────┘
```

- **Status values**: `open` → `assigned` → `in_progress` → `completed` → `closed`
- **Priority levels**: `low`, `medium`, `high`, `emergency`
- **Categories**: `plumbing`, `electrical`, `hvac`, `appliance`, `other`
- **Auto-notification**: On creation, `MaintenanceMailer.request_created` is dispatched asynchronously via Sidekiq (`deliver_later`)

### Property Availability

- Properties are filtered by `is_available: true` in the default index action
- Property types are restricted to: `apartment`, `house`, `condo`, `townhouse`

### Tenant Management

- Email uniqueness is enforced at the model level
- Email format validated against `URI::MailTo::EMAIL_REGEXP`
- Active leases queried via `Tenant#active_leases`

---

## 5. Integration Points

### Stripe (Payment Processing)

| Aspect | Detail |
|---|---|
| Gem | `stripe ~> 7.0` |
| Purpose | Payment processing (rent collection, deposits) |
| Integration Pattern | Server-side API calls via Stripe Ruby SDK |
| Likely Usage | Lease payment collection, tenant billing |

> **Note**: No Stripe-specific controller or model logic is present in the reviewed source files. The integration is declared via the Gemfile and is likely implemented in service objects, jobs, or controllers not included in the `legacy/` snapshot.

### SendGrid (Transactional Email)

| Aspect | Detail |
|---|---|
| Gem | `sendgrid-ruby ~> 6.6` |
| Purpose | Transactional email delivery |
| Integration Pattern | Mailer classes dispatched via `deliver_later` (Sidekiq) |
| Confirmed Usage | `MaintenanceMailer.request_created` — sends notification to property manager when a maintenance request is created |

### Redis

| Aspect | Detail |
|---|---|
| Gem | `redis ~> 4.0` |
| Purpose | Sidekiq job queue backend |
| Container | `redis:7-alpine` on port 6379 |

---

## 6. Identified Risks & Modernization Considerations

| Area | Observation |
|---|---|
| **Framework EOL** | Rails 5.2 reached end-of-life; no security patches are being provided |
| **No authentication/authorization** | No auth gems (Devise, Pundit, etc.) in Gemfile; API appears fully open |
| **No API versioning** | Routes lack `/api/v1/` namespacing |
| **No pagination** | `PropertiesController#index` returns all available properties without pagination |
| **Soft delete missing** | `destroy` performs hard deletes; no `paranoia` or `discard` gem present |
| **Status transitions unguarded** | Lease and MaintenanceRequest status changes are not enforced via state machine; any valid status can be set at any time |
| **Vendor association optional** | MaintenanceRequest vendor is optional — no workflow enforces vendor assignment before `in_progress` |
| **Lease cost approximation** | 30-day month assumption in `calculate_total_cost` may cause billing discrepancies |
| **Missing controllers** | `TenantsController`, `LeasesController`, `MaintenanceRequestsController`, `TenantApplicationsController` are referenced by routes but not present in the snapshot |
