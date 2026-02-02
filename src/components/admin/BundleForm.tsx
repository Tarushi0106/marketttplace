"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Plus,
  Trash2,
  Package,
  Eye,
  Search,
  Check,
  Star,
  Calendar,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images?: { url: string }[];
  category?: { name: string };
}

interface BundleItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  isRequired: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface BundleFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  price: string;
  compareAtPrice: string;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  isCustomizable: boolean;
  minItems: string;
  maxItems: string;
  validFrom: string;
  validUntil: string;
}

interface BundleFormProps {
  bundleId?: string;
  isEdit?: boolean;
}

export function BundleForm({ bundleId, isEdit = false }: BundleFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<BundleFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    image: "",
    price: "",
    compareAtPrice: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    status: "DRAFT",
    isFeatured: false,
    isCustomizable: false,
    minItems: "",
    maxItems: "",
    validFrom: "",
    validUntil: "",
  });

  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isEdit && bundleId) {
      fetchBundle();
    }
    fetchProducts();
  }, [isEdit, bundleId]);

  async function fetchBundle() {
    try {
      const response = await fetch(`/api/bundles/${bundleId}`);
      const data = await response.json();

      if (data.data) {
        const bundle = data.data;
        setFormData({
          name: bundle.name || "",
          slug: bundle.slug || "",
          description: bundle.description || "",
          shortDescription: bundle.shortDescription || "",
          image: bundle.image || "",
          price: bundle.price?.toString() || "",
          compareAtPrice: bundle.compareAtPrice?.toString() || "",
          discountType: bundle.discountType || "PERCENTAGE",
          discountValue: bundle.discountValue?.toString() || "10",
          status: bundle.status || "DRAFT",
          isFeatured: bundle.isFeatured || false,
          isCustomizable: bundle.isCustomizable || false,
          minItems: bundle.minItems?.toString() || "",
          maxItems: bundle.maxItems?.toString() || "",
          validFrom: bundle.validFrom ? bundle.validFrom.split("T")[0] : "",
          validUntil: bundle.validUntil ? bundle.validUntil.split("T")[0] : "",
        });

        if (bundle.items) {
          setBundleItems(
            bundle.items.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              product: item.product,
              quantity: item.quantity || 1,
              isRequired: item.isRequired ?? true,
              isDefault: item.isDefault ?? true,
              sortOrder: item.sortOrder || 0,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching bundle:", error);
      toast({
        title: "Error",
        description: "Failed to load bundle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/products?status=ACTIVE&limit=100");
      const data = await response.json();
      if (data.data) {
        setAvailableProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(value: string) {
    setFormData({
      ...formData,
      name: value,
      slug: isEdit ? formData.slug : generateSlug(value),
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData({ ...formData, image: data.url });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  function addProduct(product: Product) {
    // Check if already added
    if (bundleItems.some((item) => item.productId === product.id)) {
      toast({
        title: "Already added",
        description: "This product is already in the bundle",
      });
      return;
    }

    setBundleItems((prev) => [
      ...prev,
      {
        productId: product.id,
        product,
        quantity: 1,
        isRequired: true,
        isDefault: true,
        sortOrder: prev.length,
      },
    ]);
  }

  function removeProduct(index: number) {
    setBundleItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, updates: Partial<BundleItem>) {
    setBundleItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  }

  // Calculate bundle savings
  const totalProductsPrice = bundleItems.reduce(
    (sum, item) => sum + (item.product?.basePrice || 0) * item.quantity,
    0
  );
  const bundlePrice = parseFloat(formData.price) || 0;
  const savings = totalProductsPrice - bundlePrice;
  const savingsPercent =
    totalProductsPrice > 0 ? (savings / totalProductsPrice) * 100 : 0;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : null,
        discountValue: parseFloat(formData.discountValue) || 0,
        minItems: formData.minItems ? parseInt(formData.minItems) : null,
        maxItems: formData.maxItems ? parseInt(formData.maxItems) : null,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        items: bundleItems.map((item, idx) => ({
          productId: item.productId,
          quantity: item.quantity,
          isRequired: item.isRequired,
          isDefault: item.isDefault,
          sortOrder: idx,
        })),
      };

      const url = isEdit ? `/api/bundles/${bundleId}` : "/api/bundles";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} bundle`);
      }

      toast({
        title: "Success",
        description: `Bundle ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/admin/bundles");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? "update" : "create"} bundle`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this bundle?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/bundles/${bundleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bundle");
      }

      toast({
        title: "Success",
        description: "Bundle deleted successfully",
      });

      router.push("/admin/bundles");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bundle",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Link href="/admin/bundles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Bundle" : "New Bundle"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? formData.name : "Create a product bundle with special pricing"}
          </p>
        </div>
        {isEdit && (
          <Button variant="outline" asChild>
            <Link href={`/bundles/${formData.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        )}
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
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Bundle"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Information</CardTitle>
                <CardDescription>Basic details about the bundle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Bundle Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter bundle name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="bundle-url-slug"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    placeholder="Brief description for listings..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detailed bundle description..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bundle Image</Label>
                  <div className="flex items-start gap-4">
                    {formData.image ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                        <Image
                          src={formData.image}
                          alt="Bundle"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setFormData({ ...formData, image: "" })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center w-32 h-32 flex flex-col items-center justify-center">
                        <input
                          type="file"
                          id="bundle-image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="bundle-image"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          {uploadingImage ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground mt-1">
                            Upload
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bundle Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bundle Products</CardTitle>
                    <CardDescription>
                      Select products to include in this bundle
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={() => setShowProductPicker(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Products
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bundleItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products added yet</p>
                    <p className="text-sm">
                      Add products to create your bundle
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bundleItems.map((item, index) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0]?.url ? (
                                  <Image
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
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
                              <div>
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.product?.category?.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.product?.basePrice || 0)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              className="w-16"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={item.isRequired}
                              onCheckedChange={(checked) =>
                                updateItem(index, { isRequired: !!checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={item.isDefault}
                              onCheckedChange={(checked) =>
                                updateItem(index, { isDefault: !!checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProduct(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {bundleItems.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total Products Value:</span>
                      <span>{formatCurrency(totalProductsPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Bundle Price:</span>
                      <span className="font-medium">
                        {formatCurrency(bundlePrice)}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-sm mt-1 text-green-600 font-medium">
                        <span>Customer Savings:</span>
                        <span>
                          {formatCurrency(savings)} ({savingsPercent.toFixed(0)}% off)
                        </span>
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
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Bundle Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price (₹)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, compareAtPrice: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          discountType: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: e.target.value })
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured Bundle</Label>
                    <p className="text-xs text-muted-foreground">
                      Show on homepage
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFeatured: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Customizable</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow customers to modify
                    </p>
                  </div>
                  <Switch
                    checked={formData.isCustomizable}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isCustomizable: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Validity Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {formData.isCustomizable && (
              <Card>
                <CardHeader>
                  <CardTitle>Customization Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Minimum Items</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.minItems}
                      onChange={(e) =>
                        setFormData({ ...formData, minItems: e.target.value })
                      }
                      placeholder="No minimum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Items</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxItems}
                      onChange={(e) =>
                        setFormData({ ...formData, maxItems: e.target.value })
                      }
                      placeholder="No maximum"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>

      {/* Product Picker Dialog */}
      <Dialog open={showProductPicker} onOpenChange={setShowProductPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Products to Bundle</DialogTitle>
            <DialogDescription>
              Select products to include in this bundle
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
              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No products found
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const isAdded = bundleItems.some(
                    (item) => item.productId === product.id
                  );
                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isAdded
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-muted"
                      )}
                      onClick={() => !isAdded && addProduct(product)}
                    >
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name} · {formatCurrency(product.basePrice)}
                        </p>
                      </div>
                      {isAdded ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          <Check className="h-3 w-3 mr-1" />
                          Added
                        </Badge>
                      ) : (
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
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
    </div>
  );
}
