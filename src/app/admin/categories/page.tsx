"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FolderTree,
  ChevronRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  iconBgColor: string | null;
  image: string | null;
  isTrending: boolean;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    products: number;
    subCategories: number;
  };
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-success/20 text-success",
  DRAFT: "bg-warning/20 text-warning",
  ARCHIVED: "bg-muted text-muted-foreground",
};

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingDialogOpen, setTrendingDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [trendingSettings, setTrendingSettings] = useState({
    icon: "cloud",
    iconBgColor: "#E5E5E5",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function toggleTrending(category: Category) {
    if (!category.isTrending) {
      // Opening dialog to set icon and color
      setSelectedCategory(category);
      setTrendingSettings({
        icon: category.icon || "cloud",
        iconBgColor: category.iconBgColor || "#E5E5E5",
      });
      setTrendingDialogOpen(true);
    } else {
      // Directly disable trending
      await updateCategoryTrending(category.id, false, category.icon, category.iconBgColor);
    }
  }

  async function updateCategoryTrending(
    id: string,
    isTrending: boolean,
    icon: string | null,
    iconBgColor: string | null
  ) {
    setSaving(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrending, icon, iconBgColor }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast({
        title: "Success",
        description: isTrending
          ? "Category marked as trending"
          : "Category removed from trending",
      });

      fetchCategories();
      setTrendingDialogOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTrending() {
    if (selectedCategory) {
      await updateCategoryTrending(
        selectedCategory.id,
        true,
        trendingSettings.icon,
        trendingSettings.iconBgColor
      );
    }
  }

  async function handleDelete(category: Category) {
    if (category._count?.products && category._count.products > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category has ${category._count.products} products. Remove or reassign them first.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"? This will also delete all subcategories.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
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

      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products into categories
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: category.isTrending
                            ? category.iconBgColor || "#E5E5E5"
                            : "var(--primary-10)",
                        }}
                      >
                        <FolderTree
                          className={`h-5 w-5 ${
                            category.isTrending &&
                            (category.iconBgColor === "#000000" ||
                              category.iconBgColor === "#1a1a1a")
                              ? "text-white"
                              : "text-primary"
                          }`}
                        />
                      </div>
                      <div>
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {category.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          /{category.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>{category._count?.products || 0}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/categories/${category.id}/subcategories`}
                      className="flex items-center gap-1 text-sm hover:text-primary"
                    >
                      {category._count?.subCategories || 0}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.isTrending}
                        onCheckedChange={() => toggleTrending(category)}
                      />
                      {category.isTrending && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        category.isActive
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {category.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/categories/${category.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/categories/${category.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleTrending(category)}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          {category.isTrending ? "Remove from Trending" : "Mark as Trending"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No categories found</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/admin/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first category
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Settings Dialog */}
      <Dialog open={trendingDialogOpen} onOpenChange={setTrendingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Trending</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Configure how &quot;{selectedCategory?.name}&quot; appears in the &quot;Our Trending Products&quot; section.
            </p>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={trendingSettings.icon}
                onValueChange={(value) =>
                  setTrendingSettings({ ...trendingSettings, icon: value })
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
                value={trendingSettings.iconBgColor}
                onValueChange={(value) =>
                  setTrendingSettings({ ...trendingSettings, iconBgColor: value })
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

            {/* Preview */}
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Preview</Label>
              <div className="mt-2 flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: trendingSettings.iconBgColor }}
                >
                  <FolderTree
                    className={`h-8 w-8 ${
                      trendingSettings.iconBgColor === "#000000"
                        ? "text-white"
                        : trendingSettings.iconBgColor.toLowerCase().includes("ffe4e4")
                        ? "text-[#8B1D1D]"
                        : "text-gray-700"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrendingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrending} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save & Mark as Trending
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
