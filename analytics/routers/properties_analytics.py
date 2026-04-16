"""Property analytics endpoints for the UrbanNest Analytics Service.

Domain references
-----------------
- Property types: apartment, house, condo, townhouse
- Availability flag: ``is_available`` (boolean)
- Scopes: ``available`` (is_available = true), ``in_city(city)``

See specs/architecture/system-overview.md §2 – Property model.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from analytics.database import get_db
from analytics.models.schemas import (
    AverageRentByCity,
    PropertyAnalyticsSummary,
    PropertyTypeDistribution,
    VacancyRateByCity,
)

router = APIRouter(prefix="/analytics/properties", tags=["Property Analytics"])


@router.get(
    "/average-rent",
    response_model=list[AverageRentByCity],
    summary="Average rent by city",
    description=(
        "Returns the average monthly rent and property count grouped by city. "
        "Only includes cities that have at least one property."
    ),
)
async def average_rent_by_city(db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT city,
               ROUND(AVG(monthly_rent)::numeric, 2) AS average_rent,
               COUNT(*)::int                         AS property_count
        FROM properties
        GROUP BY city
        ORDER BY average_rent DESC
    """)
    result = await db.execute(query)
    return [
        AverageRentByCity(city=row.city, average_rent=float(row.average_rent), property_count=row.property_count)
        for row in result.fetchall()
    ]


@router.get(
    "/vacancy-rates",
    response_model=list[VacancyRateByCity],
    summary="Vacancy rates by city",
    description=(
        "Returns the vacancy rate for each city. A property is considered "
        "vacant when ``is_available`` is true (no active tenant)."
    ),
)
async def vacancy_rates(db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT city,
               COUNT(*)::int                                       AS total_properties,
               COUNT(*) FILTER (WHERE is_available = true)::int    AS vacant_properties,
               ROUND(
                   COUNT(*) FILTER (WHERE is_available = true)::numeric / NULLIF(COUNT(*), 0),
                   4
               )                                                   AS vacancy_rate
        FROM properties
        GROUP BY city
        ORDER BY vacancy_rate DESC
    """)
    result = await db.execute(query)
    return [
        VacancyRateByCity(
            city=row.city,
            total_properties=row.total_properties,
            vacant_properties=row.vacant_properties,
            vacancy_rate=float(row.vacancy_rate or 0),
        )
        for row in result.fetchall()
    ]


@router.get(
    "/type-distribution",
    response_model=list[PropertyTypeDistribution],
    summary="Property type distribution",
    description=(
        "Returns the count and percentage of properties for each property type "
        "(apartment, house, condo, townhouse)."
    ),
)
async def property_type_distribution(db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT property_type,
               COUNT(*)::int AS count,
               ROUND(
                   COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100,
                   2
               )             AS percentage
        FROM properties
        GROUP BY property_type
        ORDER BY count DESC
    """)
    result = await db.execute(query)
    return [
        PropertyTypeDistribution(
            property_type=row.property_type,
            count=row.count,
            percentage=float(row.percentage or 0),
        )
        for row in result.fetchall()
    ]


@router.get(
    "/summary",
    response_model=PropertyAnalyticsSummary,
    summary="Property analytics overview",
    description="Aggregated property analytics: average rent, vacancy rates, and type distribution.",
)
async def property_summary(db: AsyncSession = Depends(get_db)):
    total_query = text("SELECT COUNT(*)::int AS total FROM properties")
    total_result = await db.execute(total_query)
    total_properties = total_result.scalar_one()

    rent_data = await average_rent_by_city(db)
    vacancy_data = await vacancy_rates(db)
    type_data = await property_type_distribution(db)

    return PropertyAnalyticsSummary(
        total_properties=total_properties,
        average_rent_by_city=rent_data,
        vacancy_rates=vacancy_data,
        property_type_distribution=type_data,
    )
