"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  LayoutGrid,
  Phone,
  Mail,
  Headphones,
  Package,
  Shield,
  LogOut,
  Settings,
  Cloud,
  Globe,
  Lock,
  Database,
  Wrench,
  Wifi,
  Box,
  ChevronRight,
  Sparkles,
  Server,
  Monitor,
  Brain,
  Share2,
  Folder,
  LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// Wishlist badge component to show item count
function WishlistBadgeInner() {
  const items = useWishlistStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return items.length > 0 ? (
    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-[#4A9FD5] text-[10px] font-bold text-white shadow-sm">
      {items.length > 9 ? "9+" : items.length}
    </span>
  ) : null;
}

// Icon mapping for dynamic categories
const iconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  shield: Shield,
  cloud: Cloud,
  settings: Settings,
  brain: Brain,
  share2: Share2,
  database: Database,
  server: Server,
  monitor: Monitor,
  lock: Lock,
  folder: Folder,
  globe: Globe,
  wrench: Wrench,
  box: Box,
};

const getIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return Folder;
  return iconMap[iconName.toLowerCase()] || Folder;
};

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  subCategories?: SubCategory[];
  _count?: { products: number };
}

interface MenuItem {
  id: string;
  label: string;
  href: string | null;
  icon: string | null;
  badge: string | null;
  badgeColor: string | null;
  target: string;
  isActive: boolean;
  children?: MenuItem[];
}

// Fallback nav links if no menu is configured
const defaultNavLinks = [
  { label: "Plans", href: "/products", badge: null, icon: "layout-grid" },
  { label: "Applications", href: "/products?category=applications", badge: null, icon: "box" },
  { label: "Why DeWiN", href: "/about", badge: null, icon: "brain" },
  { label: "Comparison", href: "/comparison", badge: null, icon: "share2" },
  { label: "Industries We Serve", href: "/industries", badge: null, icon: "globe" },
  { label: "About Us", href: "/about-us", badge: null, icon: "folder" },
  { label: "Support", href: "/contact", badge: null, icon: "mail" },
];

