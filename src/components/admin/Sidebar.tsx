"use client";

import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  ShoppingCart,
  Users,
  Image,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  BarChart3,
  Tag,
  Truck,
  TrendingUp,
  MessageSquareQuote,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials } from "@/lib/utils";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Bundles",
    href: "/admin/bundles",
    icon: Layers,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Discounts",
    href: "/admin/discounts",
    icon: Tag,
  },
];

const contentNav = [
  {
    name: "Pages",
    href: "/admin/pages",
    icon: FileText,
  },
  {
    name: "Trending",
    href: "/admin/trending-categories",
    icon: TrendingUp,
  },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquareQuote,
  },
  {
    name: "Company Logos",
    href: "/admin/company-logos",
    icon: Building2,
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: Image,
  },
];

const settingsNav = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const settings = useSiteSettings();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-secondary text-secondary-foreground transition-all duration-300 lg:relative",
          collapsed ? "w-16" : "w-64",
          "lg:translate-x-0",
          collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              {settings.logoLight || settings.siteLogo ? (
                <NextImage
                  src={settings.logoLight || settings.siteLogo || ""}
                  alt={settings.name}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    {settings.name.charAt(0)}
                  </div>
                  <span className="font-semibold">{settings.name.split(" ")[0]} Admin</span>
                </>
              )}
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-6 px-2">
            {/* Main Nav */}
            <div>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Main
                </h3>
              )}
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Nav */}
            <div>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Content
                </h3>
              )}
              <ul className="space-y-1">
                {contentNav.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Settings Nav */}
            <div>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Settings
                </h3>
              )}
              <ul className="space-y-1">
                {settingsNav.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </ScrollArea>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(user.name || "A")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate">{user.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-white/70 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-30 lg:hidden"
        onClick={() => setCollapsed(false)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
