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
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
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
  { label: "All Products", href: "/products", badge: null },
  { label: "Bundles", href: "/bundles", badge: "Sale" },
];

export function Header() {
  const { data: session } = useSession();
  const { setIsOpen: setCartOpen, getItemCount } = useCartStore();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const settings = useSiteSettings();
  const itemCount = getItemCount();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [navLinks, setNavLinks] = useState<MenuItem[]>([]);

  // Fetch categories and nav menu dynamically
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories?includeSubCategories=false");
        const data = await response.json();
        if (data.data) {
          setCategories(data.data);
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
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">SH</span>
        <span className="text-2xl font-bold text-[#8B1D1D]">
          <svg viewBox="0 0 24 36" className="w-4 h-7 inline-block -mx-0.5">
            <path
              fill="#8B1D1D"
              d="M12 0L12 8M12 8L6 14M12 8L18 14M12 8L12 28M8 28L16 28M6 14L6 20M18 14L18 20M4 20L8 20M16 20L20 20"
              stroke="#8B1D1D"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="32" r="3" fill="#8B1D1D"/>
          </svg>
        </span>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">URRYA</span>
      </div>
      <span className="text-[#8B1D1D] text-[10px] font-semibold tracking-[0.2em] uppercase">Teleservices</span>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-[70px] items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
              {settings.headerLogo || settings.logoDark || settings.siteLogo ? (
                <Image
                  src={settings.headerLogo || settings.logoDark || settings.siteLogo || ""}
                  alt={settings.name}
                  width={160}
                  height={48}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <DefaultLogo />
              )}
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
                  className="w-full h-10 pl-10 pr-4 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B1D1D]/20 focus:bg-gray-50 transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Account */}
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1D1D] to-[#6B1515] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-[11px] text-gray-500 font-medium">Welcome back</p>
                        <p className="text-sm font-semibold text-gray-900">{session.user.name?.split(' ')[0] || 'User'}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block group-hover:text-gray-600 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-xl border-gray-200">
                    <div className="px-3 py-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg mb-1">
                      <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{session.user.email}</p>
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
                            <div className="w-8 h-8 rounded-lg bg-[#8B1D1D]/10 flex items-center justify-center">
                              <Shield className="h-4 w-4 text-[#8B1D1D]" />
                            </div>
                            <span className="font-medium text-[#8B1D1D]">Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout" className="flex items-center gap-3 cursor-pointer rounded-lg py-2.5 text-red-600 hover:bg-red-50">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
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
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[11px] text-gray-500 font-medium">Hello, Sign in</p>
                    <p className="text-sm font-semibold text-gray-900">Account</p>
                  </div>
                </Link>
              )}

              {/* Divider */}
              <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1" />

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden md:flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="relative">
                  <Heart className="h-5 w-5 text-gray-600 group-hover:text-[#8B1D1D] transition-colors" />
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-1">Wishlist</span>
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-[#8B1D1D]/5 transition-all duration-200 group"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-[#8B1D1D] transition-colors" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-[#8B1D1D] text-[10px] font-bold text-white shadow-sm">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-1 group-hover:text-[#8B1D1D] transition-colors">Cart</span>
              </button>

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

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-12 items-center">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-9 px-4 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:border-[#8B1D1D] hover:text-[#8B1D1D] transition-all duration-200">
                  <LayoutGrid className="h-4 w-4" />
                  <span>All Categories</span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 p-3 rounded-xl shadow-2xl border-0">
                <div className="flex items-center gap-2 px-2 pb-3 mb-2 border-b border-gray-100">
                  <Sparkles className="h-4 w-4 text-[#8B1D1D]" />
                  <p className="text-sm font-semibold text-gray-900">Browse Categories</p>
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {categoriesLoading ? (
                    <div className="py-8 text-center text-sm text-gray-500">Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">No categories found</div>
                  ) : (
                    categories.map((category) => {
                      const IconComponent = getIconComponent(category.icon || null);
                      return (
                        <DropdownMenuItem key={category.id} asChild className="p-0 focus:bg-transparent">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 group transition-all duration-200"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#8B1D1D] flex items-center justify-center transition-all duration-200">
                              <IconComponent className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8B1D1D] transition-colors">{category.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {category.description || `${category._count?.products || 0} products`}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#8B1D1D] group-hover:translate-x-1 transition-all duration-200" />
                          </Link>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href="/categories"
                    className="flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                  >
                    <span>View All Categories</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center h-full ml-6">
              {navLinks.map((link, index) => (
                <Link
                  key={link.id || index}
                  href={link.href || "#"}
                  target={link.target === "_blank" ? "_blank" : undefined}
                  className="relative flex items-center gap-1.5 h-full px-4 text-sm font-medium text-gray-600 hover:text-[#8B1D1D] transition-colors duration-200 group"
                >
                  {link.label}
                  {link.badge && (
                    <span
                      className="px-1.5 py-0.5 text-white text-[10px] font-bold rounded"
                      style={{ backgroundColor: link.badgeColor || "#8B1D1D" }}
                    >
                      {link.badge}
                    </span>
                  )}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#8B1D1D] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden xl:flex items-center ml-auto">
              <Link href="/contact" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#8B1D1D] transition-colors duration-200">
                <Headphones className="h-4 w-4" />
                <span>Support</span>
              </Link>
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
              className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8B1D1D] focus:ring-2 focus:ring-[#8B1D1D]/10"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categoriesLoading ? (
                <div className="col-span-2 py-4 text-center text-sm text-gray-500">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="col-span-2 py-4 text-center text-sm text-gray-500">No categories</div>
              ) : (
                categories.slice(0, 8).map((category) => {
                  const IconComponent = getIconComponent(category.icon || null);
                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-[#8B1D1D]" />
                      </div>
                      <span className="truncate">{category.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
            {categories.length > 8 && (
              <Link
                href="/categories"
                className="flex items-center justify-center gap-2 mt-3 py-2.5 text-sm font-medium text-[#8B1D1D] hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                View All Categories
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
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
                      style={{ backgroundColor: link.badgeColor || "#8B1D1D" }}
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
                    className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-[#8B1D1D] rounded-xl text-sm font-semibold text-white hover:bg-[#7A1919] transition-colors"
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
              <a href="mailto:info@shaurrya.com" className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                info@shaurrya.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
