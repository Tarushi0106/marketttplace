import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

// Mock data for dashboard
const stats = [
  {
    name: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    name: "Orders",
    value: "2,345",
    change: "+15.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    name: "Products",
    value: "123",
    change: "+4",
    trend: "up",
    icon: Package,
  },
  {
    name: "Customers",
    value: "1,234",
    change: "+10.5%",
    trend: "up",
    icon: Users,
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    total: 299.99,
    status: "PENDING",
    date: new Date(),
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    total: 149.99,
    status: "CONFIRMED",
    date: new Date(Date.now() - 3600000),
  },
  {
    id: "ORD-003",
    customer: "Bob Wilson",
    email: "bob@example.com",
    total: 599.99,
    status: "PROCESSING",
    date: new Date(Date.now() - 7200000),
  },
  {
    id: "ORD-004",
    customer: "Alice Brown",
    email: "alice@example.com",
    total: 89.99,
    status: "DELIVERED",
    date: new Date(Date.now() - 86400000),
  },
  {
    id: "ORD-005",
    customer: "Charlie Davis",
    email: "charlie@example.com",
    total: 199.99,
    status: "SHIPPED",
    date: new Date(Date.now() - 172800000),
  },
];

const lowStockProducts = [
  { id: "1", name: "Virtual Machine Pro", stock: 3, threshold: 5 },
  { id: "2", name: "Load Balancer Enterprise", stock: 2, threshold: 5 },
  { id: "3", name: "SSL Certificate Premium", stock: 4, threshold: 5 },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning",
  CONFIRMED: "bg-info/20 text-info",
  PROCESSING: "bg-primary/20 text-primary",
  SHIPPED: "bg-primary/20 text-primary",
  DELIVERED: "bg-success/20 text-success",
  CANCELLED: "bg-destructive/20 text-destructive",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your store</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {order.id}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.date)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status]}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/10"
                >
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.stock} left (threshold: {product.threshold})
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
            {lowStockProducts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All products are well stocked!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/products/new">Add Product</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/bundles/new">Create Bundle</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/categories/new">Add Category</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/discounts/new">Create Discount</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/pages/new">Add Page</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
