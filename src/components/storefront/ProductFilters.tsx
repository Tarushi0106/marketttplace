"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/store/ui-store";
import { formatCurrency, cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProductFiltersProps {
  categories?: FilterOption[];
  productTypes?: FilterOption[];
  minPrice?: number;
  maxPrice?: number;
  totalProducts?: number;
}

export function ProductFilters({
  categories = [],
  productTypes = [
    { value: "STANDALONE", label: "Standalone", count: 45 },
    { value: "WITH_ADDONS", label: "With Add-ons", count: 23 },
    { value: "CONFIGURABLE", label: "Configurable", count: 18 },
  ],
  minPrice = 0,
  maxPrice = 1000,
  totalProducts = 0,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isFiltersOpen, setFiltersOpen } = useUIStore();

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || minPrice,
    Number(searchParams.get("maxPrice")) || maxPrice,
  ]);

  const selectedCategories = searchParams.getAll("category");
  const selectedTypes = searchParams.getAll("type");
  const sortBy = searchParams.get("sortBy") || "popularity";

  const updateFilters = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.delete(key);
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }

    params.set("page", "1"); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const current = searchParams.getAll(key);
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters(key, newValues.length > 0 ? newValues : null);
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
    setPriceRange([minPrice, maxPrice]);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedTypes.length +
    (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort - Mobile only */}
      <div className="lg:hidden">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select value={sortBy} onValueChange={(v) => updateFilters("sortBy", v)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "type", "price"]}>
        {/* Categories */}
        {categories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.value} className="flex items-center">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={selectedCategories.includes(category.value)}
                      onCheckedChange={() =>
                        toggleArrayFilter("category", category.value)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.value}`}
                      className="ml-2 flex-1 text-sm cursor-pointer"
                    >
                      {category.label}
                    </Label>
                    {category.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        ({category.count})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Product Type */}
        <AccordionItem value="type">
          <AccordionTrigger>Product Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {productTypes.map((type) => (
                <div key={type.value} className="flex items-center">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={selectedTypes.includes(type.value)}
                    onCheckedChange={() => toggleArrayFilter("type", type.value)}
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className="ml-2 flex-1 text-sm cursor-pointer"
                  >
                    {type.label}
                  </Label>
                  {type.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({type.count})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={minPrice}
                max={maxPrice}
                step={10}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                onValueCommit={(value) => {
                  updateFilters("minPrice", String(value[0]));
                  updateFilters("maxPrice", String(value[1]));
                }}
              />
              <div className="flex items-center justify-between text-sm">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Checkbox
                  id="in-stock"
                  checked={searchParams.get("inStock") === "true"}
                  onCheckedChange={(checked) =>
                    updateFilters("inStock", checked ? "true" : null)
                  }
                />
                <Label htmlFor="in-stock" className="ml-2 text-sm cursor-pointer">
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="featured"
                  checked={searchParams.get("featured") === "true"}
                  onCheckedChange={(checked) =>
                    updateFilters("featured", checked ? "true" : null)
                  }
                />
                <Label htmlFor="featured" className="ml-2 text-sm cursor-pointer">
                  Featured Products
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile filter button */}
      <Button
        variant="outline"
        className="lg:hidden"
        onClick={() => setFiltersOpen(true)}
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Mobile filter drawer */}
      {isFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background shadow-modal lg:hidden">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>
              <div className="border-t border-border p-4">
                <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                  Show {totalProducts} Products
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function ProductSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sortBy") || "popularity";

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={sortBy} onValueChange={updateSort}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popularity">Popularity</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="rating">Highest Rated</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
      </SelectContent>
    </Select>
  );
}
