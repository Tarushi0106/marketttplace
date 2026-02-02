"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

// Mock categories - in production, fetch from API
const categories = [
  {
    id: "1",
    name: "Cloud Services",
    slug: "cloud-services",
    subCategories: [
      { id: "1-1", name: "Virtual Machines", slug: "virtual-machines" },
      { id: "1-2", name: "Storage Solutions", slug: "storage-solutions" },
      { id: "1-3", name: "Kubernetes", slug: "kubernetes" },
      { id: "1-4", name: "Serverless", slug: "serverless" },
    ],
  },
  {
    id: "2",
    name: "Network Solutions",
    slug: "network-solutions",
    subCategories: [
      { id: "2-1", name: "Load Balancers", slug: "load-balancers" },
      { id: "2-2", name: "CDN", slug: "cdn" },
      { id: "2-3", name: "VPN", slug: "vpn" },
      { id: "2-4", name: "DNS Services", slug: "dns-services" },
    ],
  },
  {
    id: "3",
    name: "Security",
    slug: "security",
    subCategories: [
      { id: "3-1", name: "Firewall", slug: "firewall" },
      { id: "3-2", name: "DDoS Protection", slug: "ddos-protection" },
      { id: "3-3", name: "SSL Certificates", slug: "ssl-certificates" },
      { id: "3-4", name: "Identity Management", slug: "identity-management" },
    ],
  },
  {
    id: "4",
    name: "Databases",
    slug: "databases",
    subCategories: [
      { id: "4-1", name: "Relational", slug: "relational" },
      { id: "4-2", name: "NoSQL", slug: "nosql" },
      { id: "4-3", name: "In-Memory", slug: "in-memory" },
      { id: "4-4", name: "Data Warehousing", slug: "data-warehousing" },
    ],
  },
  {
    id: "5",
    name: "DevOps Tools",
    slug: "devops-tools",
    subCategories: [
      { id: "5-1", name: "CI/CD", slug: "ci-cd" },
      { id: "5-2", name: "Monitoring", slug: "monitoring" },
      { id: "5-3", name: "Logging", slug: "logging" },
      { id: "5-4", name: "Container Registry", slug: "container-registry" },
    ],
  },
];

interface CategoryNavProps {
  mobile?: boolean;
}

export function CategoryNav({ mobile = false }: CategoryNavProps) {
  const { setMobileMenuOpen } = useUIStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (mobile) {
    return (
      <nav className="space-y-1">
        <Link
          href="/products"
          className="block py-2 text-sm font-medium"
          onClick={() => setMobileMenuOpen(false)}
        >
          All Products
        </Link>
        <Link
          href="/bundles"
          className="block py-2 text-sm font-medium"
          onClick={() => setMobileMenuOpen(false)}
        >
          Bundles
        </Link>
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category.id ? null : category.id
                )
              }
              className="flex w-full items-center justify-between py-2 text-sm font-medium"
            >
              {category.name}
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedCategory === category.id && "rotate-90"
                )}
              />
            </button>
            {expandedCategory === category.id && (
              <div className="ml-4 space-y-1 border-l border-border pl-4">
                <Link
                  href={`/categories/${category.slug}`}
                  className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View All
                </Link>
                {category.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/categories/${category.slug}/${sub.slug}`}
                    className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/products" legacyBehavior passHref>
            <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
              All Products
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/bundles" legacyBehavior passHref>
            <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-surface hover:text-primary focus:bg-surface focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
              Bundles
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {categories.map((category) => (
          <NavigationMenuItem key={category.id}>
            <NavigationMenuTrigger className="bg-transparent">
              {category.name}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                <div className="col-span-full">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="block rounded-md p-3 hover:bg-surface transition-colors"
                  >
                    <div className="text-sm font-medium">
                      All {category.name}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Browse all products in {category.name}
                    </p>
                  </Link>
                </div>
                {category.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/categories/${category.slug}/${sub.slug}`}
                    className="block rounded-md p-3 hover:bg-surface transition-colors"
                  >
                    <div className="text-sm font-medium">{sub.name}</div>
                  </Link>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
