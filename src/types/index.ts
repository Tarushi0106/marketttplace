// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  categoryId: string | null;
  subCategoryId: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  features: string[] | null;
  specifications: Record<string, string> | null;
  sku: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  productType: ProductType;
  status: ProductStatus;
  isFeatured: boolean;
  isDigital: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  averageRating: number | null;
  reviewCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  addons: ProductAddon[];
  configs: ProductConfig[];
  category: Category | null;
  subCategory: SubCategory | null;
  seoMetadata: SeoMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  attributes: Record<string, string> | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductAddon {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  price: number;
  pricingType: AddonPricingType;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductConfig {
  id: string;
  productId: string;
  name: string;
  type: ConfigType;
  options: ConfigOption[];
  isRequired: boolean;
  defaultValue: string | null;
  sortOrder: number;
}

export interface ConfigOption {
  value: string;
  label: string;
  priceModifier: number;
}

export type ProductType = "STANDALONE" | "WITH_ADDONS" | "CONFIGURABLE" | "BUNDLE";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type AddonPricingType = "ONE_TIME" | "RECURRING_MONTHLY" | "RECURRING_YEARLY";
export type ConfigType = "SELECT" | "RADIO" | "CHECKBOX" | "NUMBER";

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  subCategories: SubCategory[];
  _count?: {
    products: number;
  };
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  category?: Category;
  _count?: {
    products: number;
  };
}

// ============================================
// BUNDLE TYPES
// ============================================

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  discountType: DiscountType;
  discountValue: number;
  status: ProductStatus;
  isFeatured: boolean;
  isCustomizable: boolean;
  minItems: number | null;
  maxItems: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
  items: BundleItem[];
  seoMetadata: SeoMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleItem {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  isRequired: boolean;
  isDefault: boolean;
  sortOrder: number;
  product: Product;
}

// ============================================
// PRICING & DISCOUNT TYPES
// ============================================

export interface PricingTier {
  id: string;
  productId: string;
  name: string;
  minQty: number;
  maxQty: number | null;
  price: number;
  isActive: boolean;
}

export interface Discount {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  applicableTo: DiscountScope;
  productIds: string[];
  categoryIds: string[];
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
}

export type DiscountType = "PERCENTAGE" | "FIXED";
export type DiscountScope = "ALL" | "PRODUCTS" | "CATEGORIES" | "BUNDLES";

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  selectedAddons: SelectedAddon[];
  selectedConfigs: SelectedConfig[];
  bundle: Bundle | null;
}

export interface SelectedAddon {
  addon: ProductAddon;
  quantity: number;
}

export interface SelectedConfig {
  config: ProductConfig;
  value: string;
  priceModifier: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  discountCode: string | null;
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  phone: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paymentId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: Address | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  bundleId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  configuration: Record<string, string> | null;
  addons: OrderItemAddon[];
}

export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type AddressType = "SHIPPING" | "BILLING";

// ============================================
// CMS TYPES
// ============================================

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: PageStatus;
  template: string | null;
  isHomepage: boolean;
  sortOrder: number;
  publishedAt: Date | null;
  sections: PageSection[];
  seoMetadata: SeoMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageSection {
  id: string;
  pageId: string;
  type: PageSectionType;
  title: string | null;
  content: Record<string, unknown>;
  settings: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
}

export type PageSectionType =
  | "hero"
  | "featured-products"
  | "categories"
  | "testimonials"
  | "faq"
  | "cta"
  | "custom"
  | "product-carousel"
  | "banner"
  | "text-block";

export type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ============================================
// SEO TYPES
// ============================================

export interface SeoMetadata {
  id: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  structuredData: Record<string, unknown> | null;
  noIndex: boolean;
  noFollow: boolean;
}

// ============================================
// MEDIA TYPES
// ============================================

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  folder: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  productType?: ProductType;
  status?: ProductStatus;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "price" | "name" | "createdAt" | "rating" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ============================================
// COMPANY TYPES
// ============================================

export interface CompanyInfo {
  id: string;
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  taxId: string | null;
  logo: string | null;
  favicon: string | null;
  socialLinks: SocialLinks | null;
  supportEmail: string | null;
  supportPhone: string | null;
  businessHours: string | null;
  currency: string;
  currencySymbol: string;
  timezone: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  user: Pick<User, "id" | "name" | "image">;
  createdAt: Date;
  updatedAt: Date;
}
