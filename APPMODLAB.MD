---
title: "Spec2Cloud + SQUAD Integration"
description: "Combine Spec2Cloud specs with SQUAD agentic workflows for UrbanNest property management platform"
authors: ["marconsilva"]
category: "Spec-Driven Development"
industry: "Cross-Industry"
services: ["Azure Container Apps", "Azure Service Bus"]
languages: [".NET", "TypeScript", "Python"]
frameworks: ["NestJS", "FastAPI", "React"]
modernizationTools: ["Spec2Cloud"]
agenticTools: ["SQUAD"]
tags: ["agentic-development", "spec-driven", "openapi", "contract-conformance", "traceability"]
extensions: ["github.copilot"]
thumbnail: ""
video: ""
version: "1.0.0"
screenshots:
  - path: "assets/screenshots/spec2cloud-workflow.html"
    title: "Spec2Cloud × SQUAD 5-Phase Integration Workflow"
    description: "Visual overview of the full spec-driven pipeline: Spec Review → Brain Planning → Hands Implementation → Eyes Validation → Mouth Documentation"
  - path: "assets/screenshots/docker-compose.html"
    title: "Docker Compose — Dev Infrastructure"
    description: "PostgreSQL 16 and Redis 7 services for local UrbanNest development"
  - path: "assets/screenshots/legacy-gemfile.html"
    title: "Legacy Gemfile — Rails 5.2 Dependencies"
    description: "Ruby on Rails 5.2 dependency manifest including Stripe, SendGrid, Sidekiq"
  - path: "assets/screenshots/legacy-routes.html"
    title: "Legacy Routes — API Endpoint Map"
    description: "Rails routes defining properties, tenants, leases, and maintenance request endpoints"
  - path: "assets/screenshots/properties-controller.html"
    title: "PropertiesController — Legacy CRUD API"
    description: "Full REST controller with index/show/create/update/destroy actions and strong params"
  - path: "assets/screenshots/domain-models.html"
    title: "Domain Models — Property, Lease, Tenant, MaintenanceRequest"
    description: "All four ActiveRecord models with validations, scopes, associations, and business logic"
---


# Spec2Cloud × SQUAD Integration

## Overview

This lab combines Spec2Cloud specifications with SQUAD agentic workflows to modernize the UrbanNest property management platform from Rails 5.2 to a modern polyglot architecture.

### Integration Workflow

The Spec2Cloud × SQUAD integration follows a 5-phase pipeline from specification review through documentation.

> 📸 [View: Spec2Cloud × SQUAD 5-Phase Integration Workflow](assets/screenshots/spec2cloud-workflow.html)
> *Open the HTML file in a browser to view the syntax-highlighted rendering.*

This workflow drives the entire modernization: Spec Review → Brain Planning → Hands Implementation → Eyes Validation → Mouth Documentation.

## Legacy Application

### Dependencies (Rails 5.2)

The legacy UrbanNest platform is built on Ruby on Rails 5.2 with dependencies including Stripe, SendGrid, and Sidekiq.

> 📸 [View: Legacy Gemfile — Rails 5.2 Dependencies](assets/screenshots/legacy-gemfile.html)
> *Open the HTML file in a browser to view the syntax-highlighted rendering.*

### API Routes

The legacy application defines REST endpoints for properties, tenants, leases, and maintenance requests.

> 📸 [View: Legacy Routes — API Endpoint Map](assets/screenshots/legacy-routes.html)
> *Open the HTML file in a browser to view the syntax-highlighted rendering.*

### Properties Controller

The PropertiesController implements full CRUD operations with strong parameters for the Properties resource.

> 📸 [View: PropertiesController — Legacy CRUD API](assets/screenshots/properties-controller.html)
> *Open the HTML file in a browser to view the syntax-highlighted rendering.*

### Domain Models

The four core ActiveRecord models — Property, Lease, Tenant, and MaintenanceRequest — include validations, scopes, associations, and business logic.

> 📸 [View: Domain Models — Property, Lease, Tenant, MaintenanceRequest](assets/screenshots/domain-models.html)
> *Open the HTML file in a browser to view the syntax-highlighted rendering.*

## Development Infrastructure

Local development uses Docker Compose with PostgreSQL 16 and Redis 7 services.

> 📸 [View: Docker Compose — Dev Infrastructure](assets/screenshots/docker-compose.html)
> *Open the HTML file in a browser to view the syntax-highlighted rendering.*

## Screenshots

The `assets/screenshots/` directory contains syntax-highlighted HTML renderings of key files. Open any `.html` file in a browser to view or capture a screenshot.

| # | File | What it shows |
|---|------|---------------|
| 1 | [`spec2cloud-workflow.html`](assets/screenshots/spec2cloud-workflow.html) | Spec2Cloud × SQUAD 5-Phase Integration Workflow |
| 2 | [`docker-compose.html`](assets/screenshots/docker-compose.html) | Docker Compose — Dev Infrastructure |
| 3 | [`legacy-gemfile.html`](assets/screenshots/legacy-gemfile.html) | Legacy Gemfile — Rails 5.2 Dependencies |
| 4 | [`legacy-routes.html`](assets/screenshots/legacy-routes.html) | Legacy Routes — API Endpoint Map |
| 5 | [`properties-controller.html`](assets/screenshots/properties-controller.html) | PropertiesController — Legacy CRUD API |
| 6 | [`domain-models.html`](assets/screenshots/domain-models.html) | Domain Models — Property, Lease, Tenant, MaintenanceRequest |

