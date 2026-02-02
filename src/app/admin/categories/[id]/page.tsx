"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, FolderTree, Trash2 } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const iconOptions = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "shield", label: "Shield (Security)" },
  { value: "cloud", label: "Cloud" },
  { value: "settings", label: "Settings (Automation)" },
  { value: "brain", label: "Brain (AI)" },
  { value: "share2", label: "Network (IoT)" },
  { value: "database", label: "Database" },
  { value: "server", label: "Server" },
  { value: "monitor", label: "Monitor" },
  { value: "lock", label: "Lock" },
];

const colorPresets = [
  { value: "#000000", label: "Black" },
  { value: "#D4A574", label: "Bronze" },
  { value: "#E5E5E5", label: "Light Gray" },
  { value: "#FFE4E4", label: "Light Pink" },
  { value: "#F5F5F5", label: "Off White" },
  { value: "#DBEAFE", label: "Light Blue" },
  { value: "#D1FAE5", label: "Light Green" },
  { value: "#FEF3C7", label: "Light Yellow" },
];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [subCategoryCount, setSubCategoryCount] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    heroImage: "",
    icon: "",
    iconBgColor: "#E5E5E5",
    isActive: true,
    isTrending: false,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategory();
  }, [id]);

  async function fetchCategory() {
    try {
      const response = await fetch(`/api/categories/${id}`);
      const data = await response.json();
      if (data.data) {
        const category = data.data;
        setProductCount(category._count?.products || 0);
        setSubCategoryCount(category._count?.subCategories || 0);
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          image: category.image || "",
          heroImage: category.heroImage || "",
          icon: category.icon || "",
          iconBgColor: category.iconBgColor || "#E5E5E5",
          isActive: category.isActive,
          isTrending: category.isTrending || false,
          sortOrder: category.sortOrder || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast({
        title: "Error",
        description: "Failed to load category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast({
        title: "Validation Error",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image: formData.image || null,
          heroImage: formData.heroImage || null,
          icon: formData.icon || null,
          iconBgColor: formData.iconBgColor,
          isActive: formData.isActive,
          isTrending: formData.isTrending,
          sortOrder: formData.sortOrder,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update category");
      }

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      router.push("/admin/categories");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete category");
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      router.push("/admin/categories");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground mt-1">
            Update category details
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={productCount > 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this category? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          {/* Left Column - Category Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>Basic category details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="category-slug"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL: /categories/{formData.slug || "slug"}
                    </p>
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
                    placeholder="Describe this category..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Category Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroImage">Hero Banner Image URL</Label>
                  <Input
                    id="heroImage"
                    value={formData.heroImage}
                    onChange={(e) =>
                      setFormData({ ...formData, heroImage: e.target.value })
                    }
                    placeholder="https://example.com/hero-banner.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Background image for category and subcategory page headers
                  </p>
                  {formData.heroImage && (
                    <div className="mt-2">
                      <img
                        src={formData.heroImage}
                        alt="Hero Preview"
                        className="w-full h-24 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Icon and color settings for trending display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) =>
                        setFormData({ ...formData, icon: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <Select
                      value={formData.iconBgColor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, iconBgColor: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorPresets.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">
                    Preview
                  </Label>
                  <div className="mt-2 flex justify-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: formData.iconBgColor }}
                    >
                      <FolderTree
                        className={`h-8 w-8 ${
                          formData.iconBgColor === "#000000"
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{productCount}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{subCategoryCount}</p>
                    <p className="text-sm text-muted-foreground">Subcategories</p>
                  </div>
                </div>
                {productCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Cannot delete category with products. Remove or reassign
                    products first.
                  </p>
                )}
              </CardContent>
            </Card>

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
                  Only active categories are visible on the storefront
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTrending"
                    checked={formData.isTrending}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isTrending: checked })
                    }
                  />
                  <Label htmlFor="isTrending">Mark as Trending</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Trending categories appear in the &quot;Our Trending Products&quot;
                  section on the homepage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sort Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Display Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/categories/${formData.slug}`} target="_blank">
                    View Category
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/categories/${id}/subcategories`}>
                    Manage Subcategories
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
