"use client";

import { useState, useEffect } from "react";
import { Star, Save, Loader2, Image, Link as LinkIcon, Check, X, Cloud, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  // Full product features
  description?: string;
  features?: string[];
  overview?: string;
  solutions?: {
    cloud: {
      title: string;
      description: string;
      features: string[];
      buttonText: string;
      link: string;
    };
    onPremise: {
      title: string;
      description: string;
      features: string[];
      buttonText: string;
      link: string;
    };
  };
  pricing?: {
    monthly?: string;
    yearly?: string;
    features?: string[];
  };
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
  description: "",
  features: [],
  overview: "",
  solutions: {
    cloud: {
      title: "",
      description: "",
      features: [],
      buttonText: "",
      link: "",
    },
    onPremise: {
      title: "",
      description: "",
      features: [],
      buttonText: "",
      link: "",
    },
  },
  pricing: {
    monthly: "",
    yearly: "",
    features: [],
  },
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
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingProduct.id.startsWith("new-")
                  ? "Add New Hero Product"
                  : "Edit Hero Product"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="hero">Hero</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="solutions">Solutions</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
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
                        placeholder="Brief description for listings"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isActive"
                        checked={editingProduct.isActive}
                        onCheckedChange={(checked) =>
                          setEditingProduct({
                            ...editingProduct,
                            isActive: checked,
                          })
                        }
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>
                </TabsContent>

                {/* Hero Section Tab */}
                <TabsContent value="hero" className="space-y-4 mt-4">
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
                          placeholder="e.g., /hero/vsaas"
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
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="overview">Overview Content</Label>
                      <Textarea
                        id="overview"
                        value={editingProduct.overview || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            overview: e.target.value,
                          })
                        }
                        placeholder="Main product description and overview"
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea
                        id="features"
                        value={editingProduct.features?.join("\n") || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            features: e.target.value.split("\n").filter(f => f.trim()),
                          })
                        }
                        placeholder="Feature 1\nFeature 2\nFeature 3"
                        rows={6}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Solutions Tab */}
                <TabsContent value="solutions" className="space-y-4 mt-4">
                  {/* Cloud Solution */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-blue-600" />
                      Cloud Solution
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingProduct.solutions?.cloud?.title || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              solutions: {
                                cloud: {
                                  title: e.target.value,
                                  description: editingProduct.solutions?.cloud?.description || "",
                                  features: editingProduct.solutions?.cloud?.features || [],
                                  buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                  link: editingProduct.solutions?.cloud?.link || "",
                                },
                                onPremise: {
                                  title: editingProduct.solutions?.onPremise?.title || "",
                                  description: editingProduct.solutions?.onPremise?.description || "",
                                  features: editingProduct.solutions?.onPremise?.features || [],
                                  buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                  link: editingProduct.solutions?.onPremise?.link || "",
                                },
                              },
                            })
                          }
                          placeholder="VSAAS Cloud"
                        />
                      </div>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={editingProduct.solutions?.cloud?.buttonText || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              solutions: {
                                cloud: {
                                  title: editingProduct.solutions?.cloud?.title || "",
                                  description: editingProduct.solutions?.cloud?.description || "",
                                  features: editingProduct.solutions?.cloud?.features || [],
                                  buttonText: e.target.value,
                                  link: editingProduct.solutions?.cloud?.link || "",
                                },
                                onPremise: {
                                  title: editingProduct.solutions?.onPremise?.title || "",
                                  description: editingProduct.solutions?.onPremise?.description || "",
                                  features: editingProduct.solutions?.onPremise?.features || [],
                                  buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                  link: editingProduct.solutions?.onPremise?.link || "",
                                },
                              },
                            })
                          }
                          placeholder="View Cloud Plans"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingProduct.solutions?.cloud?.description || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            solutions: {
                              cloud: {
                                title: editingProduct.solutions?.cloud?.title || "",
                                description: e.target.value,
                                features: editingProduct.solutions?.cloud?.features || [],
                                buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                link: editingProduct.solutions?.cloud?.link || "",
                              },
                              onPremise: {
                                title: editingProduct.solutions?.onPremise?.title || "",
                                description: editingProduct.solutions?.onPremise?.description || "",
                                features: editingProduct.solutions?.onPremise?.features || [],
                                buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                link: editingProduct.solutions?.onPremise?.link || "",
                              },
                            },
                          })
                        }
                        placeholder="Cloud solution description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Features (one per line)</Label>
                      <Textarea
                        value={editingProduct.solutions?.cloud?.features?.join("\n") || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            solutions: {
                              cloud: {
                                title: editingProduct.solutions?.cloud?.title || "",
                                description: editingProduct.solutions?.cloud?.description || "",
                                features: e.target.value.split("\n").filter(f => f.trim()),
                                buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                link: editingProduct.solutions?.cloud?.link || "",
                              },
                              onPremise: {
                                title: editingProduct.solutions?.onPremise?.title || "",
                                description: editingProduct.solutions?.onPremise?.description || "",
                                features: editingProduct.solutions?.onPremise?.features || [],
                                buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                link: editingProduct.solutions?.onPremise?.link || "",
                              },
                            },
                          })
                        }
                        placeholder="Feature 1\nFeature 2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Link</Label>
                      <Input
                        value={editingProduct.solutions?.cloud?.link || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            solutions: {
                              cloud: {
                                title: editingProduct.solutions?.cloud?.title || "",
                                description: editingProduct.solutions?.cloud?.description || "",
                                features: editingProduct.solutions?.cloud?.features || [],
                                buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                link: e.target.value,
                              },
                              onPremise: {
                                title: editingProduct.solutions?.onPremise?.title || "",
                                description: editingProduct.solutions?.onPremise?.description || "",
                                features: editingProduct.solutions?.onPremise?.features || [],
                                buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                link: editingProduct.solutions?.onPremise?.link || "",
                              },
                            },
                          })
                        }
                        placeholder="/products/connect-cloud"
                      />
                    </div>
                  </div>

                  {/* On-Premise Solution */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Server className="h-5 w-5 text-purple-600" />
                      On-Premise Solution
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingProduct.solutions?.onPremise?.title || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              solutions: {
                                cloud: {
                                  title: editingProduct.solutions?.cloud?.title || "",
                                  description: editingProduct.solutions?.cloud?.description || "",
                                  features: editingProduct.solutions?.cloud?.features || [],
                                  buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                  link: editingProduct.solutions?.cloud?.link || "",
                                },
                                onPremise: {
                                  title: e.target.value,
                                  description: editingProduct.solutions?.onPremise?.description || "",
                                  features: editingProduct.solutions?.onPremise?.features || [],
                                  buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                  link: editingProduct.solutions?.onPremise?.link || "",
                                },
                              },
                            })
                          }
                          placeholder="VSAAS On-Premise"
                        />
                      </div>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={editingProduct.solutions?.onPremise?.buttonText || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              solutions: {
                                cloud: {
                                  title: editingProduct.solutions?.cloud?.title || "",
                                  description: editingProduct.solutions?.cloud?.description || "",
                                  features: editingProduct.solutions?.cloud?.features || [],
                                  buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                  link: editingProduct.solutions?.cloud?.link || "",
                                },
                                onPremise: {
                                  title: editingProduct.solutions?.onPremise?.title || "",
                                  description: editingProduct.solutions?.onPremise?.description || "",
                                  features: editingProduct.solutions?.onPremise?.features || [],
                                  buttonText: e.target.value,
                                  link: editingProduct.solutions?.onPremise?.link || "",
                                },
                              },
                            })
                          }
                          placeholder="View On-Premise Plans"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingProduct.solutions?.onPremise?.description || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            solutions: {
                              cloud: {
                                title: editingProduct.solutions?.cloud?.title || "",
                                description: editingProduct.solutions?.cloud?.description || "",
                                features: editingProduct.solutions?.cloud?.features || [],
                                buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                link: editingProduct.solutions?.cloud?.link || "",
                              },
                              onPremise: {
                                title: editingProduct.solutions?.onPremise?.title || "",
                                description: e.target.value,
                                features: editingProduct.solutions?.onPremise?.features || [],
                                buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                link: editingProduct.solutions?.onPremise?.link || "",
                              },
                            },
                          })
                        }
                        placeholder="On-Premise solution description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Features (one per line)</Label>
                      <Textarea
                        value={editingProduct.solutions?.onPremise?.features?.join("\n") || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            solutions: {
                              cloud: {
                                title: editingProduct.solutions?.cloud?.title || "",
                                description: editingProduct.solutions?.cloud?.description || "",
                                features: editingProduct.solutions?.cloud?.features || [],
                                buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                link: editingProduct.solutions?.cloud?.link || "",
                              },
                              onPremise: {
                                title: editingProduct.solutions?.onPremise?.title || "",
                                description: editingProduct.solutions?.onPremise?.description || "",
                                features: e.target.value.split("\n").filter(f => f.trim()),
                                buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                link: editingProduct.solutions?.onPremise?.link || "",
                              },
                            },
                          })
                        }
                        placeholder="Feature 1\nFeature 2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Link</Label>
                      <Input
                        value={editingProduct.solutions?.onPremise?.link || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            solutions: {
                              cloud: {
                                title: editingProduct.solutions?.cloud?.title || "",
                                description: editingProduct.solutions?.cloud?.description || "",
                                features: editingProduct.solutions?.cloud?.features || [],
                                buttonText: editingProduct.solutions?.cloud?.buttonText || "",
                                link: editingProduct.solutions?.cloud?.link || "",
                              },
                              onPremise: {
                                title: editingProduct.solutions?.onPremise?.title || "",
                                description: editingProduct.solutions?.onPremise?.description || "",
                                features: editingProduct.solutions?.onPremise?.features || [],
                                buttonText: editingProduct.solutions?.onPremise?.buttonText || "",
                                link: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="/products/vsaas-on-premise"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthlyPrice">Monthly Price</Label>
                        <Input
                          id="monthlyPrice"
                          value={editingProduct.pricing?.monthly || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              pricing: {
                                ...editingProduct.pricing,
                                monthly: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., ₹999/month"
                        />
                      </div>
                      <div>
                        <Label htmlFor="yearlyPrice">Yearly Price</Label>
                        <Input
                          id="yearlyPrice"
                          value={editingProduct.pricing?.yearly || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              pricing: {
                                ...editingProduct.pricing,
                                yearly: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., ₹9999/year"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pricingFeatures">Pricing Features (one per line)</Label>
                      <Textarea
                        id="pricingFeatures"
                        value={editingProduct.pricing?.features?.join("\n") || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            pricing: {
                              ...editingProduct.pricing,
                              features: e.target.value.split("\n").filter(f => f.trim()),
                            },
                          })
                        }
                        placeholder="Feature 1\nFeature 2\nFeature 3"
                        rows={6}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
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
