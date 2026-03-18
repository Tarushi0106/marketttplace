"use client";

import { useState, useEffect } from "react";
import { Star, Save, Loader2, Image, Link as LinkIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImage: string;
  isActive: boolean;
}

const defaultHeroProduct: HeroProduct = {
  id: "",
  name: "",
  slug: "",
  shortDescription: "",
  heroTitle: "",
  heroSubtitle: "",
  heroCtaText: "",
  heroCtaLink: "",
  heroImage: "",
  isActive: true,
};

export default function HeroProductsPage() {
  const [heroProducts, setHeroProducts] = useState<HeroProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HeroProduct | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHeroProducts();
  }, []);

  async function fetchHeroProducts() {
    try {
      const response = await fetch("/api/admin/hero-products");
      if (response.ok) {
        const data = await response.json();
        setHeroProducts(data);
      }
    } catch (error) {
      console.error("Error fetching hero products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(product: HeroProduct) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/hero-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const saved = await response.json();
        setHeroProducts((prev) => {
          const existing = prev.find((p) => p.id === saved.id);
          if (existing) {
            return prev.map((p) => (p.id === saved.id ? saved : p));
          }
          return [...prev, saved];
        });
        setEditingProduct(null);
        toast({
          title: "Success",
          description: "Hero product saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving hero product:", error);
      toast({
        title: "Error",
        description: "Failed to save hero product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this hero product?")) return;
    
    try {
      const response = await fetch(`/api/admin/hero-products?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHeroProducts((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Success",
          description: "Hero product deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting hero product:", error);
      toast({
        title: "Error",
        description: "Failed to delete hero product",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hero Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your hero products that appear on the homepage
          </p>
        </div>
        <Button
          onClick={() =>
            setEditingProduct({
              ...defaultHeroProduct,
              id: `new-${Date.now()}`,
            })
          }
        >
          <Star className="h-4 w-4 mr-2" />
          Add Hero Product
        </Button>
      </div>

      {/* Hero Products List */}
      <div className="grid gap-6 mb-8">
        {heroProducts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No hero products configured. Add a hero product to display it on the homepage.
            </CardContent>
          </Card>
        ) : (
          heroProducts.map((product) => (
            <Card key={product.id} className={product.isActive ? "" : "opacity-60"}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription>/{product.slug}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{product.shortDescription}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>Title: {product.heroTitle || "Not set"}</span>
                  <span>CTA: {product.heroCtaText || "Not set"}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Form Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingProduct.id.startsWith("new-")
                  ? "Add New Hero Product"
                  : "Edit Hero Product"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                          slug: editingProduct.id.startsWith("new-")
                            ? e.target.value.toLowerCase().replace(/\s+/g, "-")
                            : editingProduct.slug,
                        })
                      }
                      placeholder="e.g., VSAAS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={editingProduct.shortDescription}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Brief description for the hero section"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hero Section Settings</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={editingProduct.heroTitle}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          heroTitle: e.target.value,
                        })
                      }
                      placeholder="e.g., Video Surveillance as a Service"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Textarea
                      id="heroSubtitle"
                      value={editingProduct.heroSubtitle}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          heroSubtitle: e.target.value,
                        })
                      }
                      placeholder="e.g., Secure, scalable video surveillance for your business"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroCtaText">CTA Button Text</Label>
                      <Input
                        id="heroCtaText"
                        value={editingProduct.heroCtaText}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            heroCtaText: e.target.value,
                          })
                        }
                        placeholder="e.g., Get Started"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroCtaLink">CTA Link</Label>
                      <Input
                        id="heroCtaLink"
                        value={editingProduct.heroCtaLink}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            heroCtaLink: e.target.value,
                          })
                        }
                        placeholder="e.g., /products/vsaas"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroImage">Hero Background Image URL</Label>
                    <Input
                      id="heroImage"
                      value={editingProduct.heroImage}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          heroImage: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingProduct.isActive}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSave(editingProduct)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
