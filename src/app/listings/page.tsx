"use client";

import { useEffect, useMemo, useState } from "react";
import FeatherIcon from "feather-icons-react";
import PropertyCard from "@/components/PropertyCard";
import { getApartmentCities, getProperties } from "@/lib/api";
import { Property } from "@/lib/types";

const propertyTypes = ["all", "house", "apartment", "condo", "townhouse"] as const;

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [apartmentCities, setApartmentCities] = useState<string[]>(["all"]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [apartmentCity, setApartmentCity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "newest">("price-desc");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [propertyData, cityData] = await Promise.all([
          getProperties(),
          getApartmentCities(),
        ]);
        if (!mounted) return;
        setProperties(propertyData);
        setApartmentCities(["all", ...cityData]);
      } catch {
        if (!mounted) return;
        setProperties([]);
        setApartmentCities(["all"]);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.state.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      const matchesApartmentCity =
        apartmentCity === "all" || (p.type === "apartment" && p.city === apartmentCity);
      return matchesSearch && matchesType && matchesApartmentCity;
    });

    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return b.yearBuilt - a.yearBuilt;
    });

    return result;
  }, [properties, search, typeFilter, apartmentCity, sortBy]);

  return (
    <>
      {/* Page Header */}
      <section className="bg-beige-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
            Our Properties
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-accent">
            Browse Homes
          </h1>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-beige-dark/30 bg-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FeatherIcon
                icon="search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search by city, address, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    if (type !== "apartment") {
                      setApartmentCity("all");
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    typeFilter === type
                      ? "bg-accent text-white"
                      : "bg-beige-light text-muted hover:bg-beige-dark"
                  }`}
                >
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 border border-beige-dark/50 text-sm text-muted focus:outline-none focus:border-accent bg-white"
            >
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Apartment by city (demo: 5 cities) */}
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-2">
              Apartments by City
            </p>
            <div className="flex items-center gap-2 overflow-x-auto">
              {apartmentCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setApartmentCity(city);
                    if (city !== "all") {
                      setTypeFilter("apartment");
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    apartmentCity === city
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {city === "all" ? "All Cities" : city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <p className="text-sm text-muted mb-6">Loading homes...</p>
        ) : null}
        <p className="text-sm text-muted mb-6">
          {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FeatherIcon icon="search" size={48} className="text-beige-dark mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-accent mb-2">No properties found</h3>
            <p className="text-sm text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </>
  );
}
