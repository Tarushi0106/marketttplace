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
  FolderTree,
  TrendingUp,
  Eye,
  GripVertical,
  Wifi,
  Shield,
  Cloud,
  Settings,
  Brain,
  Share2,
  Database,
  Server,
  Monitor,
  Lock,
  Folder,
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SubCategory {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  iconBgColor: string;
  isTrending: boolean;
  isActive: boolean;
  sortOrder: string;
}

interface CategoryFormProps {
  categoryId?: string;
  isEdit?: boolean;
}

const iconOptions = [
  { value: "wifi", label: "Wi-Fi / Connectivity", icon: Wifi },
  { value: "shield", label: "Shield / Security", icon: Shield },
  { value: "cloud", label: "Cloud Services", icon: Cloud },
  { value: "settings", label: "Settings / Automation", icon: Settings },
  { value: "brain", label: "Brain / AI", icon: Brain },
  { value: "share2", label: "Network / IoT", icon: Share2 },
  { value: "database", label: "Database", icon: Database },
  { value: "server", label: "Server", icon: Server },
  { value: "monitor", label: "Monitor / Display", icon: Monitor },
  { value: "lock", label: "Lock / Privacy", icon: Lock },
  { value: "folder", label: "Folder / General", icon: Folder },
];

const colorPresets = [
  { value: "#000000", label: "Black" },
  { value: "#1a1a1a", label: "Dark Gray" },
  { value: "#D4A574", label: "Bronze" },
  { value: "#E5E5E5", label: "Light Gray" },
  { value: "#FFE4E4", label: "Light Pink" },
  { value: "#F5F5F5", label: "Off White" },
  { value: "#DBEAFE", label: "Light Blue" },
  { value: "#D1FAE5", label: "Light Green" },
  { value: "#FEF3C7", label: "Light Yellow" },
  { value: "#E9D5FF", label: "Light Purple" },
  { value: "#8B1D1D", label: "Brand Red" },
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find((opt) => opt.value === iconName);
  return found ? found.icon : Folder;
};

