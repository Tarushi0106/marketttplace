"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  RefreshCw, 
  Search, 
  MoreHorizontal, 
  Pause, 
  Play, 
  XCircle, 
  Calendar,
  Clock,
  CreditCard,
  User,
  Package,
  Eye,
  Trash2,
  ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for subscription data
interface Subscription {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  billingCycle: string;
  pricePerCycle: number;
  currency: string;
  startDate: Date;
  nextBillingDate: Date;
  lastBillingDate: Date | null;
  preferredTime: string | null;
  preferredDay: number | null;
  status: string;
  autoRenew: boolean;
  paymentMethodId: string | null;
  configuration: any;
  selectedConfigs: any;
  selectedAddons: any;
  totalBilled: number;
  totalSpent: number;
  cancelledAt: Date | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Fetch subscriptions
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: "pause" | "resume" | "cancel") => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/${action}`, {
        method: "POST",
      });
      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = 
      sub.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get upcoming billings
  const upcomingBillings = subscriptions.filter((sub) => {
    const nextBilling = new Date(sub.nextBillingDate);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return sub.status === "ACTIVE" && nextBilling >= now && nextBilling <= sevenDaysFromNow;
  }).sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()).slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-600">Active</Badge>;
      case "PAUSED":
        return <Badge className="bg-yellow-600">Paused</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-[#1E2260]">Suspended</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "PENDING":
        return <Badge className="bg-blue-600">Pending</Badge>;
      case "EXPIRED":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case "MONTHLY":
        return "Monthly";
      case "QUARTERLY":
        return "Quarterly";
      case "YEARLY":
        return "Yearly";
      case "BIENNIAL":
        return "Biennial";
      case "TRIENNIAL":
        return "Triennial";
      default:
        return cycle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recurring Subscriptions</h1>
          <p className="text-gray-500">Manage automatic recurring billing for customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-[#1E2260]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E2260]">{stats.cancelled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by customer, product, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Billings Preview */}
      {upcomingBillings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Automatic Billings (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBillings.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#1E2260]/10 rounded-lg">
                      <span className="text-lg font-bold text-[#1E2260]">
                        {new Date(sub.nextBillingDate).getDate()}
                      </span>
                      <span className="text-xs text-[#1E2260]">
                        {new Date(sub.nextBillingDate).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{sub.product?.name}</div>
                      <div className="text-sm text-gray-500">
                        {sub.user?.name} - {sub.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(Number(sub.pricePerCycle))}</div>
                      <div className="text-sm text-gray-500">
                        {sub.preferredTime && `${sub.preferredTime} • `}
                        Day {sub.preferredDay}
                      </div>
                    </div>
                    <Badge>{getBillingCycleLabel(sub.billingCycle)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subscriptions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Auto-Renew</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{subscription.user?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-500">{subscription.user?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{subscription.product?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-500">ID: {subscription.productId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getBillingCycleLabel(subscription.billingCycle)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(Number(subscription.pricePerCycle))}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: {formatCurrency(Number(subscription.totalSpent))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {new Date(subscription.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.preferredTime || "Anytime"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      {subscription.autoRenew ? (
                        <Badge className="bg-green-100 text-green-700">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {subscription.status === "ACTIVE" && (
                            <>
                              <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, "pause")}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Subscription
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, "cancel")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            </>
                          )}
                          {subscription.status === "PAUSED" && (
                            <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, "resume")}>
                              <Play className="h-4 w-4 mr-2" />
                              Resume Subscription
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-[#1E2260]">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
