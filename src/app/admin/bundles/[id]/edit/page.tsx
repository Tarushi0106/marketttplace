"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Package,
  Search,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  basePrice: number;
  images: { url: string }[];
}

interface BundleItem {
  productId: string;
  product: Product;
  quantity: number;
}

export default function EditBundlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    status: "DRAFT",
    isFeatured: false,
    items: [] as BundleItem[],
  });

  useEffect(() => {
    fetchBundle();
    fetchProducts();
  }, [id]);

  async function fetchBundle() {
    try {
      const response = await fetch(`/api/bundles/${id}`);
      const data = await response.json();
      if (data.data) {
        const bundle = data.data;
        setFormData({
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description || "",
          price: String(bundle.price),
          discountType: bundle.discountType || "PERCENTAGE",
          discountValue: String(bundle.discountValue || ""),
          status: bundle.status,
          isFeatured: bundle.isFeatured || false,
          items: bundle.items?.map((item: any) => ({
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
          })) || [],
        });
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
    try {
      const response = await fetch("/api/products?limit=100");
      const data = await response.json();
      if (data.data) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  function addProductToBundle(product: Product) {
    const exists = formData.items.find((item) => item.productId === product.id);
    if (exists) {
      toast({
        title: "Product already added",
        description: "This product is already in the bundle",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: product.id, product, quantity: 1 },
      ],
    });
    setProductDialogOpen(false);
  }

  function removeProductFromBundle(productId: string) {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.productId !== productId),
    });
  }

  function updateItemQuantity(productId: string, quantity: number) {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  }

  const totalOriginalPrice = formData.items.reduce(
    (sum, item) => sum + Number(item.product.basePrice) * item.quantity,
    0
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.items.length < 2) {
      toast({
        title: "Error",
        description: "A bundle must contain at least 2 products",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price: parseFloat(formData.price) || 0,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue) || 0,
          status: formData.status,
          isFeatured: formData.isFeatured,
          items: formData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update bundle");
      }

      toast({
        title: "Success",
        description: "Bundle updated successfully",
      });

      router.push("/admin/bundles");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update bundle",
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
          <Link href="/admin/bundles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Bundle</h1>
          <p className="text-muted-foreground mt-1">
            Update bundle details
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
          {/* Left Column - Bundle Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Information</CardTitle>
                <CardDescription>Basic bundle details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bundle Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what's included in this bundle..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products in Bundle */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products in Bundle</CardTitle>
                    <CardDescription>
                      Add at least 2 products to this bundle
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setProductDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No products added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                          {item.product.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Number(item.product.basePrice))} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Qty:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(
                                item.productId,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProductFromBundle(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Total Value:</span>
                        <span className="font-medium">
                          {formatCurrency(totalOriginalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Bundle Price (₹) *</Label>
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
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, discountType: value })
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
                  <Label htmlFor="discountValue">
                    Discount Value{" "}
                    {formData.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>

                {totalOriginalPrice > 0 && formData.price && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Savings:{" "}
                      <span className="font-medium">
                        {formatCurrency(
                          totalOriginalPrice - parseFloat(formData.price)
                        )}
                      </span>{" "}
                      (
                      {(
                        ((totalOriginalPrice - parseFloat(formData.price)) /
                          totalOriginalPrice) *
                        100
                      ).toFixed(0)}
                      % off)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bundle Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFeatured: checked })
                    }
                  />
                  <Label htmlFor="isFeatured">Featured Bundle</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Add Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Product to Bundle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredProducts.map((product) => {
                const isAdded = formData.items.some(
                  (item) => item.productId === product.id
                );
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                      isAdded ? "opacity-50" : ""
                    }`}
                    onClick={() => !isAdded && addProductToBundle(product)}
                  >
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Number(product.basePrice))}
                      </p>
                    </div>
                    {isAdded && (
                      <span className="text-sm text-muted-foreground">
                        Added
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
