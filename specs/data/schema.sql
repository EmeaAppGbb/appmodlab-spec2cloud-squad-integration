-- UrbanNest Property Management — PostgreSQL Schema
-- Generated from TypeORM entities in api/src/

-- ============================================================
-- ENUM types
-- ============================================================

CREATE TYPE property_type AS ENUM ('apartment', 'house', 'condo', 'townhouse');
CREATE TYPE lease_status  AS ENUM ('active', 'expired', 'terminated');
CREATE TYPE maintenance_category AS ENUM ('plumbing', 'electrical', 'hvac', 'appliance', 'other');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE maintenance_status   AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'closed');

-- ============================================================
-- Properties
-- ============================================================

CREATE TABLE properties (
    id            SERIAL PRIMARY KEY,
    address       VARCHAR(255) NOT NULL,
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(50)  NOT NULL,
    zip_code      VARCHAR(20)  NOT NULL,
    property_type property_type NOT NULL,
    bedrooms      INTEGER,
    bathrooms     INTEGER,
    square_feet   INTEGER,
    monthly_rent  DECIMAL(10, 2) NOT NULL,
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Tenants
-- ============================================================

CREATE TABLE tenants (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(30)  NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Leases
-- ============================================================

CREATE TABLE leases (
    id           SERIAL PRIMARY KEY,
    property_id  INTEGER      NOT NULL REFERENCES properties(id),
    tenant_id    INTEGER      NOT NULL REFERENCES tenants(id),
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    status       lease_status NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leases_property_id ON leases(property_id);
CREATE INDEX idx_leases_tenant_id   ON leases(tenant_id);
CREATE INDEX idx_leases_status      ON leases(status);

-- ============================================================
-- Maintenance Requests
-- ============================================================

CREATE TABLE maintenance_requests (
    id          SERIAL PRIMARY KEY,
    property_id INTEGER              NOT NULL REFERENCES properties(id),
    tenant_id   INTEGER              NOT NULL REFERENCES tenants(id),
    vendor_id   INTEGER,
    category    maintenance_category NOT NULL,
    priority    maintenance_priority NOT NULL,
    description TEXT                 NOT NULL,
    status      maintenance_status   NOT NULL DEFAULT 'open',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_requests_tenant_id   ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_requests_status      ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority    ON maintenance_requests(priority);
