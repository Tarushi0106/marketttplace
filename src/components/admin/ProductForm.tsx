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
  specifications: Record<string, string>;
  // Billing type: ONE_TIME or RECURRING
  billingType: "ONE_TIME" | "RECURRING";
  // One-time setup fee
  setupFee: string;
  // Recurring prices
  monthlyPrice: string;
  biMonthlyPrice: string;
  quarterlyPrice: string;
  fourMonthlyPrice: string;
  semiAnnualPrice: string;
  triAnnualPrice: string;
  yearlyPrice: string;
  biennialPrice: string;
  triennialPrice: string;
  // Recurring setup fees
  monthlySetupFee: string;
  biMonthlySetupFee: string;
  quarterlySetupFee: string;
  fourMonthlySetupFee: string;
  semiAnnualSetupFee: string;
  triAnnualSetupFee: string;
  yearlySetupFee: string;
  biennialSetupFee: string;
  triennialSetupFee: string;
  // Recurring cost prices
  monthlyCostPrice: string;
  biMonthlyCostPrice: string;
  quarterlyCostPrice: string;
  fourMonthlyCostPrice: string;
  semiAnnualCostPrice: string;
  triAnnualCostPrice: string;
  yearlyCostPrice: string;
  biennialCostPrice: string;
  triennialCostPrice: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ProductConfigOption {
  value: string;
  label?: string;
  priceModifier: string;
  monthlyPriceModifier?: string;
  yearlyPriceModifier?: string;
  description?: string;
  isPercentage?: boolean;
  modifierType?: "ADD" | "MULTIPLY" | "REPLACE";
  sortOrder?: number;
  isAvailable?: boolean;
  stockStatus?: string;
}

interface ProductConfig {
  id?: string;
  name: string;
  configType: string; // e.g., CPU, RAM, STORAGE, OS, DATA_CENTER, GPU, BANDWIDTH, USERS, etc.
  inputType: "SELECT" | "RADIO" | "CHECKBOX" | "NUMBER" | "SLIDER";
  options: ProductConfigOption[];
  isRequired: boolean;
  defaultValue: string;
  sortOrder: number;
  // Additional fields
  displayName?: string;
  description?: string;
  unit?: string;
  unitPlural?: string;
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
  allowCustom?: boolean;
  basePrice?: string;
  pricePerUnit?: string;
}

interface ProductAddon {
  id?: string;
  name: string;
  description?: string;
  price: string;
  unit?: string;
  pricingType: "ONE_TIME" | "RECURRING_MONTHLY" | "RECURRING_YEARLY";
  isRequired: boolean;
  isActive: boolean;
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
  
  // Product Type - One-time or Recurring
  isRecurring: boolean;
  
  // Per-Billing-Cycle Setup Fees
  monthlySetupFee: string;
  biMonthlySetupFee: string;
  quarterlySetupFee: string;
  fourMonthlySetupFee: string;
  semiAnnualSetupFee: string;
  triAnnualSetupFee: string;
  yearlySetupFee: string;
  biennialSetupFee: string;
  triennialSetupFee: string;
  
  // Recurring Prices
  monthlyPrice: string;
  biMonthlyPrice: string;
  quarterlyPrice: string;
  fourMonthlyPrice: string;
  semiAnnualPrice: string;
  triAnnualPrice: string;
  yearlyPrice: string;
  biennialPrice: string;
  triennialPrice: string;
  
  // Savings
  monthlySavings: string;
  quarterlySavings: string;
  yearlySavings: string;
  
  categoryId: string;
  subCategoryId: string;
  productType: "STANDALONE" | "CONFIGURABLE" | "BUNDLE";
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
    
    // Product Type - One-time or Recurring
    isRecurring: false,
    
    // Per-Billing-Cycle Setup Fees
    monthlySetupFee: "",
    biMonthlySetupFee: "",
    quarterlySetupFee: "",
    fourMonthlySetupFee: "",
    semiAnnualSetupFee: "",
    triAnnualSetupFee: "",
    yearlySetupFee: "",
    biennialSetupFee: "",
    triennialSetupFee: "",
    
    // Recurring Prices
    monthlyPrice: "",
    biMonthlyPrice: "",
    quarterlyPrice: "",
    fourMonthlyPrice: "",
    semiAnnualPrice: "",
    triAnnualPrice: "",
    yearlyPrice: "",
    biennialPrice: "",
    triennialPrice: "",
    