export function CategoryForm({ categoryId, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    icon: "folder",
    iconBgColor: "#E5E5E5",
    isTrending: false,
    isActive: true,
    sortOrder: "0",
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  useEffect(() => {
    if (isEdit && categoryId) {
      fetchCategory();
    }
  }, [isEdit, categoryId]);

  async function fetchCategory() {
    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      const data = await response.json();

      if (data.data) {
        const category = data.data;
        setFormData({
          name: category.name || "",
          slug: category.slug || "",
          description: category.description || "",
          image: category.image || "",
          icon: category.icon || "folder",
          iconBgColor: category.iconBgColor || "#E5E5E5",
          isTrending: category.isTrending || false,
          isActive: category.isActive ?? true,
          sortOrder: category.sortOrder?.toString() || "0",
        });

        if (category.subCategories) {
          setSubCategories(
            category.subCategories.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description || "",
              image: sub.image || "",
              isActive: sub.isActive ?? true,
              sortOrder: sub.sortOrder || 0,
            }))
          );
        }
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

  // Subcategory management
  function openSubCategoryModal(subCategory?: SubCategory) {
    if (subCategory) {
      setEditingSubCategory(subCategory);
    } else {
      setEditingSubCategory({
        name: "",
        slug: "",
        description: "",
        image: "",
        isActive: true,
        sortOrder: subCategories.length,
      });
    }
    setShowSubCategoryModal(true);
  }

  function saveSubCategory() {
    if (!editingSubCategory || !editingSubCategory.name) return;

    // Auto-generate slug if empty
    const subToSave = {
      ...editingSubCategory,
      slug: editingSubCategory.slug || generateSlug(editingSubCategory.name),
    };

    if (subToSave.id) {
      setSubCategories((prev) =>
        prev.map((s) => (s.id === subToSave.id ? subToSave : s))
      );
    } else {
      setSubCategories((prev) => [...prev, subToSave]);
    }
    setShowSubCategoryModal(false);
    setEditingSubCategory(null);
  }

  function removeSubCategory(index: number) {
    setSubCategories((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder) || 0,
        subCategories: subCategories.map((sub, idx) => ({
          ...sub,
          sortOrder: idx,
        })),
      };

      const url = isEdit ? `/api/categories/${categoryId}` : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} category`);
      }

      toast({
        title: "Success",
        description: `Category ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/admin/categories");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? "update" : "create"} category`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      router.push("/admin/categories");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const IconComponent = getIconComponent(formData.icon);

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
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Category" : "New Category"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? formData.name : "Add a new category to organize your products"}
          </p>
        </div>
        {isEdit && (
          <Button variant="outline" asChild>
            <Link href={`/categories/${formData.slug}`} target="_blank">
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
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>Basic details about the category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Category Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter category name"
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
                      placeholder="category-url-slug"
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
                    placeholder="Describe this category..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category Image</Label>
                  <div className="flex items-start gap-4">
                    {formData.image ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                        <Image
                          src={formData.image}
                          alt="Category"
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
                          id="category-image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="category-image"
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

            {/* Subcategories */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subcategories</CardTitle>
                    <CardDescription>
                      Organize products within this category
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={() => openSubCategoryModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subcategory
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {subCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No subcategories added yet</p>
                    <p className="text-sm">
                      Subcategories help organize products within this category
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subCategories.map((sub, index) => (
                        <TableRow key={sub.id || index}>
                          <TableCell className="font-medium">{sub.name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            /{sub.slug}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={sub.isActive ? "default" : "secondary"}
                              className={sub.isActive ? "bg-green-100 text-green-800" : ""}
                            >
                              {sub.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => openSubCategoryModal(sub)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubCategory(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                      Category visible on storefront
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: e.target.value })
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Display
                </CardTitle>
                <CardDescription>
                  Show in &quot;Browse Top Solutions&quot; section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mark as Trending</Label>
                    <p className="text-xs text-muted-foreground">
                      Featured on homepage
                    </p>
                  </div>
                  <Switch
                    checked={formData.isTrending}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isTrending: checked })
                    }
                  />
                </div>

                {formData.isTrending && (
                  <>
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={formData.icon}
                        onValueChange={(value) =>
                          setFormData({ ...formData, icon: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
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
                          <SelectValue />
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

                    {/* Preview */}
                    <div className="pt-4 border-t">
                      <Label className="text-sm text-muted-foreground">Preview</Label>
                      <div className="mt-3 flex justify-center">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: formData.iconBgColor }}
                        >
                          <IconComponent
                            className={cn(
                              "h-8 w-8",
                              formData.iconBgColor === "#000000" ||
                                formData.iconBgColor === "#1a1a1a" ||
                                formData.iconBgColor === "#8B1D1D"
                                ? "text-white"
                                : "text-gray-700"
                            )}
                          />
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2">
                        {formData.name || "Category Name"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Subcategory Modal */}
      <Dialog open={showSubCategoryModal} onOpenChange={setShowSubCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubCategory?.id ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
            <DialogDescription>
              Subcategories help organize products within this category
            </DialogDescription>
          </DialogHeader>
          {editingSubCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={editingSubCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingSubCategory({
                      ...editingSubCategory,
                      name,
                      slug: editingSubCategory.id
                        ? editingSubCategory.slug
                        : generateSlug(name),
                    });
                  }}
                  placeholder="Subcategory name"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={editingSubCategory.slug}
                  onChange={(e) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      slug: e.target.value,
                    })
                  }
                  placeholder="subcategory-slug"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingSubCategory.description}
                  onChange={(e) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this subcategory..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingSubCategory.isActive}
                  onCheckedChange={(checked) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      isActive: checked,
                    })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSubCategoryModal(false);
                setEditingSubCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveSubCategory}>Save Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
