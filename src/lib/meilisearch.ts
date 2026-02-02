import { MeiliSearch } from "meilisearch";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const INDEXES = {
  PRODUCTS: "products",
  BUNDLES: "bundles",
  CATEGORIES: "categories",
} as const;

export interface SearchableProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryName: string;
  categorySlug: string;
  subCategoryName: string;
  subCategorySlug: string;
  price: number;
  status: string;
  productType: string;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  image: string;
  createdAt: number;
}

export interface SearchableBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  status: string;
  isFeatured: boolean;
  image: string;
  createdAt: number;
}

export interface SearchableCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subCategories: { id: string; name: string; slug: string }[];
}

export async function initializeIndexes() {
  // Products index
  const productsIndex = meilisearch.index(INDEXES.PRODUCTS);
  await productsIndex.updateSettings({
    searchableAttributes: [
      "name",
      "description",
      "shortDescription",
      "categoryName",
      "subCategoryName",
    ],
    filterableAttributes: [
      "categorySlug",
      "subCategorySlug",
      "status",
      "productType",
      "isFeatured",
      "price",
    ],
    sortableAttributes: ["price", "createdAt", "rating", "reviewCount", "name"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });

  // Bundles index
  const bundlesIndex = meilisearch.index(INDEXES.BUNDLES);
  await bundlesIndex.updateSettings({
    searchableAttributes: ["name", "description", "shortDescription"],
    filterableAttributes: ["status", "isFeatured", "price"],
    sortableAttributes: ["price", "createdAt", "name"],
  });

  // Categories index
  const categoriesIndex = meilisearch.index(INDEXES.CATEGORIES);
  await categoriesIndex.updateSettings({
    searchableAttributes: ["name", "description", "subCategories.name"],
  });
}

export async function indexProducts(products: SearchableProduct[]) {
  const index = meilisearch.index(INDEXES.PRODUCTS);
  return index.addDocuments(products);
}

export async function indexBundles(bundles: SearchableBundle[]) {
  const index = meilisearch.index(INDEXES.BUNDLES);
  return index.addDocuments(bundles);
}

export async function indexCategories(categories: SearchableCategory[]) {
  const index = meilisearch.index(INDEXES.CATEGORIES);
  return index.addDocuments(categories);
}

export async function searchProducts(
  query: string,
  options?: {
    filter?: string;
    sort?: string[];
    limit?: number;
    offset?: number;
  }
) {
  const index = meilisearch.index(INDEXES.PRODUCTS);
  return index.search<SearchableProduct>(query, {
    filter: options?.filter,
    sort: options?.sort,
    limit: options?.limit || 20,
    offset: options?.offset || 0,
    attributesToHighlight: ["name", "description"],
  });
}

export async function searchBundles(
  query: string,
  options?: {
    filter?: string;
    sort?: string[];
    limit?: number;
    offset?: number;
  }
) {
  const index = meilisearch.index(INDEXES.BUNDLES);
  return index.search<SearchableBundle>(query, {
    filter: options?.filter,
    sort: options?.sort,
    limit: options?.limit || 20,
    offset: options?.offset || 0,
  });
}

export async function searchAll(query: string, limit: number = 10) {
  const [products, bundles, categories] = await Promise.all([
    meilisearch.index(INDEXES.PRODUCTS).search<SearchableProduct>(query, { limit }),
    meilisearch.index(INDEXES.BUNDLES).search<SearchableBundle>(query, { limit }),
    meilisearch.index(INDEXES.CATEGORIES).search<SearchableCategory>(query, { limit }),
  ]);

  return { products, bundles, categories };
}

export async function deleteProduct(id: string) {
  const index = meilisearch.index(INDEXES.PRODUCTS);
  return index.deleteDocument(id);
}

export async function deleteBundle(id: string) {
  const index = meilisearch.index(INDEXES.BUNDLES);
  return index.deleteDocument(id);
}

export async function deleteCategory(id: string) {
  const index = meilisearch.index(INDEXES.CATEGORIES);
  return index.deleteDocument(id);
}
