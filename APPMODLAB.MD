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
