"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Package, Layers, Tag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/store/ui-store";
import { debounce, formatCurrency } from "@/lib/utils";

interface SearchResult {
  type: "product" | "bundle" | "category";
  id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  image?: string;
}

// Mock search results - replace with actual API call
const mockSearch = async (query: string): Promise<SearchResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!query.trim()) return [];

  const mockResults: SearchResult[] = [
    {
      type: "product",
      id: "1",
      name: "Virtual Machine Pro",
      slug: "virtual-machine-pro",
      description: "High-performance cloud computing",
      price: 99.99,
    },
    {
      type: "product",
      id: "2",
      name: "Load Balancer Standard",
      slug: "load-balancer-standard",
      description: "Distribute traffic efficiently",
      price: 49.99,
    },
    {
      type: "bundle",
      id: "3",
      name: "Startup Bundle",
      slug: "startup-bundle",
      description: "Everything you need to get started",
      price: 199.99,
    },
    {
      type: "category",
      id: "4",
      name: "Cloud Services",
      slug: "cloud-services",
      description: "Browse all cloud services",
    },
  ];
  return mockResults.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
  );
};

export function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      setIsLoading(true);
      const data = await mockSearch(q);
      setResults(data);
      setIsLoading(false);
    }, 300),
    []
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query, debouncedSearch]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const handleSelect = (result: SearchResult) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);

    switch (result.type) {
      case "product":
        router.push(`/products/${result.slug}`);
        break;
      case "bundle":
        router.push(`/bundles/${result.slug}`);
        break;
      case "category":
        router.push(`/categories/${result.slug}`);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setResults([]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "bundle":
        return <Layers className="h-4 w-4" />;
      case "category":
        return <Tag className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, bundles, categories..."
              className="border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Results */}
        {(results.length > 0 || isLoading) && (
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-surface transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {result.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      {result.price !== undefined && (
                        <span className="font-medium">
                          {formatCurrency(result.price)}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Quick links */}
        {query === "" && (
          <div className="border-t border-border p-4">
            <p className="text-sm text-muted-foreground mb-3">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={() => setSearchOpen(false)}
              >
                <Link href="/products">All Products</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={() => setSearchOpen(false)}
              >
                <Link href="/bundles">Bundles</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                onClick={() => setSearchOpen(false)}
              >
                <Link href="/categories">Categories</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd> to
              search
            </span>
            <span>
              <kbd className="rounded bg-muted px-1.5 py-0.5">Esc</kbd> to close
            </span>
          </div>
          <span>Powered by search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