## Solution Walkthrough

The solution branch (`solution-final`) demonstrates the full Spec2Cloud × SQUAD integration pipeline across 9 steps. Each step is tagged for easy checkout.

### CLI Commands Used

#### Step 01: Review Specifications (Spec2Cloud)
```bash
gh copilot -- -p "Analyze the legacy Ruby on Rails 5.2 property management application in the legacy/ directory..." --allow-all-tools --yolo
```
**Output:** `specs/architecture/system-overview.md` — comprehensive architecture analysis of the Rails 5.2 monolith including domain models, API endpoints, business rules, and integration points.

#### Step 02: Configure SQUAD (Squad CLI)
```bash
npx @bradygaster/squad-cli init --roles
```
**Output:** `.squad/` workspace with scribe and ralph agents, ceremonies, routing, skills, and CI workflows.

#### Step 03: Brain Planning (Squad CLI)
```bash
npx @bradygaster/squad-cli roles
npx @bradygaster/squad-cli hire lead backend frontend tester devops docs
```
**Output:** Listed 20 available roles and hired a team of 6 specialists for the modernization effort.

#### Step 04: Implement APIs (Spec2Cloud)
```bash
gh copilot -- -p "Generate a NestJS TypeScript API for the UrbanNest property management platform..." --allow-all-tools --yolo
```
**Output:** `api/` — NestJS TypeScript API with 4 domain modules (properties, tenants, leases, maintenance), TypeORM entities, DTOs with class-validator, and Swagger/OpenAPI decorators. 22 source files, 1225 lines.

#### Step 05: Implement Business Rules (Spec2Cloud)
```bash
gh copilot -- -p "Generate detailed business rules specifications..." --allow-all-tools --yolo
```
**Output:** `specs/business-rules/` — 3 specification documents:
- `lease-calculations.md` — cost formulas, renewability, expiry detection
- `maintenance-workflow.md` — lifecycle states, categories, priorities, SLAs
- `tenant-screening.md` — validation rules, email uniqueness, active lease tracking

#### Step 06: Build Analytics Service (Spec2Cloud)
```bash
gh copilot -- -p "Generate a Python FastAPI analytics service..." --allow-all-tools --yolo
```
**Output:** `analytics/` — Python FastAPI service with 3 analytics routers (properties, leases, maintenance), Pydantic schemas, async SQLAlchemy database layer. 854 lines.

#### Step 07: Spec-Based Review (Squad CLI + Spec2Cloud)
```bash
npx @bradygaster/squad-cli status
gh copilot -- -p "Perform a spec-based code review of the UrbanNest implementation..." --allow-all-tools --yolo
```
**Output:** Spec conformance report — **42/47 checks passed**, 5 deviations identified across 5 review areas (domain models, CRUD endpoints, lease business rules, maintenance workflow, analytics).

#### Step 08: Document Deviations (Squad CLI + Spec2Cloud)
```bash
npx @bradygaster/squad-cli doctor
gh copilot -- -p "Create a formal deviation document..." --allow-all-tools --yolo
```
**Output:** `specs/deviations.md` — 5 deviations documented with ID, spec reference, rationale, priority (P1–P3), and estimated effort (S/M).

#### Step 09: Validate Conformance (Spec2Cloud)
```bash
gh copilot -- -p "Generate OpenAPI 3.1 specification files..." --allow-all-tools --yolo
```
**Output:** `specs/api/` — 4 OpenAPI 3.1 YAML files, `specs/data/entity-model.md`, `specs/data/schema.sql`. All schemas validated against TypeORM entities.

### Tags Reference

| Tag | Step | Description |
|-----|------|-------------|
| `step-01-spec-review` | 01 | Spec2Cloud legacy analysis |
| `step-02-configure-squad` | 02 | Squad workspace initialization |
| `step-03-brain-planning` | 03 | Team roles and hiring |
| `step-04-api-implementation` | 04 | NestJS API generation |
| `step-05-business-rules` | 05 | Business rules specifications |
| `step-06-analytics-service` | 06 | Python FastAPI analytics |
| `step-07-spec-review` | 07 | Spec conformance validation |
| `step-08-document-deviations` | 08 | Deviation documentation |
| `step-09-validate-conformance` | 09 | OpenAPI specs and schema |

### Conformance Summary

| Area | Checks | Pass | Deviations |
|------|--------|------|------------|
| Domain Models & Schema | 11 | 11 | 0 |
| CRUD Endpoints | 9 | 8 | 1 |
| Lease Business Rules | 8 | 6 | 2 |
| Maintenance Workflow | 8 | 6 | 2 |
| Analytics Service | 11 | 11 | 0 |
| **Total** | **47** | **42** | **5** |
