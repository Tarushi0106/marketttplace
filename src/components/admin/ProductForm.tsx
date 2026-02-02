"use client";

import { useState, useEffect, useCallback } from "react";
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
  GripVertical,
  ImageIcon,
  Package,
  DollarSign,
  Settings,
  FileText,
  Search as SearchIcon,
  Layers,
  Puzzle,
  Sliders,
  Eye,
  Star,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

interface Category {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  file?: File;
}

interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  stockQuantity: string;
  attributes: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ProductAddon {
  id?: string;
  name: string;
  description: string;
  price: string;
  pricingType: "ONE_TIME" | "RECURRING_MONTHLY" | "RECURRING_YEARLY";
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ProductConfig {
  id?: string;
  name: string;
  type: "SELECT" | "RADIO" | "CHECKBOX" | "NUMBER";
  options: { value: string; label: string; priceModifier: string }[];
  isRequired: boolean;
  defaultValue: string;
  sortOrder: number;
}

interface Specification {
  key: string;
  value: string;
}

interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  brandLogo: string;
  shortDescription: string;
  description: string;
  basePrice: string;
  compareAtPrice: string;
  costPrice: string;
  taxRate: string;
  categoryId: string;
  subCategoryId: string;
  productType: "STANDALONE" | "WITH_ADDONS" | "CONFIGURABLE" | "BUNDLE";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  trackInventory: boolean;
  allowBackorder: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  weight: string;
  weightUnit: string;
  features: string[];
  specifications: Specification[];
}

interface ProductFormProps {
  productId?: string;
  isEdit?: boolean;
}