    // Savings
    monthlySavings: "",
    quarterlySavings: "",
    yearlySavings: "",
    
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
  const [configs, setConfigs] = useState<ProductConfig[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
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
  const [newVariantSpecKey, setNewVariantSpecKey] = useState("");
  const [newVariantSpecValue, setNewVariantSpecValue] = useState("");
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProductConfig | null>(null);
  const [editingAddon, setEditingAddon] = useState<ProductAddon | null>(null);
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

      console.log("API Response:", data);

      if (data.data) {
        const product = data.data;
        console.log("Product data:", product);
        console.log("Base price:", product.basePrice);
        console.log("Recurring prices:", product.recurringPrices);
        
        // Get recurring prices from the recurringPrices array (first entry for base product, no variant)
        const recurringPrices = product.recurringPrices || [];
        console.log("Extracted recurring prices:", recurringPrices);
        const baseRecurringPrice = recurringPrices.find((rp: any) => !rp.variantId) || recurringPrices[0] || {};
        console.log("Base recurring price:", baseRecurringPrice);
        
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
          
          // Product Type - One-time or Recurring
          isRecurring: product.isRecurring || false,
          
          // Per-Billing-Cycle Setup Fees (from recurringPrices array)
          monthlySetupFee: baseRecurringPrice.monthlySetupFee?.toString() || product.monthlySetupFee?.toString() || "",
          biMonthlySetupFee: baseRecurringPrice.biMonthlySetupFee?.toString() || product.biMonthlySetupFee?.toString() || "",
          quarterlySetupFee: baseRecurringPrice.quarterlySetupFee?.toString() || product.quarterlySetupFee?.toString() || "",
          fourMonthlySetupFee: baseRecurringPrice.fourMonthlySetupFee?.toString() || product.fourMonthlySetupFee?.toString() || "",
          semiAnnualSetupFee: baseRecurringPrice.semiAnnualSetupFee?.toString() || product.semiAnnualSetupFee?.toString() || "",
          triAnnualSetupFee: baseRecurringPrice.triAnnualSetupFee?.toString() || product.triAnnualSetupFee?.toString() || "",
          yearlySetupFee: baseRecurringPrice.yearlySetupFee?.toString() || product.yearlySetupFee?.toString() || "",
          biennialSetupFee: baseRecurringPrice.biennialSetupFee?.toString() || product.biennialSetupFee?.toString() || "",
          triennialSetupFee: baseRecurringPrice.triennialSetupFee?.toString() || product.triennialSetupFee?.toString() || "",
          
          // Recurring Prices (from recurringPrices array or directly on product)
          monthlyPrice: baseRecurringPrice.monthlyPrice?.toString() || product.monthlyPrice?.toString() || "",
          biMonthlyPrice: baseRecurringPrice.biMonthlyPrice?.toString() || product.biMonthlyPrice?.toString() || "",
          quarterlyPrice: baseRecurringPrice.quarterlyPrice?.toString() || product.quarterlyPrice?.toString() || "",
          fourMonthlyPrice: baseRecurringPrice.fourMonthlyPrice?.toString() || product.fourMonthlyPrice?.toString() || "",
          semiAnnualPrice: baseRecurringPrice.semiAnnualPrice?.toString() || product.semiAnnualPrice?.toString() || "",
          triAnnualPrice: baseRecurringPrice.triAnnualPrice?.toString() || product.triAnnualPrice?.toString() || "",
          yearlyPrice: baseRecurringPrice.yearlyPrice?.toString() || product.yearlyPrice?.toString() || "",
          biennialPrice: baseRecurringPrice.biennialPrice?.toString() || product.biennialPrice?.toString() || "",
          triennialPrice: baseRecurringPrice.triennialPrice?.toString() || product.triennialPrice?.toString() || "",
          
          // Savings (from recurringPrices array or directly on product)
          monthlySavings: baseRecurringPrice.monthlySavings?.toString() || product.monthlySavings?.toString() || "",
          quarterlySavings: baseRecurringPrice.quarterlySavings?.toString() || product.quarterlySavings?.toString() || "",
          yearlySavings: baseRecurringPrice.yearlySavings?.toString() || product.yearlySavings?.toString() || "",
          
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
            product.variants.map((v: any) => {
              // Get variant-specific recurring prices from the recurringPrices array
              const variantRecurringPrices = v.recurringPrices?.find((rp: any) => rp.variantId === v.id) || v.recurringPrices?.[0] || {};
              
              // Extract billingType from attributes (where it's stored)
              const variantAttributes = v.attributes as Record<string, any> || {};
              const billingType = variantAttributes.billingType || "RECURRING";
              const setupFee = variantAttributes.setupFee || v.setupFee?.toString() || "";
              
              // Reserved keys that should NOT be included in specifications
              const reservedKeys = [
                'billingType', 'setupFee',
                'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
                'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
                'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
                'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee',
                'monthlyCostPrice', 'biMonthlyCostPrice', 'quarterlyCostPrice', 'fourMonthlyCostPrice',
                'semiAnnualCostPrice', 'triAnnualCostPrice', 'yearlyCostPrice', 'biennialCostPrice', 'triennialCostPrice'
              ];
              
              // Extract specifications from attributes, excluding reserved keys
              const specifications: Record<string, string> = {};
              for (const [key, value] of Object.entries(variantAttributes)) {
                if (!reservedKeys.includes(key)) {
                  specifications[key] = value as string;
                }
              }
              
              return {
                id: v.id,
                name: v.name,
                sku: v.sku || "",
                price: v.price?.toString() || "",
                compareAtPrice: v.compareAtPrice?.toString() || "",
                costPrice: v.costPrice?.toString() || "",
                stockQuantity: v.stockQuantity?.toString() || "0",
                attributes: v.attributes || {},
                // Extract specifications from attributes (excluding reserved keys)
                specifications: specifications,
                billingType: billingType,
                setupFee: setupFee?.toString() || variantRecurringPrices.monthlySetupFee?.toString() || "",
                monthlyPrice: v.monthlyPrice?.toString() || variantRecurringPrices.monthlyPrice?.toString() || "",
                biMonthlyPrice: v.biMonthlyPrice?.toString() || variantRecurringPrices.biMonthlyPrice?.toString() || "",
                quarterlyPrice: v.quarterlyPrice?.toString() || variantRecurringPrices.quarterlyPrice?.toString() || "",
                fourMonthlyPrice: v.fourMonthlyPrice?.toString() || variantRecurringPrices.fourMonthlyPrice?.toString() || "",
                semiAnnualPrice: v.semiAnnualPrice?.toString() || variantRecurringPrices.semiAnnualPrice?.toString() || "",
                triAnnualPrice: v.triAnnualPrice?.toString() || variantRecurringPrices.triAnnualPrice?.toString() || "",
                yearlyPrice: v.yearlyPrice?.toString() || variantRecurringPrices.yearlyPrice?.toString() || "",
                biennialPrice: v.biennialPrice?.toString() || variantRecurringPrices.biennialPrice?.toString() || "",
                triennialPrice: v.triennialPrice?.toString() || variantRecurringPrices.triennialPrice?.toString() || "",
                // Setup fees
                monthlySetupFee: v.monthlySetupFee?.toString() || variantRecurringPrices.monthlySetupFee?.toString() || "",
                biMonthlySetupFee: v.biMonthlySetupFee?.toString() || variantRecurringPrices.biMonthlySetupFee?.toString() || "",
                fourMonthlySetupFee: v.fourMonthlySetupFee?.toString() || variantRecurringPrices.fourMonthlySetupFee?.toString() || "",
                quarterlySetupFee: v.quarterlySetupFee?.toString() || variantRecurringPrices.quarterlySetupFee?.toString() || "",
                semiAnnualSetupFee: v.semiAnnualSetupFee?.toString() || variantRecurringPrices.semiAnnualSetupFee?.toString() || "",
                triAnnualSetupFee: v.triAnnualSetupFee?.toString() || variantRecurringPrices.triAnnualSetupFee?.toString() || "",
                yearlySetupFee: v.yearlySetupFee?.toString() || variantRecurringPrices.yearlySetupFee?.toString() || "",
                biennialSetupFee: v.biennialSetupFee?.toString() || variantRecurringPrices.biennialSetupFee?.toString() || "",
                triennialSetupFee: v.triennialSetupFee?.toString() || variantRecurringPrices.triennialSetupFee?.toString() || "",
                // Cost prices
                monthlyCostPrice: v.monthlyCostPrice?.toString() || variantRecurringPrices.monthlyCostPrice?.toString() || "",
                biMonthlyCostPrice: v.biMonthlyCostPrice?.toString() || variantRecurringPrices.biMonthlyCostPrice?.toString() || "",
                quarterlyCostPrice: v.quarterlyCostPrice?.toString() || variantRecurringPrices.quarterlyCostPrice?.toString() || "",
                fourMonthlyCostPrice: v.fourMonthlyCostPrice?.toString() || variantRecurringPrices.fourMonthlyCostPrice?.toString() || "",
                semiAnnualCostPrice: v.semiAnnualCostPrice?.toString() || variantRecurringPrices.semiAnnualCostPrice?.toString() || "",
                triAnnualCostPrice: v.triAnnualCostPrice?.toString() || variantRecurringPrices.triAnnualCostPrice?.toString() || "",
                yearlyCostPrice: v.yearlyCostPrice?.toString() || variantRecurringPrices.yearlyCostPrice?.toString() || "",
                biennialCostPrice: v.biennialCostPrice?.toString() || variantRecurringPrices.biennialCostPrice?.toString() || "",
                triennialCostPrice: v.triennialCostPrice?.toString() || variantRecurringPrices.triennialCostPrice?.toString() || "",
                isDefault: v.isDefault || false,
                isActive: v.isActive ?? true,
                sortOrder: v.sortOrder || 0,
              };
            })
          );
        }

