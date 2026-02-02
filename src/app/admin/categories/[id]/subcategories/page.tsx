"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Save,
  Loader2,
  Trash2,
  GripVertical,
  Pencil,
  X,
  Cloud,
  Server,
  Database,
  Shield,
  Zap,
  Globe,
  Cpu,
  Layers,
  Rocket,
  Target,
  Network,
  Wifi,
  Settings,
  Brain,
  Monitor,
  Lock,
  Folder,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const iconOptions = [
  { value: "cloud", label: "Cloud", Icon: Cloud },
  { value: "server", label: "Server", Icon: Server },
  { value: "database", label: "Database", Icon: Database },
  { value: "shield", label: "Shield", Icon: Shield },
  { value: "zap", label: "Zap", Icon: Zap },
  { value: "globe", label: "Globe", Icon: Globe },
  { value: "cpu", label: "CPU", Icon: Cpu },
  { value: "layers", label: "Layers", Icon: Layers },
  { value: "rocket", label: "Rocket", Icon: Rocket },
  { value: "target", label: "Target", Icon: Target },
  { value: "network", label: "Network", Icon: Network },
  { value: "wifi", label: "WiFi", Icon: Wifi },
  { value: "settings", label: "Settings", Icon: Settings },
  { value: "brain", label: "Brain", Icon: Brain },
  { value: "monitor", label: "Monitor", Icon: Monitor },
  { value: "lock", label: "Lock", Icon: Lock },
];

const colorPresets = [
  { value: "#DBEAFE", label: "Blue" },
  { value: "#D1FAE5", label: "Green" },
  { value: "#FEE2E2", label: "Red" },
  { value: "#FEF3C7", label: "Amber" },
  { value: "#E9D5FF", label: "Purple" },
  { value: "#CFFAFE", label: "Cyan" },
  { value: "#FCE7F3", label: "Pink" },
  { value: "#F3E8FF", label: "Violet" },
];

interface SubCategory {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  iconBgColor: string;
  isActive: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function SubcategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  async function fetchData() {
    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      const data = await response.json();
      if (data.data) {
        setCategory({
          id: data.data.id,
          name: data.data.name,
          slug: data.data.slug,
        });
        setSubCategories(
          (data.data.subCategories || []).map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description || "",
            image: sub.image || "",
            icon: sub.icon || "",
            iconBgColor: sub.iconBgColor || "#DBEAFE",
            isActive: sub.isActive,
            sortOrder: sub.sortOrder,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function openDialog(subCategory?: SubCategory) {
    if (subCategory) {
      setEditingSubCategory({ ...subCategory });
    } else {
      setEditingSubCategory({
        name: "",
        slug: "",
        description: "",
        image: "",
        icon: "",
        iconBgColor: "#DBEAFE",
        isActive: true,
        sortOrder: subCategories.length,
      });
    }
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingSubCategory(null);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function saveSubCategory() {
    if (!editingSubCategory || !editingSubCategory.name) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        subCategories: editingSubCategory.id
          ? subCategories.map((s) =>
              s.id === editingSubCategory.id ? editingSubCategory : s
            )
          : [...subCategories, editingSubCategory],
      };

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      toast({
        title: "Success",
        description: editingSubCategory.id
          ? "Subcategory updated"
          : "Subcategory created",
      });

      fetchData();
      closeDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subcategory",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubCategory(id: string) {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    setSaving(true);
    try {
      const payload = {
        subCategories: subCategories.filter((s) => s.id !== id),
      };

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast({
        title: "Success",
        description: "Subcategory deleted",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function getIconComponent(iconName: string) {
    const iconOption = iconOptions.find((i) => i.value === iconName);
    if (iconOption) {
      const Icon = iconOption.Icon;
      return <Icon className="w-5 h-5" />;
    }
    return <Folder className="w-5 h-5" />;
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
          <Link href={`/admin/categories/${categoryId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Subcategories</h1>
          <p className="text-muted-foreground mt-1">
            Manage subcategories for {category?.name}
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subcategory
        </Button>
      </div>

      {/* Subcategories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Subcategories</CardTitle>
          <CardDescription>
            {subCategories.length} subcategories in this category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subCategories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No subcategories yet</p>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Subcategory
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {subCategories.map((sub, index) => (
                <div
                  key={sub.id || index}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="text-gray-400 cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: sub.iconBgColor || "#DBEAFE" }}
                  >
                    {getIconComponent(sub.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{sub.name}</h3>
                      {!sub.isActive && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">/{sub.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(sub)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => sub.id && deleteSubCategory(sub.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSubCategory?.id ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
          </DialogHeader>

          {editingSubCategory && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
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
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingSubCategory.description}
                  onChange={(e) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={editingSubCategory.icon || "cloud"}
                    onValueChange={(value) =>
                      setEditingSubCategory({
                        ...editingSubCategory,
                        icon: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.Icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Icon Color</Label>
                  <Select
                    value={editingSubCategory.iconBgColor || "#DBEAFE"}
                    onValueChange={(value) =>
                      setEditingSubCategory({
                        ...editingSubCategory,
                        iconBgColor: value,
                      })
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
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Preview
                </Label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: editingSubCategory.iconBgColor || "#DBEAFE",
                    }}
                  >
                    {getIconComponent(editingSubCategory.icon || "cloud")}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {editingSubCategory.name || "Subcategory Name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      /{editingSubCategory.slug || "subcategory-slug"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={editingSubCategory.isActive}
                  onCheckedChange={(checked) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={saveSubCategory} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSubCategory?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