export function Header() {
  const { data: session } = useSession();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const settings = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [navLinks, setNavLinks] = useState<MenuItem[]>([]);

  // Update item count when cart changes - use a callback to get current state
  // Using the hook directly with selector for proper reactivity
  const items = useCartStore((state) => state.items);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const syncSidebarFromCart = useCartStore((state) => state.syncSidebarFromCart);
  const [mounted, setMounted] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [items, mounted]);

  // Fetch products and nav menu dynamically
  useEffect(() => {
    async function fetchCategories() {
      const sidebarSlugs = [
        "ai-video-surveillance",
        "ai-voice-automation",
        "ai-talent-intelligence",
      ];
      try {
        const response = await fetch("/api/categories?includeSubCategories=true");
        const data = await response.json();
        if (data.data) {
          const filtered = (data.data as Category[]).filter((c) =>
            sidebarSlugs.includes(c.slug)
          );
          // Sort to match sidebar order
          filtered.sort(
            (a, b) => sidebarSlugs.indexOf(a.slug) - sidebarSlugs.indexOf(b.slug)
          );
          setCategories(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    }

    async function fetchNavMenu() {
      try {
        const response = await fetch("/api/menus?location=header_main");
        const data = await response.json();
        if (data.data?.items && data.data.items.length > 0) {
          setNavLinks(data.data.items);
        } else {
          // Use defaults if no menu configured
          setNavLinks(defaultNavLinks as MenuItem[]);
        }
      } catch (error) {
        console.error("Failed to fetch nav menu:", error);
        setNavLinks(defaultNavLinks as MenuItem[]);
      }
    }

    fetchCategories();
    fetchNavMenu();
  }, []);

  const DefaultLogo = () => (
    <img
      src="/dewin-logo.jpeg"
      alt="Dewin – DeWiN Solutions Private Limited"
      className="h-[70px] w-auto object-contain"
    />
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-[84px] items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
              <img
                src="/dewin-logo.jpeg"
                alt="Dewin – DeWiN Solutions Private Limited"
                className="h-[70px] w-auto object-contain"
              />
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E2260]/20 focus:bg-gray-50 transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Account */}
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group" suppressHydrationWarning>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E2260] to-[#141740] flex items-center justify-center text-white text-sm font-semibold shadow-sm" suppressHydrationWarning>
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      </div>
                      <div className="hidden lg:block text-left" suppressHydrationWarning>
                        <p className="text-[11px] text-gray-500 font-medium" suppressHydrationWarning>Welcome back</p>
                        <p className="text-sm font-semibold text-gray-900" suppressHydrationWarning>{session.user.name?.split(' ')[0] || 'User'}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block group-hover:text-gray-600 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-xl border-gray-200">
                    <div className="px-3 py-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg mb-1" suppressHydrationWarning>
                      <p className="text-sm font-semibold text-gray-900" suppressHydrationWarning>{session.user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5" suppressHydrationWarning>{session.user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer rounded-lg py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <LayoutGrid className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="flex items-center gap-3 cursor-pointer rounded-lg py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <Package className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium">My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-3 cursor-pointer rounded-lg py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Settings className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="font-medium">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                      <>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-3 cursor-pointer rounded-lg py-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#1E2260]/10 flex items-center justify-center">
                              <Shield className="h-4 w-4 text-[#1E2260]" />
                            </div>
                            <span className="font-medium text-[#1E2260]">Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout" className="flex items-center gap-3 cursor-pointer rounded-lg py-2.5 text-[#1E2260] hover:bg-[#EEF2FF]">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors" suppressHydrationWarning>
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="hidden lg:block text-left" suppressHydrationWarning>
                    <p className="text-[11px] text-gray-500 font-medium">Hello, Sign in</p>
                    <p className="text-sm font-semibold text-gray-900">Account</p>
                  </div>
                </Link>
              )}

              {/* Divider */}
              <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1" />

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-[#1E2260]/5 transition-all duration-200 group"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-[#1E2260] transition-colors" />
                  {mounted && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-[#1E2260] text-[10px] font-bold text-white shadow-sm">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-1 group-hover:text-[#1E2260] transition-colors">Cart</span>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-[#1E2260]/5 transition-all duration-200 group"
              >
                <div className="relative">
                  <Heart className="h-5 w-5 text-gray-600 group-hover:text-[#1E2260] transition-colors" />
                  <WishlistBadgeInner />
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-1 group-hover:text-[#1E2260] transition-colors">Wishlist</span>
              </Link>

              {/* Mobile menu button */}
              <button
                className="lg:hidden ml-1 w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - With Categories */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            {/* Categories dropdown */}
            <div className="hidden xl:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E2260] hover:bg-gray-50 rounded-lg transition-colors">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Categories</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 p-2 rounded-xl shadow-xl border-gray-200">
                  {categoriesLoading ? (
                    <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">No categories</div>
                  ) : (
                    categories.map((cat) => {
                      const catToProduct: Record<string, string> = {
                        "ai-video-surveillance": "/products/vsaas",
                        "ai-voice-automation": "/products/deco-voice",
                        "ai-talent-intelligence": "/products/deco-talent",
                      };
                      const href = catToProduct[cat.slug] || `/products?category=${cat.slug}`;
                      return (
                      <div key={cat.id}>
                        <DropdownMenuItem asChild>
                          <Link
                            href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#1E2260]/10 flex items-center justify-center flex-shrink-0">
                              {React.createElement(getIconComponent(cat.icon ?? null), {
                                className: "h-3.5 w-3.5 text-[#1E2260]",
                              })}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                            {cat._count && cat._count.products > 0 && (
                              <span className="ml-auto text-xs text-gray-400">({cat._count.products})</span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        {cat.subCategories && cat.subCategories.length > 0 && (
                          <div className="ml-4 pl-3 border-l border-gray-100 mb-1">
                            {cat.subCategories.map((sub) => (
                              <DropdownMenuItem key={sub.id} asChild>
                                <Link
                                  href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{sub.name}</span>
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        )}
                      </div>
                    )})
                  )}
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/products" className="justify-center text-[#1E2260] font-medium text-sm">
                      View All Products
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Navigation Links - Simplified */}
            <nav className="hidden xl:flex items-center gap-1">
              {/* Only keep Support link since Categories dropdown is already present */}
            </nav>

            {/* Right side - Support */}
            <div className="flex items-center gap-6">
              <Link href="/contact" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E2260] transition-colors duration-200">
                <Headphones className="h-4 w-4" />
                <span>Support</span>
              </Link>
              <a href="tel:+918698080000" className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1E2260] transition-colors duration-200">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+91 86980 80000</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[118px] bottom-0 z-50 bg-white lg:hidden transition-all duration-300 overflow-auto",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-5">
          {/* Mobile Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#1E2260] focus:ring-2 focus:ring-[#1E2260]/10"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
            {categoriesLoading ? (
              <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">No categories</div>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const catToProduct: Record<string, string> = {
                    "ai-video-surveillance": "/products/vsaas",
                    "ai-voice-automation": "/products/deco-voice",
                    "ai-talent-intelligence": "/products/deco-talent",
                  };
                  const mobileHref = catToProduct[cat.slug] || `/products?category=${cat.slug}`;
                  return (
                  <div key={cat.id}>
                    <Link
                      href={mobileHref}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        {React.createElement(getIconComponent(cat.icon ?? null), {
                          className: "h-4 w-4 text-[#1E2260]",
                        })}
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </Link>
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <div className="ml-4 pl-3 border-l border-gray-200 mt-1 space-y-1">
                        {cat.subCategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 mt-3 py-2.5 text-sm font-medium text-[#1E2260] hover:bg-gray-50 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              View All Products
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Links</p>
            <nav className="bg-gray-50 rounded-xl overflow-hidden">
              {navLinks.map((link, index) => (
                <Link
                  key={link.id || index}
                  href={link.href || "#"}
                  target={link.target === "_blank" ? "_blank" : undefined}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
                    index !== navLinks.length - 1 && "border-b border-gray-100"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className="px-2 py-0.5 text-white text-[10px] font-bold rounded uppercase"
                      style={{ backgroundColor: link.badgeColor || "#1E2260" }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account */}
          <div className="pt-5 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Account</p>
            <div className="space-y-2">
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5 text-gray-400" />
                Wishlist
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutGrid className="h-5 w-5 text-gray-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-3 px-4 py-3 bg-[#EEF2FF] rounded-xl text-sm font-medium text-[#1E2260] hover:bg-[#E8F0FF] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-[#1E2260] rounded-xl text-sm font-semibold text-white hover:bg-[#161848] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-6 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Need Help?</p>
            <div className="flex flex-col gap-3 text-sm">
              <a href="tel:+919876543210" className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                +91 98765 43210
              </a>
              <a href="mailto:info@dewin.com" className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                info@dewin.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