export function ProductForm({ productId, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    sku: "",
    barcode: "",
    brandLogo: "",
    shortDescription: "",
    description: "",
    basePrice: "",
    compareAtPrice: "",
    costPrice: "",
    taxRate: "",
    categoryId: "",
    subCategoryId: "",
    productType: "STANDALONE",
    status: "DRAFT",
    isFeatured: false,
    isDigital: true,
    requiresShipping: false,
    trackInventory: true,
    allowBackorder: false,
    stockQuantity: "100",
    lowStockThreshold: "5",
    weight: "",
    weightUnit: "kg",
    features: [],
    specifications: [],
  });

  // Related data
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [configs, setConfigs] = useState<ProductConfig[]>([]);
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  // UI state
  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editingAddon, setEditingAddon] = useState<ProductAddon | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProductConfig | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    if (isEdit && productId) {
      fetchProduct();
    }
  }, [isEdit, productId]);

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function fetchProduct() {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (data.data) {
        const product = data.data;
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          brandLogo: product.brandLogo || "",
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          basePrice: product.basePrice?.toString() || "",
          compareAtPrice: product.compareAtPrice?.toString() || "",
          costPrice: product.costPrice?.toString() || "",
          taxRate: product.taxRate?.toString() || "",
          categoryId: product.categoryId || "",
          subCategoryId: product.subCategoryId || "",
          productType: product.productType || "STANDALONE",
          status: product.status || "DRAFT",
          isFeatured: product.isFeatured || false,
          isDigital: product.isDigital ?? true,
          requiresShipping: product.requiresShipping ?? false,
          trackInventory: product.trackInventory ?? true,
          allowBackorder: product.allowBackorder ?? false,
          stockQuantity: product.stockQuantity?.toString() || "0",
          lowStockThreshold: product.lowStockThreshold?.toString() || "5",
          weight: product.weight?.toString() || "",
          weightUnit: product.weightUnit || "kg",
          features: product.features || [],
          specifications: Object.entries(product.specifications || {}).map(
            ([key, value]) => ({ key, value: value as string })
          ),
        });

        // Set images
        if (product.images) {
          setImages(
            product.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
            }))
          );
        }

        // Set variants
        if (product.variants) {
          setVariants(
            product.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              sku: v.sku || "",
              price: v.price?.toString() || "",
              compareAtPrice: v.compareAtPrice?.toString() || "",
              costPrice: v.costPrice?.toString() || "",
              stockQuantity: v.stockQuantity?.toString() || "0",
              attributes: v.attributes || {},
              isDefault: v.isDefault || false,
              isActive: v.isActive ?? true,
              sortOrder: v.sortOrder || 0,
            }))
          );
        }

        // Set addons
        if (product.addons) {
          setAddons(
            product.addons.map((a: any) => ({
              id: a.id,
              name: a.name,
              description: a.description || "",
              price: a.price?.toString() || "",
              pricingType: a.pricingType || "ONE_TIME",
              isRequired: a.isRequired || false,
              isActive: a.isActive ?? true,
              sortOrder: a.sortOrder || 0,
            }))
          );
        }

        // Set configs
        if (product.configs) {
          setConfigs(
            product.configs.map((c: any) => ({
              id: c.id,
              name: c.name,
              type: c.type || "SELECT",
              options: c.options || [],
              isRequired: c.isRequired || false,
              defaultValue: c.defaultValue || "",
              sortOrder: c.sortOrder || 0,
            }))
          );
        }

        // Set SEO
        if (product.seoMetadata) {
          setSeoMetadata({
            metaTitle: product.seoMetadata.metaTitle || "",
            metaDescription: product.seoMetadata.metaDescription || "",
            metaKeywords: product.seoMetadata.metaKeywords || "",
            ogTitle: product.seoMetadata.ogTitle || "",
            ogDescription: product.seoMetadata.ogDescription || "",
            ogImage: product.seoMetadata.ogImage || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
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

  // Features management
  function addFeature() {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  }

  function removeFeature(index: number) {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  }

  // Specifications management
  function addSpecification() {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specifications: [
          ...formData.specifications,
          { key: newSpecKey.trim(), value: newSpecValue.trim() },
        ],
      });
      setNewSpecKey("");
      setNewSpecValue("");
    }
  }

  function removeSpecification(index: number) {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  }

  // Image upload handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();

        setImages((prev) => [
          ...prev,
          {
            url: data.url,
            alt: file.name,
            sortOrder: prev.length,
            isPrimary: prev.length === 0,
          },
        ]);
      }

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary image, make the first one primary
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  }

  function setPrimaryImage(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  }

  // Variant management
  function openVariantModal(variant?: ProductVariant) {
    if (variant) {
      setEditingVariant(variant);
    } else {
      setEditingVariant({
        name: "",
        sku: "",
        price: formData.basePrice,
        compareAtPrice: "",
        costPrice: "",
        stockQuantity: "0",
        attributes: {},
        isDefault: variants.length === 0,
        isActive: true,
        sortOrder: variants.length,
      });
    }
    setShowVariantModal(true);
  }

  function saveVariant() {
    if (!editingVariant || !editingVariant.name) return;

    if (editingVariant.id) {
      setVariants((prev) =>
        prev.map((v) => (v.id === editingVariant.id ? editingVariant : v))
      );
    } else {
      setVariants((prev) => [...prev, editingVariant]);
    }
    setShowVariantModal(false);
    setEditingVariant(null);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // Addon management
  function openAddonModal(addon?: ProductAddon) {
    if (addon) {
      setEditingAddon(addon);
    } else {
      setEditingAddon({
        name: "",
        description: "",
        price: "",
        pricingType: "ONE_TIME",
        isRequired: false,
        isActive: true,
        sortOrder: addons.length,
      });
    }
    setShowAddonModal(true);
  }

  function saveAddon() {
    if (!editingAddon || !editingAddon.name) return;

    if (editingAddon.id) {
      setAddons((prev) =>
        prev.map((a) => (a.id === editingAddon.id ? editingAddon : a))
      );
    } else {
      setAddons((prev) => [...prev, editingAddon]);
    }
    setShowAddonModal(false);
    setEditingAddon(null);
  }

  function removeAddon(index: number) {
    setAddons((prev) => prev.filter((_, i) => i !== index));
  }

  // Config management
  function openConfigModal(config?: ProductConfig) {
    if (config) {
      setEditingConfig(config);
    } else {
      setEditingConfig({
        name: "",
        type: "SELECT",
        options: [{ value: "", label: "", priceModifier: "0" }],
        isRequired: false,
        defaultValue: "",
        sortOrder: configs.length,
      });
    }
    setShowConfigModal(true);
  }

  function saveConfig() {
    if (!editingConfig || !editingConfig.name) return;

    if (editingConfig.id) {
      setConfigs((prev) =>
        prev.map((c) => (c.id === editingConfig.id ? editingConfig : c))
      );
    } else {
      setConfigs((prev) => [...prev, editingConfig]);
    }
    setShowConfigModal(false);
    setEditingConfig(null);
  }

  function removeConfig(index: number) {
    setConfigs((prev) => prev.filter((_, i) => i !== index));
  }

  // Form submission
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        specifications: formData.specifications.reduce(
          (acc, spec) => ({ ...acc, [spec.key]: spec.value }),
          {}
        ),
        // Include related data
        images: images.map((img, idx) => ({
          ...img,
          sortOrder: idx,
        })),
        variants: variants.map((v, idx) => ({
          ...v,
          price: parseFloat(v.price) || 0,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
          costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
          stockQuantity: parseInt(v.stockQuantity) || 0,
          sortOrder: idx,
        })),
        addons: addons.map((a, idx) => ({
          ...a,
          price: parseFloat(a.price) || 0,
          sortOrder: idx,
        })),
        configs: configs.map((c, idx) => ({
          ...c,
          options: c.options.map((o) => ({
            ...o,
            priceModifier: parseFloat(o.priceModifier) || 0,
          })),
          sortOrder: idx,
        })),
        seoMetadata,
      };

      const url = isEdit ? `/api/products/${productId}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} product`);
      }

      toast({
        title: "Success",
        description: `Product ${isEdit ? "updated" : "created"} successfully`,
      });

      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? "update" : "create"} product`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

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
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? formData.name : "Add a new product to your catalog"}
          </p>
        </div>
        {isEdit && (
          <Button variant="outline" asChild>
            <Link href={`/products/${formData.slug}`} target="_blank">
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
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>

      {/* Status Bar */}
      <Card className="bg-muted/50">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  formData.status === "ACTIVE"
                    ? "default"
                    : formData.status === "DRAFT"
                    ? "secondary"
                    : "outline"
                }
                className={cn(
                  formData.status === "ACTIVE" && "bg-green-100 text-green-800",
                  formData.status === "DRAFT" && "bg-yellow-100 text-yellow-800",
                  formData.status === "ARCHIVED" && "bg-gray-100 text-gray-600"
                )}
              >
                {formData.status}
              </Badge>
              {formData.isFeatured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
              <Badge variant="outline">
                {formData.productType.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex">
            <TabsTrigger value="basic" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden lg:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden lg:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="variants" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">Variants</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="gap-2">
              <Puzzle className="h-4 w-4" />
              <span className="hidden lg:inline">Add-ons</span>
            </TabsTrigger>
            <TabsTrigger value="configs" className="gap-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden lg:inline">Configs</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <SearchIcon className="h-4 w-4" />
              <span className="hidden lg:inline">SEO</span>
            </TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>
                      Basic details about your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Product Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="Enter product name"
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
                          placeholder="product-url-slug"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                          placeholder="PRD-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="barcode">Barcode</Label>
                        <Input
                          id="barcode"
                          value={formData.barcode}
                          onChange={(e) =>
                            setFormData({ ...formData, barcode: e.target.value })
                          }
                          placeholder="123456789"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <Textarea
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shortDescription: e.target.value,
                          })
                        }
                        placeholder="Brief description for product listings..."
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Appears in product cards and search results
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Detailed product description..."
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                    <CardDescription>
                      Key features displayed as bullet points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature..."
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                      />
                      <Button type="button" onClick={addFeature}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.features.length > 0 && (
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-muted p-3 rounded-lg"
                          >
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="flex-1">{feature}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFeature(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                    <CardDescription>
                      Technical specifications displayed as a table
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Specification name..."
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value..."
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSpecification();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSpecification}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.specifications.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Specification</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.specifications.map((spec, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {spec.key}
                              </TableCell>
                              <TableCell>{spec.value}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSpecification(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Organization */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            categoryId: value,
                            subCategoryId: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategory</Label>
                      <Select
                        value={formData.subCategoryId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, subCategoryId: value })
                        }
                        disabled={!selectedCategory?.subCategories?.length}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCategory?.subCategories?.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Product Type</Label>
                      <Select
                        value={formData.productType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, productType: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDALONE">Standalone</SelectItem>
                          <SelectItem value="WITH_ADDONS">With Add-ons</SelectItem>
                          <SelectItem value="CONFIGURABLE">Configurable</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {formData.productType === "STANDALONE" &&
                          "Basic product with optional variants"}
                        {formData.productType === "WITH_ADDONS" &&
                          "Product with optional add-on services"}
                        {formData.productType === "CONFIGURABLE" &&
                          "Product with configurable options"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Featured Product</Label>
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
                        <Label>Digital Product</Label>
                        <p className="text-xs text-muted-foreground">
                          No physical shipping
                        </p>
                      </div>
                      <Switch
                        checked={formData.isDigital}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            isDigital: checked,
                            requiresShipping: checked ? false : formData.requiresShipping,
                          })
                        }
                      />
                    </div>
                    {!formData.isDigital && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Requires Shipping</Label>
                          <p className="text-xs text-muted-foreground">
                            Physical delivery
                          </p>
                        </div>
                        <Switch
                          checked={formData.requiresShipping}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, requiresShipping: checked })
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* MEDIA TAB */}
          <TabsContent value="media" className="space-y-6">
            {/* Brand Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Logo</CardTitle>
                <CardDescription>
                  Upload a brand/vendor logo to display in the product hero section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  {formData.brandLogo && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                      <Image
                        src={formData.brandLogo}
                        alt="Brand logo"
                        fill
                        className="object-contain p-2"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFormData({ ...formData, brandLogo: "" })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="brandLogo">Logo URL</Label>
                    <Input
                      id="brandLogo"
                      value={formData.brandLogo}
                      onChange={(e) =>
                        setFormData({ ...formData, brandLogo: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a URL or upload an image and paste the URL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload high-quality images. The first image will be used as the
                  primary image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Zone */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploadingImages ? (
                      <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {uploadingImages
                        ? "Uploading..."
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </label>
                </div>

                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 group",
                          image.isPrimary ? "border-primary" : "border-transparent"
                        )}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || "Product image"}
                          fill
                          className="object-cover"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-primary">Primary</Badge>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!image.isPrimary && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPrimaryImage(index)}
                            >
                              Set Primary
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeImage(index)}
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
          </TabsContent>

          {/* PRICING TAB */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set product pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">
                        Base Price (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, basePrice: e.target.value })
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
                          setFormData({
                            ...formData,
                            compareAtPrice: e.target.value,
                          })
                        }
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Shows as strikethrough price
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price (₹)</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, costPrice: e.target.value })
                        }
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        For profit calculation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) =>
                          setFormData({ ...formData, taxRate: e.target.value })
                        }
                        placeholder="18"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>Manage stock levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stockQuantity: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lowStockThreshold: e.target.value,
                          })
                        }
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Track Inventory</Label>
                        <p className="text-xs text-muted-foreground">
                          Monitor stock levels
                        </p>
                      </div>
                      <Switch
                        checked={formData.trackInventory}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, trackInventory: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Backorders</Label>
                        <p className="text-xs text-muted-foreground">
                          Sell when out of stock
                        </p>
                      </div>
                      <Switch
                        checked={formData.allowBackorder}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, allowBackorder: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!formData.isDigital && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping</CardTitle>
                    <CardDescription>Physical product details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weightUnit">Weight Unit</Label>
                        <Select
                          value={formData.weightUnit}
                          onValueChange={(value) =>
                            setFormData({ ...formData, weightUnit: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="g">Grams (g)</SelectItem>
                            <SelectItem value="lb">Pounds (lb)</SelectItem>
                            <SelectItem value="oz">Ounces (oz)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* VARIANTS TAB */}
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Add size, tier, or edition variants with different prices
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={() => openVariantModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {variants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No variants added yet</p>
                    <p className="text-sm">
                      Variants allow different sizes, tiers, or editions
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant, index) => (
                        <TableRow key={variant.id || index}>
                          <TableCell className="font-medium">
                            {variant.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {variant.sku || "-"}
                          </TableCell>
                          <TableCell>₹{variant.price}</TableCell>
                          <TableCell>{variant.stockQuantity}</TableCell>
                          <TableCell>
                            {variant.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={variant.isActive ? "default" : "secondary"}
                            >
                              {variant.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => openVariantModal(variant)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariant(index)}
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
          </TabsContent>

          {/* ADDONS TAB */}
          <TabsContent value="addons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Add-ons</CardTitle>
                    <CardDescription>
                      Optional services or extras customers can add
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={() => openAddonModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Add-on
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No add-ons added yet</p>
                    <p className="text-sm">
                      Add-ons are optional extras like support, installation, etc.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Pricing Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addons.map((addon, index) => (
                        <TableRow key={addon.id || index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{addon.name}</p>
                              {addon.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  {addon.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>₹{addon.price}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {addon.pricingType.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {addon.isRequired && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={addon.isActive ? "default" : "secondary"}
                            >
                              {addon.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => openAddonModal(addon)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAddon(index)}
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
          </TabsContent>

          {/* CONFIGS TAB */}
          <TabsContent value="configs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Configurations</CardTitle>
                    <CardDescription>
                      Configurable options like RAM, storage, users, etc.
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={() => openConfigModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Configuration
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {configs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sliders className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No configurations added yet</p>
                    <p className="text-sm">
                      Configurations let customers customize their purchase
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configs.map((config, index) => (
                      <Card key={config.id || index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{config.name}</h4>
                                <Badge variant="outline">{config.type}</Badge>
                                {config.isRequired && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {config.options.map((opt, optIdx) => (
                                  <Badge key={optIdx} variant="secondary">
                                    {opt.label}
                                    {parseFloat(opt.priceModifier) !== 0 && (
                                      <span className="ml-1 text-xs">
                                        {parseFloat(opt.priceModifier) > 0
                                          ? `+₹${opt.priceModifier}`
                                          : `-₹${Math.abs(parseFloat(opt.priceModifier))}`}
                                      </span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => openConfigModal(config)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeConfig(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
                <CardDescription>
                  Optimize how your product appears in search results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={seoMetadata.metaTitle}
                    onChange={(e) =>
                      setSeoMetadata({ ...seoMetadata, metaTitle: e.target.value })
                    }
                    placeholder={formData.name || "Product name"}
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoMetadata.metaTitle.length || 0}/60 characters (recommended)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={seoMetadata.metaDescription}
                    onChange={(e) =>
                      setSeoMetadata({
                        ...seoMetadata,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder={formData.shortDescription || "Product description"}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoMetadata.metaDescription.length || 0}/160 characters
                    (recommended)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={seoMetadata.metaKeywords}
                    onChange={(e) =>
                      setSeoMetadata({
                        ...seoMetadata,
                        metaKeywords: e.target.value,
                      })
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Preview</CardTitle>
                <CardDescription>
                  Control how the product appears when shared on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">Open Graph Title</Label>
                  <Input
                    id="ogTitle"
                    value={seoMetadata.ogTitle}
                    onChange={(e) =>
                      setSeoMetadata({ ...seoMetadata, ogTitle: e.target.value })
                    }
                    placeholder={seoMetadata.metaTitle || formData.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogDescription">Open Graph Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={seoMetadata.ogDescription}
                    onChange={(e) =>
                      setSeoMetadata({
                        ...seoMetadata,
                        ogDescription: e.target.value,
                      })
                    }
                    placeholder={seoMetadata.metaDescription || formData.shortDescription}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    value={seoMetadata.ogImage}
                    onChange={(e) =>
                      setSeoMetadata({ ...seoMetadata, ogImage: e.target.value })
                    }
                    placeholder={images[0]?.url || "https://..."}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>

      {/* Variant Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVariant?.id ? "Edit Variant" : "Add Variant"}
            </DialogTitle>
            <DialogDescription>
              Configure variant details like name, SKU, and pricing
            </DialogDescription>
          </DialogHeader>
          {editingVariant && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Variant Name *</Label>
                <Input
                  value={editingVariant.name}
                  onChange={(e) =>
                    setEditingVariant({ ...editingVariant, name: e.target.value })
                  }
                  placeholder="e.g., Basic, Pro, Enterprise"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={editingVariant.sku}
                    onChange={(e) =>
                      setEditingVariant({ ...editingVariant, sku: e.target.value })
                    }
                    placeholder="VAR-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={editingVariant.stockQuantity}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        stockQuantity: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingVariant.price}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        price: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compare Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingVariant.compareAtPrice}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        compareAtPrice: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingVariant.costPrice}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        costPrice: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingVariant.isDefault}
                    onCheckedChange={(checked) =>
                      setEditingVariant({ ...editingVariant, isDefault: checked })
                    }
                  />
                  <Label>Default variant</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingVariant.isActive}
                    onCheckedChange={(checked) =>
                      setEditingVariant({ ...editingVariant, isActive: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVariantModal(false);
                setEditingVariant(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveVariant}>Save Variant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Addon Modal */}
      <Dialog open={showAddonModal} onOpenChange={setShowAddonModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddon?.id ? "Edit Add-on" : "Add Add-on"}
            </DialogTitle>
            <DialogDescription>
              Configure add-on service or extra feature
            </DialogDescription>
          </DialogHeader>
          {editingAddon && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Add-on Name *</Label>
                <Input
                  value={editingAddon.name}
                  onChange={(e) =>
                    setEditingAddon({ ...editingAddon, name: e.target.value })
                  }
                  placeholder="e.g., Premium Support, Installation"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingAddon.description}
                  onChange={(e) =>
                    setEditingAddon({
                      ...editingAddon,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this add-on includes..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingAddon.price}
                    onChange={(e) =>
                      setEditingAddon({ ...editingAddon, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pricing Type</Label>
                  <Select
                    value={editingAddon.pricingType}
                    onValueChange={(value) =>
                      setEditingAddon({
                        ...editingAddon,
                        pricingType: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONE_TIME">One-time</SelectItem>
                      <SelectItem value="RECURRING_MONTHLY">
                        Monthly Recurring
                      </SelectItem>
                      <SelectItem value="RECURRING_YEARLY">
                        Yearly Recurring
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingAddon.isRequired}
                    onCheckedChange={(checked) =>
                      setEditingAddon({ ...editingAddon, isRequired: checked })
                    }
                  />
                  <Label>Required</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingAddon.isActive}
                    onCheckedChange={(checked) =>
                      setEditingAddon({ ...editingAddon, isActive: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddonModal(false);
                setEditingAddon(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveAddon}>Save Add-on</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig?.id ? "Edit Configuration" : "Add Configuration"}
            </DialogTitle>
            <DialogDescription>
              Add configurable options for this product
            </DialogDescription>
          </DialogHeader>
          {editingConfig && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Configuration Name *</Label>
                  <Input
                    value={editingConfig.name}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, name: e.target.value })
                    }
                    placeholder="e.g., RAM, Storage, Users"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Input Type</Label>
                  <Select
                    value={editingConfig.type}
                    onValueChange={(value) =>
                      setEditingConfig({
                        ...editingConfig,
                        type: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SELECT">Dropdown</SelectItem>
                      <SelectItem value="RADIO">Radio Buttons</SelectItem>
                      <SelectItem value="CHECKBOX">Checkboxes</SelectItem>
                      <SelectItem value="NUMBER">Number Input</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditingConfig({
                        ...editingConfig,
                        options: [
                          ...editingConfig.options,
                          { value: "", label: "", priceModifier: "0" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingConfig.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => {
                          const newOptions = [...editingConfig.options];
                          newOptions[idx].value = e.target.value;
                          setEditingConfig({
                            ...editingConfig,
                            options: newOptions,
                          });
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...editingConfig.options];
                          newOptions[idx].label = e.target.value;
                          setEditingConfig({
                            ...editingConfig,
                            options: newOptions,
                          });
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Price +/-"
                        value={option.priceModifier}
                        onChange={(e) => {
                          const newOptions = [...editingConfig.options];
                          newOptions[idx].priceModifier = e.target.value;
                          setEditingConfig({
                            ...editingConfig,
                            options: newOptions,
                          });
                        }}
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = editingConfig.options.filter(
                            (_, i) => i !== idx
                          );
                          setEditingConfig({
                            ...editingConfig,
                            options: newOptions,
                          });
                        }}
                        disabled={editingConfig.options.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Value</Label>
                  <Select
                    value={editingConfig.defaultValue}
                    onValueChange={(value) =>
                      setEditingConfig({ ...editingConfig, defaultValue: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingConfig.options
                        .filter((o) => o.value)
                        .map((opt, idx) => (
                          <SelectItem key={idx} value={opt.value}>
                            {opt.label || opt.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingConfig.isRequired}
                      onCheckedChange={(checked) =>
                        setEditingConfig({
                          ...editingConfig,
                          isRequired: checked,
                        })
                      }
                    />
                    <Label>Required</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfigModal(false);
                setEditingConfig(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveConfig}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