        // Set configs
        if (product.configs) {
          setConfigs(
            product.configs.map((c: any) => ({
              id: c.id,
              name: c.name,
              configType: c.configType || "STANDARD",
              inputType: c.inputType || "SELECT",
              options: (c.options || []).map((o: any) => ({
                value: o.value || "",
                label: o.label || o.value || "",
                priceModifier: o.priceModifier?.toString() || "0",
                monthlyPriceModifier: o.monthlyPriceModifier?.toString() || o.priceModifier?.toString() || "0",
                yearlyPriceModifier: o.yearlyPriceModifier?.toString() || o.priceModifier?.toString() || "0",
              })),
              isRequired: c.isRequired || false,
              defaultValue: c.defaultValue || "",
              sortOrder: c.sortOrder || 0,
              // Additional fields
              displayName: c.displayName || "",
              description: c.description || "",
              unit: c.unit || "",
              unitPlural: c.unitPlural || "",
              minValue: c.minValue,
              maxValue: c.maxValue,
              stepValue: c.stepValue,
              allowCustom: c.allowCustom || false,
              basePrice: c.basePrice?.toString() || "",
              pricePerUnit: c.pricePerUnit?.toString() || "",
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

  // Variant specification management for modal
  function addVariantSpecification() {
    if (!editingVariant) return;
    if (newVariantSpecKey.trim() && newVariantSpecValue.trim()) {
      setEditingVariant({
        ...editingVariant,
        specifications: {
          ...editingVariant.specifications,
          [newVariantSpecKey.trim()]: newVariantSpecValue.trim(),
        },
      });
      setNewVariantSpecKey("");
      setNewVariantSpecValue("");
    }
  }

  function removeVariantSpecification(key: string) {
    if (!editingVariant) return;
    const newSpecs = { ...editingVariant.specifications };
    delete newSpecs[key];
    setEditingVariant({
      ...editingVariant,
      specifications: newSpecs,
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
        specifications: {},
        billingType: "ONE_TIME",
        setupFee: "",
        monthlyPrice: "",
        biMonthlyPrice: "",
        quarterlyPrice: "",
        fourMonthlyPrice: "",
        semiAnnualPrice: "",
        triAnnualPrice: "",
        yearlyPrice: "",
        biennialPrice: "",
        triennialPrice: "",
        monthlySetupFee: "",
        biMonthlySetupFee: "",
        quarterlySetupFee: "",
        fourMonthlySetupFee: "",
        semiAnnualSetupFee: "",
        triAnnualSetupFee: "",
        yearlySetupFee: "",
        biennialSetupFee: "",
        triennialSetupFee: "",
        monthlyCostPrice: "",
        biMonthlyCostPrice: "",
        quarterlyCostPrice: "",
        fourMonthlyCostPrice: "",
        semiAnnualCostPrice: "",
        triAnnualCostPrice: "",
        yearlyCostPrice: "",
        biennialCostPrice: "",
        triennialCostPrice: "",
        isDefault: variants.length === 0,
        isActive: true,
        sortOrder: variants.length,
      });
    }
    setShowVariantModal(true);
  }

  async function saveVariant() {
    if (!editingVariant || !editingVariant.name) return;

    // For RECURRING billing, set the price field from monthlyPrice (for storefront display)
    let updatedVariant = { ...editingVariant };
    if (editingVariant.billingType === "RECURRING" && editingVariant.monthlyPrice) {
      updatedVariant.price = editingVariant.monthlyPrice;
    }

    if (updatedVariant.id) {
      setVariants((prev) =>
        prev.map((v) => (v.id === updatedVariant.id ? updatedVariant : v))
      );
      
      // Save variant recurring prices to ProductRecurringPrice table
      // Check billingType from both direct property and attributes
      const variantBillingType = updatedVariant.billingType || (updatedVariant.attributes as any)?.billingType || "RECURRING";
      if (isEdit && variantBillingType === "RECURRING") {
        try {
          const variant = updatedVariant as any;
          const recurringPayload = {
            monthlyPrice: variant.monthlyPrice ? parseFloat(variant.monthlyPrice) : null,
            biMonthlyPrice: updatedVariant.biMonthlyPrice ? parseFloat(updatedVariant.biMonthlyPrice) : null,
            quarterlyPrice: variant.quarterlyPrice ? parseFloat(variant.quarterlyPrice) : null,
            fourMonthlyPrice: variant.fourMonthlyPrice ? parseFloat(variant.fourMonthlyPrice) : null,
            semiAnnualPrice: variant.semiAnnualPrice ? parseFloat(variant.semiAnnualPrice) : null,
            triAnnualPrice: variant.triAnnualPrice ? parseFloat(variant.triAnnualPrice) : null,
            yearlyPrice: variant.yearlyPrice ? parseFloat(variant.yearlyPrice) : null,
            biennialPrice: variant.biennialPrice ? parseFloat(variant.biennialPrice) : null,
            triennialPrice: variant.triennialPrice ? parseFloat(variant.triennialPrice) : null,
            // All setup fees
            monthlySetupFee: variant.monthlySetupFee ? parseFloat(variant.monthlySetupFee) : null,
            biMonthlySetupFee: variant.biMonthlySetupFee ? parseFloat(variant.biMonthlySetupFee) : null,
            quarterlySetupFee: variant.quarterlySetupFee ? parseFloat(variant.quarterlySetupFee) : null,
            fourMonthlySetupFee: variant.fourMonthlySetupFee ? parseFloat(variant.fourMonthlySetupFee) : null,
            semiAnnualSetupFee: variant.semiAnnualSetupFee ? parseFloat(variant.semiAnnualSetupFee) : null,
            triAnnualSetupFee: variant.triAnnualSetupFee ? parseFloat(variant.triAnnualSetupFee) : null,
            yearlySetupFee: variant.yearlySetupFee ? parseFloat(variant.yearlySetupFee) : null,
            biennialSetupFee: variant.biennialSetupFee ? parseFloat(variant.biennialSetupFee) : null,
            triennialSetupFee: variant.triennialSetupFee ? parseFloat(variant.triennialSetupFee) : null,
          };
          
          console.log(`Saving recurring prices for variant ${variant.id}:`, recurringPayload);
          
          await fetch(`/api/products/${productId}/recurring-prices?variantId=${variant.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recurringPayload),
          });
        } catch (error) {
          console.error("Error saving variant recurring prices:", error);
        }
      }
    } else {
      setVariants((prev) => [...prev, updatedVariant]);
    }
    setShowVariantModal(false);
    setEditingVariant(null);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // Config management
  function openConfigModal(config?: ProductConfig) {
    if (config) {
      setEditingConfig(config);
    } else {
      setEditingConfig({
        name: "",
        configType: "STANDARD",
        inputType: "SELECT",
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

    // Auto-generate value from label if value is empty
    const processedConfig = {
      ...editingConfig,
      options: editingConfig.options.map((opt) => ({
        ...opt,
        // If value is empty but label exists, generate value from label
        value: opt.value?.trim() || opt.label?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || '',
        // If label is empty but value exists, use value as label
        label: opt.label?.trim() || opt.value || '',
      })).filter((opt) => opt.value && opt.value.trim() !== ''), // Remove options with no value
    };

    if (editingConfig.id) {
      setConfigs((prev) =>
        prev.map((c) => (c.id === editingConfig.id ? processedConfig : c))
      );
    } else {
      setConfigs((prev) => [...prev, processedConfig]);
    }
    setShowConfigModal(false);
    setEditingConfig(null);
  }

  function removeConfig(index: number) {
    setConfigs((prev) => prev.filter((_, i) => i !== index));
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
        unit: "",
        pricingType: "ONE_TIME",
        isRequired: false,
        isActive: true,
      });
    }
    setShowAddonModal(true);
  }

  function saveAddon() {
    if (!editingAddon || !editingAddon.name) return;
    
    if (editingAddon.id) {
      // Update existing
      setAddons((prev) =>
        prev.map((a) => (a.id === editingAddon.id ? editingAddon : a))
      );
    } else {
      // Add new
      setAddons((prev) => [...prev, { ...editingAddon, id: `new-${Date.now()}` }]);
    }
    setShowAddonModal(false);
    setEditingAddon(null);
  }

  function removeAddon(id: string) {
    setAddons((prev) => prev.filter((a) => a.id !== id));
  }

  // Form submission
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);

    try {
      // Build main product payload (without recurring prices - they go to separate endpoint)
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : null,
        
        // Product Type - One-time or Recurring
        isRecurring: formData.isRecurring,
        
        // Per-Billing-Cycle Setup Fees (only for recurring products - using quarterly as default)
        setupFee: formData.quarterlySetupFee ? parseFloat(formData.quarterlySetupFee) : null,
        
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
        variants: variants.map((v, idx) => {
          // Reserved keys that should NOT be in specifications
          const reservedKeys = [
            'billingType', 'setupFee',
            'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
            'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
            'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
            'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
          ];
          
          // Filter out reserved keys from specifications
          const cleanSpecs: Record<string, string> = {};
          for (const [key, value] of Object.entries(v.specifications || {})) {
            if (!reservedKeys.includes(key)) {
              cleanSpecs[key] = value as string;
            }
          }
          
          // For RECURRING billing, use monthlyPrice as the variant price (for storefront display)
          // For ONE_TIME billing, use the price field directly
          const variantPrice = v.billingType === "RECURRING" 
            ? (v.monthlyPrice ? parseFloat(v.monthlyPrice) : parseFloat(v.price) || 0)
            : parseFloat(v.price) || 0;
          
          return {
            ...v,
            price: variantPrice,
            compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
            costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
            stockQuantity: parseInt(v.stockQuantity) || 0,
            sortOrder: idx,
            // Store billingType and setupFee in attributes
            attributes: {
              // Add billingType
              billingType: v.billingType || "RECURRING",
              // Add setupFee for ONE_TIME billing
              ...(v.billingType === "ONE_TIME" && v.setupFee ? { setupFee: v.setupFee } : {}),
            },
            // Send specifications as a separate field (API will merge it with attributes)
            specifications: cleanSpecs,
          };
        }),
        configs: configs.map((c, idx) => ({
          ...c,
          options: c.options.map((o) => ({
            ...o,
            priceModifier: parseFloat(o.priceModifier) || 0,
            monthlyPriceModifier: o.monthlyPriceModifier ? parseFloat(o.monthlyPriceModifier) : null,
            yearlyPriceModifier: o.yearlyPriceModifier ? parseFloat(o.yearlyPriceModifier) : null,
          })),
          sortOrder: idx,
        })),
        seoMetadata,
      };

      const url = isEdit ? `/api/products/${productId}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      // First save the main product
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} product`);
      }

      // If recurring prices are provided, save them to the separate endpoint
      if (formData.isRecurring && isEdit) {
        const recurringPayload = {
          monthlyPrice: formData.monthlyPrice ? parseFloat(formData.monthlyPrice) : null,
          biMonthlyPrice: formData.biMonthlyPrice ? parseFloat(formData.biMonthlyPrice) : null,
          quarterlyPrice: formData.quarterlyPrice ? parseFloat(formData.quarterlyPrice) : null,
          fourMonthlyPrice: formData.fourMonthlyPrice ? parseFloat(formData.fourMonthlyPrice) : null,
          semiAnnualPrice: formData.semiAnnualPrice ? parseFloat(formData.semiAnnualPrice) : null,
          triAnnualPrice: formData.triAnnualPrice ? parseFloat(formData.triAnnualPrice) : null,
          yearlyPrice: formData.yearlyPrice ? parseFloat(formData.yearlyPrice) : null,
          biennialPrice: formData.biennialPrice ? parseFloat(formData.biennialPrice) : null,
          triennialPrice: formData.triennialPrice ? parseFloat(formData.triennialPrice) : null,
          monthlySavings: formData.monthlySavings ? parseFloat(formData.monthlySavings) : null,
          quarterlySavings: formData.quarterlySavings ? parseFloat(formData.quarterlySavings) : null,
          yearlySavings: formData.yearlySavings ? parseFloat(formData.yearlySavings) : null,
          monthlySetupFee: formData.monthlySetupFee ? parseFloat(formData.monthlySetupFee) : null,
          biMonthlySetupFee: formData.biMonthlySetupFee ? parseFloat(formData.biMonthlySetupFee) : null,
          quarterlySetupFee: formData.quarterlySetupFee ? parseFloat(formData.quarterlySetupFee) : null,
          fourMonthlySetupFee: formData.fourMonthlySetupFee ? parseFloat(formData.fourMonthlySetupFee) : null,
          semiAnnualSetupFee: formData.semiAnnualSetupFee ? parseFloat(formData.semiAnnualSetupFee) : null,
          triAnnualSetupFee: formData.triAnnualSetupFee ? parseFloat(formData.triAnnualSetupFee) : null,
          yearlySetupFee: formData.yearlySetupFee ? parseFloat(formData.yearlySetupFee) : null,
          biennialSetupFee: formData.biennialSetupFee ? parseFloat(formData.biennialSetupFee) : null,
          triennialSetupFee: formData.triennialSetupFee ? parseFloat(formData.triennialSetupFee) : null,
        };

        const recurringResponse = await fetch(`/api/products/${productId}/recurring-prices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recurringPayload),
        });

        if (!recurringResponse.ok) {
          const recurringData = await recurringResponse.json();
          console.error("Failed to save recurring prices:", recurringData.error);
        }
        
        // Save variant recurring prices for existing variants
        for (const variant of variants as any[]) {
          // Check billingType from both direct property and attributes
          const variantBillingType = variant.billingType || (variant.attributes as any)?.billingType || "RECURRING";
          if (variant.id && variantBillingType === "RECURRING") {
            try {
              const variantRecurringPayload = {
                monthlyPrice: variant.monthlyPrice ? parseFloat(variant.monthlyPrice) : null,
                biMonthlyPrice: variant.biMonthlyPrice ? parseFloat(variant.biMonthlyPrice) : null,
                quarterlyPrice: variant.quarterlyPrice ? parseFloat(variant.quarterlyPrice) : null,
                fourMonthlyPrice: variant.fourMonthlyPrice ? parseFloat(variant.fourMonthlyPrice) : null,
                semiAnnualPrice: variant.semiAnnualPrice ? parseFloat(variant.semiAnnualPrice) : null,
                triAnnualPrice: variant.triAnnualPrice ? parseFloat(variant.triAnnualPrice) : null,
                yearlyPrice: variant.yearlyPrice ? parseFloat(variant.yearlyPrice) : null,
                biennialPrice: variant.biennialPrice ? parseFloat(variant.biennialPrice) : null,
                triennialPrice: variant.triennialPrice ? parseFloat(variant.triennialPrice) : null,
                // All setup fees
                monthlySetupFee: variant.monthlySetupFee ? parseFloat(variant.monthlySetupFee) : null,
                biMonthlySetupFee: variant.biMonthlySetupFee ? parseFloat(variant.biMonthlySetupFee) : null,
                quarterlySetupFee: variant.quarterlySetupFee ? parseFloat(variant.quarterlySetupFee) : null,
                fourMonthlySetupFee: variant.fourMonthlySetupFee ? parseFloat(variant.fourMonthlySetupFee) : null,
                semiAnnualSetupFee: variant.semiAnnualSetupFee ? parseFloat(variant.semiAnnualSetupFee) : null,
                triAnnualSetupFee: variant.triAnnualSetupFee ? parseFloat(variant.triAnnualSetupFee) : null,
                yearlySetupFee: variant.yearlySetupFee ? parseFloat(variant.yearlySetupFee) : null,
                biennialSetupFee: variant.biennialSetupFee ? parseFloat(variant.biennialSetupFee) : null,
                triennialSetupFee: variant.triennialSetupFee ? parseFloat(variant.triennialSetupFee) : null,
                // Cost prices
              };
              
              console.log(`Saving recurring prices for variant ${variant.id}:`, variantRecurringPayload);
              
              await fetch(`/api/products/${productId}/recurring-prices?variantId=${variant.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(variantRecurringPayload),
              });
            } catch (error) {
              console.error(`Error saving variant ${variant.id} recurring prices:`, error);
            }
          }
        }
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
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="basic" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden lg:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden lg:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className="gap-2"
              disabled={formData.productType === "CONFIGURABLE"}
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline">Pricing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="variants" 
              className="gap-2"
              disabled={formData.productType === "STANDALONE"}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">Variants</span>
            </TabsTrigger>
            <TabsTrigger value="variable" className="gap-2">
              <Sliders className="h-4 w-4" />
              <span className="hidden lg:inline">Variable</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="gap-2">
              <Puzzle className="h-4 w-4" />
              <span className="hidden lg:inline">Addons</span>
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
                            <SelectItem value="CONFIGURABLE">Variable</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {formData.productType === "STANDALONE" &&
                            "Basic product with optional variants"}
                          {formData.productType === "CONFIGURABLE" &&
                            "Product with variable options"}
                        </p>
                      </div>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {/* Specifications for STANDALONE products */}
            {formData.productType === "STANDALONE" && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                  <CardDescription>
                    Product specifications displayed on the product page (e.g., CPU, RAM)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing specifications */}
                  {formData.specifications.length > 0 && (
                    <div className="space-y-2">
                      {formData.specifications.map((spec, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-muted p-3 rounded-lg"
                        >
                          <span className="font-medium flex-1">{spec.key}</span>
                          <span className="text-muted-foreground flex-1">{spec.value}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSpecification(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new specification */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Name (e.g., CPU)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., INTEL)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSpecification}
                      disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set product pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">
                        Base Price (Rs) <span className="text-red-500">*</span>
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
                      <Label htmlFor="compareAtPrice">Compare at Price (Rs)</Label>
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
                      <Label htmlFor="costPrice">Cost Price (Rs)</Label>
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

              {/* Recurring Prices */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recurring Pricing</CardTitle>
                  <CardDescription>Set up recurring billing for subscription products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable Recurring Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable Recurring Billing</Label>
                      <p className="text-sm text-muted-foreground">
                        Turn on to offer subscription plans for this product
                      </p>
                    </div>
                    <Switch
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isRecurring: checked })
                      }
                    />
                  </div>

                  {formData.isRecurring && (
                    <>
                      {/* Billing Cycle Prices with Setup Fees */}
                      <div className="space-y-4">
                        <Label className="text-base">Billing Cycle Prices & Setup Fees (Rs)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Monthly */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Monthly</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="monthlyPrice" className="text-xs">Price</Label>
                                <Input
                                  id="monthlyPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.monthlyPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, monthlyPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="monthlySetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="monthlySetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.monthlySetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, monthlySetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Bi-Monthly */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Bi-Monthly (2 mo)</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="biMonthlyPrice" className="text-xs">Price</Label>
                                <Input
                                  id="biMonthlyPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.biMonthlyPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, biMonthlyPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="biMonthlySetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="biMonthlySetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.biMonthlySetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, biMonthlySetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Quarterly */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Quarterly</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="quarterlyPrice" className="text-xs">Price</Label>
                                <Input
                                  id="quarterlyPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.quarterlyPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, quarterlyPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="quarterlySetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="quarterlySetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.quarterlySetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, quarterlySetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Four-Monthly */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Four-Monthly</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="fourMonthlyPrice" className="text-xs">Price</Label>
                                <Input
                                  id="fourMonthlyPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.fourMonthlyPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, fourMonthlyPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="fourMonthlySetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="fourMonthlySetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.fourMonthlySetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, fourMonthlySetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Semi-Annual */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Semi-Annual (6 mo)</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="semiAnnualPrice" className="text-xs">Price</Label>
                                <Input
                                  id="semiAnnualPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.semiAnnualPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, semiAnnualPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="semiAnnualSetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="semiAnnualSetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.semiAnnualSetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, semiAnnualSetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Tri-Annual */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Tri-Annual (3x/yr)</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="triAnnualPrice" className="text-xs">Price</Label>
                                <Input
                                  id="triAnnualPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.triAnnualPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, triAnnualPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="triAnnualSetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="triAnnualSetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.triAnnualSetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, triAnnualSetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Yearly */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Yearly</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="yearlyPrice" className="text-xs">Price</Label>
                                <Input
                                  id="yearlyPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.yearlyPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, yearlyPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="yearlySetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="yearlySetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.yearlySetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, yearlySetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Biennial */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Biennial (2 yrs)</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="biennialPrice" className="text-xs">Price</Label>
                                <Input
                                  id="biennialPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.biennialPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, biennialPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="biennialSetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="biennialSetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.biennialSetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, biennialSetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Triennial */}
                          <div className="border rounded-lg p-4 space-y-2">
                            <Label className="text-sm font-medium">Triennial (3 yrs)</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="triennialPrice" className="text-xs">Price</Label>
                                <Input
                                  id="triennialPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.triennialPrice || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, triennialPrice: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label htmlFor="triennialSetupFee" className="text-xs">Setup Fee</Label>
                                <Input
                                  id="triennialSetupFee"
                                  type="number"
                                  step="0.01"
                                  value={formData.triennialSetupFee || ""}
                                  onChange={(e) =>
                                    setFormData({ ...formData, triennialSetupFee: e.target.value })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Savings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="monthlySavings">Monthly Savings (%)</Label>
                          <Input
                            id="monthlySavings"
                            type="number"
                            step="0.01"
                            value={formData.monthlySavings || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, monthlySavings: e.target.value })
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quarterlySavings">Quarterly Savings (%)</Label>
                          <Input
                            id="quarterlySavings"
                            type="number"
                            step="0.01"
                            value={formData.quarterlySavings || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, quarterlySavings: e.target.value })
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearlySavings">Yearly Savings (%)</Label>
                          <Input
                            id="yearlySavings"
                            type="number"
                            step="0.01"
                            value={formData.yearlySavings || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, yearlySavings: e.target.value })
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </>
                  )}
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
                          <TableCell>
                            {variant.billingType === "RECURRING" ? (
                              <span>
                                {variant.monthlyPrice ? `₹${parseFloat(variant.monthlyPrice).toLocaleString()}/mo` : 
                                 variant.yearlyPrice ? `₹${parseFloat(variant.yearlyPrice).toLocaleString()}/yr` : 
                                 variant.price ? `₹${parseFloat(variant.price).toLocaleString()}` : "-"}
                              </span>
                            ) : (
                              <span>
                                {variant.price ? `₹${parseFloat(variant.price).toLocaleString()}` : "-"}
                                {variant.setupFee && parseFloat(variant.setupFee) > 0 && (
                                  <span className="text-muted-foreground text-xs block">+₹{parseFloat(variant.setupFee).toLocaleString()} setup</span>
                                )}
                              </span>
                            )}
                          </TableCell>
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
                        <TableHead>Rate</TableHead>
                        <TableHead>Unit</TableHead>
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
                          <TableCell>Rs {addon.price}</TableCell>
                          <TableCell>
                            {addon.unit && (
                              <Badge variant="outline">{addon.unit}</Badge>
                            )}
                          </TableCell>
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
                                onClick={() => removeAddon(addon.id || "")}
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

          {/* VARIABLE TAB */}
          <TabsContent value="variable" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Variables</CardTitle>
                    <CardDescription>
                      Variable options like RAM, storage, users, etc.
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={() => openConfigModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variable
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {configs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sliders className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No variables added yet</p>
                    <p className="text-sm">
                      Variables let customers customize their purchase
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
                                <Badge variant="outline">{config.configType}</Badge>
                                <Badge variant="secondary">{config.inputType}</Badge>
                                {config.isRequired && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {config.options.map((opt, optIdx) => (
                                  <Badge key={optIdx} variant="secondary" className="flex flex-col items-start py-1 px-2">
                                    <span>{opt.label}</span>
                                    <span className="text-xs opacity-75">
                                      M: {parseFloat(opt.monthlyPriceModifier || opt.priceModifier) !== 0 
                                        ? (parseFloat(opt.monthlyPriceModifier || opt.priceModifier) > 0 ? '+' : '') + `Rs ${opt.monthlyPriceModifier || opt.priceModifier}`
                                        : 'Included'}
                                      {' | '}
                                      Y: {parseFloat(opt.yearlyPriceModifier || opt.priceModifier) !== 0 
                                        ? (parseFloat(opt.yearlyPriceModifier || opt.priceModifier) > 0 ? '+' : '') + `Rs ${opt.yearlyPriceModifier || opt.priceModifier}`
                                        : 'Included'}
                                    </span>
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
        </Tabs>
      </form>

      {/* Variant Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              
              {/* Billing Type */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Billing Type</Label>
                  <Select
                    value={editingVariant.billingType}
                    onValueChange={(value: "ONE_TIME" | "RECURRING") =>
                      setEditingVariant({ ...editingVariant, billingType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONE_TIME">One-time</SelectItem>
                      <SelectItem value="RECURRING">Recurring Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editingVariant.billingType === "ONE_TIME" ? (
                  <div className="space-y-4">
                    <Label className="text-base">One Time</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">One-time Price *</Label>
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
                        <Label className="text-sm text-muted-foreground">Setup Fee</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingVariant.setupFee}
                          onChange={(e) =>
                            setEditingVariant({
                              ...editingVariant,
                              setupFee: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Cost Price</Label>
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
                    <p className="text-xs text-muted-foreground">
                      One-time price is the main product price. Setup fee is an additional one-time charge. No recurring charges will apply.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-base">Recurring Prices & Setup Fees (Rs)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Monthly */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Monthly</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.monthlyPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  monthlyPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.monthlySetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  monthlySetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.monthlyCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  monthlyCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quarterly */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Quarterly</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.quarterlyPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  quarterlyPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.quarterlySetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  quarterlySetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.quarterlyCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  quarterlyCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bi-Monthly */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Bi-Monthly</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.biMonthlyPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  biMonthlyPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.biMonthlySetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  biMonthlySetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.biMonthlyCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  biMonthlyCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4-Monthly */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">4-Monthly</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.fourMonthlyPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  fourMonthlyPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.fourMonthlySetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  fourMonthlySetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.fourMonthlyCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  fourMonthlyCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Semi-Annual */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Semi-Annual</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.semiAnnualPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  semiAnnualPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.semiAnnualSetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  semiAnnualSetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.semiAnnualCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  semiAnnualCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tri-Annual */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Tri-Annual</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.triAnnualPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  triAnnualPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.triAnnualSetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  triAnnualSetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.triAnnualCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  triAnnualCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Yearly */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Yearly</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.yearlyPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  yearlyPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.yearlySetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  yearlySetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.yearlyCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  yearlyCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Biennial */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Biennial</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.biennialPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  biennialPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.biennialSetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  biennialSetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.biennialCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  biennialCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Triennial */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Triennial</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.triennialPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  triennialPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Setup Fee</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.triennialSetupFee}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  triennialSetupFee: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cost Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingVariant.triennialCostPrice}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  triennialCostPrice: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Variant Specifications */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-base">Specifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Add specifications like CPU, RAM, Storage for this variant
                  </p>
                </div>
                
                {/* Existing specifications */}
                {Object.entries(editingVariant.specifications || {}).filter(([key]) => {
                  const reservedKeys = [
                    'billingType', 'setupFee',
                    'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
                    'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
                    'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
                    'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
                  ];
                  return !reservedKeys.includes(key);
                }).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(editingVariant.specifications || {})
                      .filter(([key]) => {
                        const reservedKeys = [
                          'billingType', 'setupFee',
                          'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
                          'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
                          'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
                          'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
                        ];
                        return !reservedKeys.includes(key);
                      })
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                          <span className="font-medium flex-1">{key}</span>
                          <span className="text-muted-foreground flex-1">{value}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariantSpecification(key)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
                
                {/* Add new specification */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Name (e.g., CPU)"
                    value={newVariantSpecKey}
                    onChange={(e) => setNewVariantSpecKey(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g., INTEL)"
                    value={newVariantSpecValue}
                    onChange={(e) => setNewVariantSpecValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addVariantSpecification}
                    disabled={!newVariantSpecKey.trim() || !newVariantSpecValue.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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
                  <Label>Rate (Rs) *</Label>
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
                  <Label>Unit</Label>
                  <Input
                    value={editingAddon.unit || ""}
                    onChange={(e) =>
                      setEditingAddon({ ...editingAddon, unit: e.target.value })
                    }
                    placeholder="e.g., per user, per server, per GB"
                  />
                </div>
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
              {editingConfig?.id ? "Edit Variable" : "Add Variable"}
            </DialogTitle>
            <DialogDescription>
              Add variable options for this product
            </DialogDescription>
          </DialogHeader>
          {editingConfig && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Configuration Type *</Label>
                  <Select
                    value={editingConfig.configType}
                    onValueChange={(value) =>
                      setEditingConfig({ ...editingConfig, configType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPU">CPU / Processor</SelectItem>
                      <SelectItem value="RAM">RAM / Memory</SelectItem>
                      <SelectItem value="STORAGE">Storage / Disk</SelectItem>
                      <SelectItem value="GPU">GPU / Graphics</SelectItem>
                      <SelectItem value="BANDWIDTH">Bandwidth / Transfer</SelectItem>
                      <SelectItem value="USERS">Users / Seats</SelectItem>
                      <SelectItem value="OS">Operating System</SelectItem>
                      <SelectItem value="DATA_CENTER">Data Center / Region</SelectItem>
                      <SelectItem value="LICENSE">License</SelectItem>
                      <SelectItem value="SUPPORT">Support Tier</SelectItem>
                      <SelectItem value="STANDARD">Other / Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Input Type</Label>
                  <Select
                    value={editingConfig.inputType}
                    onValueChange={(value) =>
                      setEditingConfig({
                        ...editingConfig,
                        inputType: value as any,
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
                <Label>Variable Name *</Label>
                <Input
                  value={editingConfig.name}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, name: e.target.value })
                  }
                  placeholder="e.g., RAM Size, Disk Space, OS Edition"
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Add options with label (display name) and value (price)
                </div>
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
                          { value: "", label: "", priceModifier: "0", monthlyPriceModifier: "0", yearlyPriceModifier: "0" },
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
                        placeholder="Label (display name)"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...editingConfig.options];
                          newOptions[idx].label = e.target.value;
                          // Auto-generate value if empty
                          if (!newOptions[idx].value?.trim()) {
                            newOptions[idx].value = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                          }
                          setEditingConfig({
                            ...editingConfig,
                            options: newOptions,
                          });
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Price (₹)"
                        value={option.monthlyPriceModifier ?? option.priceModifier ?? ""}
                        onChange={(e) => {
                          const newOptions = [...editingConfig.options];
                          newOptions[idx].monthlyPriceModifier = e.target.value;
                          newOptions[idx].priceModifier = e.target.value;
                          setEditingConfig({
                            ...editingConfig,
                            options: newOptions,
                          });
                        }}
                        className="w-32"
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
            <Button onClick={saveConfig}>Save Variable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

