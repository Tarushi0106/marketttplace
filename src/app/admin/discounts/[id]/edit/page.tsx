"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    isActive: true,
    startsAt: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchDiscount();
  }, [id]);

  function formatDateForInput(dateString: string | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  async function fetchDiscount() {
    try {
      const response = await fetch(`/api/discounts/${id}`);
      const data = await response.json();
      if (data.data) {
        const discount = data.data;
        setUsageCount(discount.usageCount || 0);
        setFormData({
          code: discount.code,
          description: discount.description || "",
          type: discount.type,
          value: String(discount.value),
          minPurchase: discount.minPurchase ? String(discount.minPurchase) : "",
          maxDiscount: discount.maxDiscount ? String(discount.maxDiscount) : "",
          usageLimit: discount.usageLimit ? String(discount.usageLimit) : "",
          isActive: discount.isActive,
          startsAt: formatDateForInput(discount.startsAt),
          expiresAt: formatDateForInput(discount.expiresAt),
        });
      }
    } catch (error) {
      console.error("Error fetching discount:", error);
      toast({
        title: "Error",
        description: "Failed to load discount",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.code || !formData.value) {
      toast({
        title: "Validation Error",
        description: "Code and value are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          type: formData.type,
          value: parseFloat(formData.value) || 0,
          minPurchase: formData.minPurchase
            ? parseFloat(formData.minPurchase)
            : null,
          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : null,
          usageLimit: formData.usageLimit
            ? parseInt(formData.usageLimit)
            : null,
          isActive: formData.isActive,
          startsAt: formData.startsAt
            ? new Date(formData.startsAt).toISOString()
            : null,
          expiresAt: formData.expiresAt
            ? new Date(formData.expiresAt).toISOString()
            : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update discount");
      }

      toast({
        title: "Success",
        description: "Discount updated successfully",
      });

      router.push("/admin/discounts");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update discount",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/discounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Discount</h1>
          <p className="text-muted-foreground mt-1">
            Update discount code settings
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Discount Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discount Code</CardTitle>
                <CardDescription>
                  The code customers will enter at checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Discount Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SUMMER20"
                    className="font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe this discount (internal use)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Value</CardTitle>
                <CardDescription>How much to discount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Value {formData.type === "PERCENTAGE" ? "(%)" : "(₹)"} *
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === "PERCENTAGE" ? "1" : "0.01"}
                      max={formData.type === "PERCENTAGE" ? "100" : undefined}
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      placeholder={formData.type === "PERCENTAGE" ? "20" : "500"}
                      required
                    />
                  </div>
                </div>

                {formData.type === "PERCENTAGE" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: e.target.value })
                      }
                      placeholder="1000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cap the maximum discount amount (optional)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restrictions</CardTitle>
                <CardDescription>
                  Set usage limits and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPurchase">Minimum Purchase (₹)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) =>
                        setFormData({ ...formData, minPurchase: e.target.value })
                      }
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum order amount required (optional)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, usageLimit: e.target.value })
                      }
                      placeholder="Unlimited"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of times this code can be used
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Schedule */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only active discounts can be used at checkout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{usageCount}</p>
                  <p className="text-sm text-muted-foreground">Times Used</p>
                  {formData.usageLimit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      of {formData.usageLimit} allowed
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>When the discount is valid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Start Date</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiry Date</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty for no date restrictions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <Tag className="mx-auto h-8 w-8 text-primary mb-2" />
                  <p className="font-mono font-bold text-lg">
                    {formData.code || "CODE"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.type === "PERCENTAGE"
                      ? `${formData.value || "0"}% off`
                      : `₹${formData.value || "0"} off`}
                    {formData.minPurchase &&
                      ` on orders over ₹${formData.minPurchase}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
