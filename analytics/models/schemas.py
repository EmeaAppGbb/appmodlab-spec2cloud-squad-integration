"""Pydantic response models for the UrbanNest Analytics Service.

All schemas align with the domain models and business rules defined in
specs/architecture/system-overview.md and specs/business-rules/.
"""

from __future__ import annotations

import enum
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared enums (mirror the legacy domain constraints)
# ---------------------------------------------------------------------------

class PropertyType(str, enum.Enum):
    apartment = "apartment"
    house = "house"
    condo = "condo"
    townhouse = "townhouse"


class LeaseStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    terminated = "terminated"


class MaintenanceCategory(str, enum.Enum):
    plumbing = "plumbing"
    electrical = "electrical"
    hvac = "hvac"
    appliance = "appliance"
    other = "other"


class MaintenancePriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    emergency = "emergency"


class MaintenanceStatus(str, enum.Enum):
    open = "open"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    closed = "closed"


# ---------------------------------------------------------------------------
# Property Analytics
# ---------------------------------------------------------------------------

class AverageRentByCity(BaseModel):
    """Average monthly rent aggregated by city."""
    city: str = Field(..., description="City name")
    average_rent: float = Field(..., description="Average monthly rent in USD")
    property_count: int = Field(..., ge=0, description="Number of properties in the city")


class VacancyRateByCity(BaseModel):
    """Vacancy rate for properties in a city."""
    city: str = Field(..., description="City name")
    total_properties: int = Field(..., ge=0)
    vacant_properties: int = Field(..., ge=0)
    vacancy_rate: float = Field(
        ..., ge=0.0, le=1.0,
        description="Fraction of properties that are vacant (0.0–1.0)",
    )


class PropertyTypeDistribution(BaseModel):
    """Count and percentage for a single property type."""
    property_type: PropertyType
    count: int = Field(..., ge=0)
    percentage: float = Field(
        ..., ge=0.0, le=100.0,
        description="Percentage of total properties",
    )


class PropertyAnalyticsSummary(BaseModel):
    """Top-level wrapper returned by the property analytics overview."""
    total_properties: int = Field(..., ge=0)
    average_rent_by_city: list[AverageRentByCity]
    vacancy_rates: list[VacancyRateByCity]
    property_type_distribution: list[PropertyTypeDistribution]


# ---------------------------------------------------------------------------
# Lease Analytics
# ---------------------------------------------------------------------------

class OccupancyRate(BaseModel):
    """Occupancy rate across all properties."""
    total_properties: int = Field(..., ge=0)
    occupied_properties: int = Field(..., ge=0)
    occupancy_rate: float = Field(
        ..., ge=0.0, le=1.0,
        description="Fraction of properties with an active lease (0.0–1.0)",
    )


class ExpiringLeaseSummary(BaseModel):
    """Summary of a single lease that is expiring within 60 days."""
    lease_id: int
    property_address: str
    city: str
    tenant_name: str
    monthly_rent: float
    start_date: date
    end_date: date
    is_renewable: bool = Field(
        ..., description="True if end_date > now + 30 days AND status is active",
    )


class ExpiringLeasesReport(BaseModel):
    """Collection of leases expiring within the 60-day window."""
    window_days: int = Field(default=60, description="Look-ahead window in days")
    total_expiring: int = Field(..., ge=0)
    renewable_count: int = Field(..., ge=0)
    non_renewable_count: int = Field(..., ge=0)
    leases: list[ExpiringLeaseSummary]


class MonthlyRevenueForecast(BaseModel):
    """Projected rental revenue for a single calendar month.

    Revenue calculation follows the legacy rule:
      months = ceil((end_date − start_date) / 30)
      total_cost = monthly_rent × months
    """
    month: str = Field(..., description="YYYY-MM format")
    projected_revenue: float = Field(..., description="Sum of monthly_rent for active leases in this month")
    active_lease_count: int = Field(..., ge=0)


class RevenueForecastReport(BaseModel):
    """Revenue forecast over a configurable horizon."""
    forecast_months: int = Field(..., ge=1, description="Number of months forecasted")
    total_projected_revenue: float
    monthly_forecasts: list[MonthlyRevenueForecast]


class LeaseAnalyticsSummary(BaseModel):
    """Top-level wrapper for lease analytics."""
    occupancy: OccupancyRate
    expiring_leases: ExpiringLeasesReport
    revenue_forecast: RevenueForecastReport


# ---------------------------------------------------------------------------
# Maintenance Analytics
# ---------------------------------------------------------------------------

class CategoryCount(BaseModel):
    """Maintenance request count for a single category."""
    category: MaintenanceCategory
    count: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0.0, le=100.0)


class PriorityCount(BaseModel):
    """Maintenance request count for a single priority level."""
    priority: MaintenancePriority
    count: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0.0, le=100.0)


class AverageResolutionTime(BaseModel):
    """Average time (in hours) from request creation to completion/closure."""
    overall_avg_hours: float = Field(..., description="Overall average resolution time in hours")
    by_priority: dict[str, Optional[float]] = Field(
        ...,
        description="Average resolution hours keyed by priority level; null if no data",
    )
    by_category: dict[str, Optional[float]] = Field(
        ...,
        description="Average resolution hours keyed by category; null if no data",
    )


class OpenRequestStats(BaseModel):
    """Statistics about currently open maintenance requests."""
    total_open: int = Field(..., ge=0)
    high_priority_open: int = Field(
        ..., ge=0,
        description="Open requests with priority 'high' or 'emergency'",
    )
    by_category: list[CategoryCount]
    by_priority: list[PriorityCount]
    oldest_open_days: Optional[float] = Field(
        None,
        description="Age in days of the oldest open request; null if none open",
    )


class MaintenanceAnalyticsSummary(BaseModel):
    """Top-level wrapper for maintenance analytics."""
    total_requests: int = Field(..., ge=0)
    by_category: list[CategoryCount]
    by_priority: list[PriorityCount]
    resolution_time: AverageResolutionTime
    open_requests: OpenRequestStats


# ---------------------------------------------------------------------------
# Generic / health
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(default="healthy")
    service: str = Field(default="urbannest-analytics")
    version: str = Field(default="0.1.0")
    timestamp: datetime
