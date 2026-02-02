import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Package,
  ShoppingCart,
  Heart,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

// Mock data
const recentOrders = [
  {
    id: "ORD-001",
    total: 299.99,
    status: "PROCESSING",
    date: new Date(),
    items: 3,
  },
  {
    id: "ORD-002",
    total: 149.99,
    status: "DELIVERED",
    date: new Date(Date.now() - 604800000),
    items: 1,
  },
];

const stats = [
  { name: "Total Orders", value: "12", icon: ShoppingCart, href: "/dashboard/orders" },
  { name: "Active Services", value: "5", icon: Package, href: "/dashboard/services" },
  { name: "Wishlist Items", value: "8", icon: Heart, href: "/dashboard/wishlist" },
  { name: "Saved Addresses", value: "2", icon: MapPin, href: "/dashboard/addresses" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning",
  CONFIRMED: "bg-info/20 text-info",
  PROCESSING: "bg-primary/20 text-primary",
  SHIPPED: "bg-primary/20 text-primary",
  DELIVERED: "bg-success/20 text-success",
  CANCELLED: "bg-destructive/20 text-destructive",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-elevated transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface"
                >
                  <div>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {order.id}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.date)} &middot; {order.items} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bundles">View Bundles</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/support">Get Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
