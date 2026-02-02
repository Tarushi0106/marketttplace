"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Plus,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  ShoppingCart,
  Search,
  Check,
  Package,
  FolderTree,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  basePrice: number;
  images?: { url: string }[];
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

interface DiscountFormData {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  applicableTo: "ALL" | "PRODUCTS" | "CATEGORIES" | "BUNDLES";
  productIds: string[];
  categoryIds: string[];
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

interface DiscountFormProps {
  discountId?: string;
  isEdit?: boolean;
}

export function DiscountForm({ discountId, isEdit = false }: DiscountFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<DiscountFormData>({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: "",
    applicableTo: "ALL",
    productIds: [],
    categoryIds: [],
    isActive: true,
    startsAt: "",
    expiresAt: "",
  });

  const [usageCount, setUsageCount] = useState(0);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEdit && discountId) {
      fetchDiscount();
    }
    fetchProducts();
    fetchCategories();
  }, [isEdit, discountId]);

  async function fetchDiscount() {
    try {
      const response = await fetch(`/api/discounts/${discountId}`);
      const data = await response.json();

      if (data.data) {
        const discount = data.data;
        setFormData({
          code: discount.code || "",
          description: discount.description || "",
          type: discount.type || "PERCENTAGE",
          value: discount.value?.toString() || "",
          minPurchase: discount.minPurchase?.toString() || "",
          maxDiscount: discount.maxDiscount?.toString() || "",
          usageLimit: discount.usageLimit?.toString() || "",
          perUserLimit: discount.perUserLimit?.toString() || "",
          applicableTo: discount.applicableTo || "ALL",
          productIds: discount.productIds || [],
          categoryIds: discount.categoryIds || [],
          isActive: discount.isActive ?? true,
          startsAt: discount.startsAt ? discount.startsAt.split("T")[0] : "",
          expiresAt: discount.expiresAt ? discount.expiresAt.split("T")[0] : "",
        });
        setUsageCount(discount.usageCount || 0);
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

  async function fetchProducts() {
    setLoadingData(true);
    try {
      const response = await fetch("/api/products?status=ACTIVE&limit=100");
      const data = await response.json();
      if (data.data) {
        setAvailableProducts(data.data);
        // If editing, populate selected products
        if (isEdit && formData.productIds.length > 0) {
          const selected = data.data.filter((p: Product) =>
            formData.productIds.includes(p.id)
          );
          setSelectedProducts(selected);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingData(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.data) {
        setAvailableCategories(data.data);
        // If editing, populate selected categories
        if (isEdit && formData.categoryIds.length > 0) {
          const selected = data.data.filter((c: Category) =>
            formData.categoryIds.includes(c.id)
          );
          setSelectedCategories(selected);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  }

  function toggleProduct(product: Product) {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
      setFormData({
        ...formData,
        productIds: formData.productIds.filter((id) => id !== product.id),
      });
    } else {
      setSelectedProducts((prev) => [...prev, product]);
      setFormData({
        ...formData,
        productIds: [...formData.productIds, product.id],
      });
    }
  }

  function toggleCategory(category: Category) {
    const isSelected = selectedCategories.some((c) => c.id === category.id);
    if (isSelected) {
      setSelectedCategories((prev) => prev.filter((c) => c.id !== category.id));
      setFormData({
        ...formData,
        categoryIds: formData.categoryIds.filter((id) => id !== category.id),
      });
    } else {
      setSelectedCategories((prev) => [...prev, category]);
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, category.id],
      });
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      const url = isEdit ? `/api/discounts/${discountId}` : "/api/discounts";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} discount`);
      }

      toast({
        title: "Success",
        description: `Discount ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/admin/discounts");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? "update" : "create"} discount`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this discount?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/discounts/${discountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete discount");
      }

      toast({
        title: "Success",
        description: "Discount deleted successfully",
      });

      router.push("/admin/discounts");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete discount",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(formData.code);
    toast({
      title: "Copied",
      description: "Discount code copied to clipboard",
    });
  }

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = availableCategories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Discount" : "New Discount"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? `Code: ${formData.code}` : "Create a new discount code"}
          </p>
        </div>
        {isEdit && (
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        )}
        <Button onClick={() => handleSubmit()} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Discount"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discount Code</CardTitle>
                <CardDescription>
                  The code customers will enter at checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="code">
                      Code <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="SUMMER2024"
                        className="font-mono uppercase"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateCode}>
                        Generate
                      </Button>
                      {formData.code && (
                        <Button type="button" variant="outline" onClick={copyCode}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Internal)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what this discount is for..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Percentage
                          </div>
                        </SelectItem>
                        <SelectItem value="FIXED">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Fixed Amount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {formData.type === "PERCENTAGE" ? "Percentage (%)" : "Amount (₹)"}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      placeholder={formData.type === "PERCENTAGE" ? "10" : "100"}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="No minimum"
                    />
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
                        placeholder="No maximum"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Applies To</CardTitle>
                <CardDescription>
                  Choose which products or categories this discount applies to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select
                    value={formData.applicableTo}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        applicableTo: value as any,
                        productIds: value === "PRODUCTS" ? formData.productIds : [],
                        categoryIds: value === "CATEGORIES" ? formData.categoryIds : [],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          All Products
                        </div>
                      </SelectItem>
                      <SelectItem value="PRODUCTS">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Specific Products
                        </div>
                      </SelectItem>
                      <SelectItem value="CATEGORIES">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4" />
                          Specific Categories
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.applicableTo === "PRODUCTS" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Selected Products ({selectedProducts.length})</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProductPicker(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Products
                      </Button>
                    </div>
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((product) => (
                          <Badge
                            key={product.id}
                            variant="secondary"
                            className="pr-1"
                          >
                            {product.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() => toggleProduct(product)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {formData.applicableTo === "CATEGORIES" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Selected Categories ({selectedCategories.length})</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCategoryPicker(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Categories
                      </Button>
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                          <Badge
                            key={category.id}
                            variant="secondary"
                            className="pr-1"
                          >
                            {category.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() => toggleCategory(category)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Discount can be used
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>

                {isEdit && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Times Used:</span>
                      <span className="font-medium">{usageCount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usage Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many times this code can be used in total
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perUserLimit">Per Customer Limit</Label>
                  <Input
                    id="perUserLimit"
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, perUserLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                  <p className="text-xs text-muted-foreground">
                    How many times each customer can use this code
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Active Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-mono font-bold text-xl mb-1">
                      {formData.code || "CODE"}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formData.type === "PERCENTAGE"
                        ? `${formData.value || 0}% OFF`
                        : `₹${formData.value || 0} OFF`}
                    </p>
                    {formData.minPurchase && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Min. purchase: {formatCurrency(parseFloat(formData.minPurchase))}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Product Picker Dialog */}
      <Dialog open={showProductPicker} onOpenChange={setShowProductPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
            <DialogDescription>
              Choose products this discount applies to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loadingData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No products found
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProducts.some((p) => p.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleProduct(product)}
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.basePrice)}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProductPicker(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Picker Dialog */}
      <Dialog open={showCategoryPicker} onOpenChange={setShowCategoryPicker}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Categories</DialogTitle>
            <DialogDescription>
              Choose categories this discount applies to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCategories.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No categories found
                </p>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = selectedCategories.some(
                    (c) => c.id === category.id
                  );
                  return (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category._count?.products || 0} products
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCategoryPicker(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
