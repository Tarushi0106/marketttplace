"use client";

import { useState, useEffect } from "react";
import {
  Layout,
  Settings,
  Home,
  Menu as MenuIcon,
  Image,
  Type,
  Link as LinkIcon,
  Plus,
  Trash2,
  Loader2,
  Save,
  Eye,
  Users,
  Award,
  Grid,
  MessageSquare,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LandingPageSettings {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
  };
  navbar: {
    logoText: string;
    showCategories: boolean;
    customLinks: Array<{
      label: string;
      href: string;
      position: number;
    }>;
  };
  companyLogos: {
    enabled: boolean;
    title: string;
  };
  solutions: {
    enabled: boolean;
    title: string;
  };
  featuredProducts: {
    enabled: boolean;
    title: string;
  };
  testimonials: {
    enabled: boolean;
    title: string;
  };
  features: {
    enabled: boolean;
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  stats: {
    enabled: boolean;
    items: Array<{
      value: string;
      label: string;
    }>;
  };
  footer: {
    enabled: boolean;
    companyName: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    socialLinks: Array<{
      platform: string;
      url: string;
    }>;
  };
}

const defaultSettings: LandingPageSettings = {
  hero: {
    title: "Enterprise Solutions for Growing Business",
    subtitle: "Choose. Click. Launch. - Get started with our cloud hosting solutions",
    ctaText: "Explore Marketplace",
    ctaLink: "/products",
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80",
  },
  navbar: {
    logoText: "NetNxt",
    showCategories: true,
    customLinks: [],
  },
  companyLogos: {
    enabled: true,
    title: "Trusted by Leading Companies",
  },
  solutions: {
    enabled: true,
    title: "Browse Top Solutions",
  },
  featuredProducts: {
    enabled: true,
    title: "Featured Products",
  },
  testimonials: {
    enabled: true,
    title: "What Our Clients Say",
  },
  features: {
    enabled: false,
    title: "Why Choose Us?",
    items: [
      { icon: "zap", title: "Lightning Fast", description: "SSD storage and optimized servers" },
      { icon: "shield", title: "Secure", description: "Enterprise-grade security" },
      { icon: "support", title: "24/7 Support", description: "Round-the-clock customer support" },
    ],
  },
  stats: {
    enabled: false,
    items: [
      { value: "99.99%", label: "Uptime" },
      { value: "50K+", label: "Customers" },
      { value: "15+", label: "Data Centers" },
      { value: "24/7", label: "Support" },
    ],
  },
  footer: {
    enabled: true,
    companyName: "NetNxt",
    tagline: "Enterprise Solutions for Growing Business",
    address: "123 Commerce Street, Business City, BC 12345",
    phone: "+91 98765 43210",
    email: "support@netnxt.com",
    socialLinks: [
      { platform: "facebook", url: "https://facebook.com" },
      { platform: "twitter", url: "https://twitter.com" },
      { platform: "linkedin", url: "https://linkedin.com" },
    ],
  },
};

export default function LandingPageSettings() {
  const [settings, setSettings] = useState<LandingPageSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings/landing-page");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSettings({ ...defaultSettings, ...data });
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Success",
        description: "Landing page settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function addCustomLink() {
    setSettings({
      ...settings,
      navbar: {
        ...settings.navbar,
        customLinks: [
          ...settings.navbar.customLinks,
          { label: "New Link", href: "/", position: settings.navbar.customLinks.length },
        ],
      },
    });
  }

  function removeCustomLink(index: number) {
    setSettings({
      ...settings,
      navbar: {
        ...settings.navbar,
        customLinks: settings.navbar.customLinks.filter((_, i) => i !== index),
      },
    });
  }

  function addFeature() {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        items: [...settings.features.items, { icon: "star", title: "New Feature", description: "Feature description" }],
      },
    });
  }

  function removeFeature(index: number) {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        items: settings.features.items.filter((_, i) => i !== index),
      },
    });
  }

  function addStat() {
    setSettings({
      ...settings,
      stats: {
        ...settings.stats,
        items: [...settings.stats.items, { value: "New", label: "Stat" }],
      },
    });
  }

  function removeStat(index: number) {
    setSettings({
      ...settings,
      stats: {
        ...settings.stats,
        items: settings.stats.items.filter((_, i) => i !== index),
      },
    });
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
          <h1 className="text-3xl font-bold">Landing Page Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your entire homepage
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="bg-gray-100 flex flex-wrap h-auto p-2 gap-2">
          <TabsTrigger value="hero" className="px-4 py-2">
            <Home className="mr-2 h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="navbar" className="px-4 py-2">
            <MenuIcon className="mr-2 h-4 w-4" />
            Navbar
          </TabsTrigger>
          <TabsTrigger value="company-logos" className="px-4 py-2">
            <Building className="mr-2 h-4 w-4" />
            Company Logos
          </TabsTrigger>
          <TabsTrigger value="solutions" className="px-4 py-2">
            <Grid className="mr-2 h-4 w-4" />
            Solutions
          </TabsTrigger>
          <TabsTrigger value="featured" className="px-4 py-2">
            <Award className="mr-2 h-4 w-4" />
            Featured Products
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="features" className="px-4 py-2">
            <Layout className="mr-2 h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="stats" className="px-4 py-2">
            <Type className="mr-2 h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="footer" className="px-4 py-2">
            <MessageSquare className="mr-2 h-4 w-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Customize the main banner section of your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={settings.hero.title}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, title: e.target.value },
                      })
                    }
                    placeholder="Enter hero title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={settings.hero.subtitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, subtitle: e.target.value },
                      })
                    }
                    placeholder="Enter hero subtitle"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    value={settings.hero.ctaText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, ctaText: e.target.value },
                      })
                    }
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Button Link</Label>
                  <Input
                    id="ctaLink"
                    value={settings.hero.ctaLink}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero: { ...settings.hero, ctaLink: e.target.value },
                      })
                    }
                    placeholder="e.g., /products"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgImage">Background Image URL</Label>
                <Input
                  id="bgImage"
                  value={settings.hero.backgroundImage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, backgroundImage: e.target.value },
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation */}
        <TabsContent value="navbar">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Bar</CardTitle>
              <CardDescription>
                Customize your website header and navigation links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoText">Logo Text</Label>
                <Input
                  id="logoText"
                  value={settings.navbar.logoText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      navbar: { ...settings.navbar, logoText: e.target.value },
                    })
                  }
                  placeholder="e.g., NetNxt"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.navbar.showCategories}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      navbar: { ...settings.navbar, showCategories: checked },
                    })
                  }
                />
                <Label>Show Categories Dropdown</Label>
              </div>

              {/* Custom Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Custom Navigation Links</Label>
                  <Button variant="outline" size="sm" onClick={addCustomLink}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Link
                  </Button>
                </div>
                {settings.navbar.customLinks.map((link, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...settings.navbar.customLinks];
                          newLinks[index].label = e.target.value;
                          setSettings({
                            ...settings,
                            navbar: { ...settings.navbar, customLinks: newLinks },
                          });
                        }}
                        placeholder="Link label"
                      />
                      <Input
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...settings.navbar.customLinks];
                          newLinks[index].href = e.target.value;
                          setSettings({
                            ...settings,
                            navbar: { ...settings.navbar, customLinks: newLinks },
                          });
                        }}
                        placeholder="/page-url"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeCustomLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Logos */}
        <TabsContent value="company-logos">
          <Card>
            <CardHeader>
              <CardTitle>Trusted by Leading Companies Section</CardTitle>
              <CardDescription>
                Show company logos on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.companyLogos.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      companyLogos: { ...settings.companyLogos, enabled: checked },
                    })
                  }
                />
                <Label>Enable Company Logos Section</Label>
              </div>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={settings.companyLogos.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      companyLogos: { ...settings.companyLogos, title: e.target.value },
                    })
                  }
                  placeholder="e.g., Trusted by Leading Companies"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Company logos are managed in{" "}
                <a href="/admin/company-logos" className="text-primary hover:underline">
                  Company Logos Management
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solutions */}
        <TabsContent value="solutions">
          <Card>
            <CardHeader>
              <CardTitle>Browse Top Solutions Section</CardTitle>
              <CardDescription>
                Configure the solutions/categories carousel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.solutions.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      solutions: { ...settings.solutions, enabled: checked },
                    })
                  }
                />
                <Label>Enable Solutions Section</Label>
              </div>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={settings.solutions.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      solutions: { ...settings.solutions, title: e.target.value },
                    })
                  }
                  placeholder="e.g., Browse Top Solutions"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Categories are managed in{" "}
                <a href="/admin/categories" className="text-primary hover:underline">
                  Categories Management
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Products */}
        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>Featured Products Section</CardTitle>
              <CardDescription>
                Configure the featured products section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.featuredProducts.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      featuredProducts: { ...settings.featuredProducts, enabled: checked },
                    })
                  }
                />
                <Label>Enable Featured Products Section</Label>
              </div>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={settings.featuredProducts.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      featuredProducts: { ...settings.featuredProducts, title: e.target.value },
                    })
                  }
                  placeholder="e.g., Featured Products"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Featured products are set in{" "}
                <a href="/admin/products" className="text-primary hover:underline">
                  Products Management
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>What Our Clients Say Section</CardTitle>
              <CardDescription>
                Configure the testimonials/reviews section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.testimonials.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      testimonials: { ...settings.testimonials, enabled: checked },
                    })
                  }
                />
                <Label>Enable Testimonials Section</Label>
              </div>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={settings.testimonials.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      testimonials: { ...settings.testimonials, title: e.target.value },
                    })
                  }
                  placeholder="e.g., What Our Clients Say"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Testimonials are managed in{" "}
                <a href="/admin/testimonials" className="text-primary hover:underline">
                  Testimonials Management
                </a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
              <CardDescription>
                Customize the features section shown on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.features.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      features: { ...settings.features, enabled: checked },
                    })
                  }
                />
                <Label>Enable Features Section</Label>
              </div>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={settings.features.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      features: { ...settings.features, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Feature Items</Label>
                  <Button variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                {settings.features.items.map((feature, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 grid gap-4 md:grid-cols-3">
                      <Select
                        value={feature.icon}
                        onValueChange={(value) => {
                          const newItems = [...settings.features.items];
                          newItems[index].icon = value;
                          setSettings({
                            ...settings,
                            features: { ...settings.features, items: newItems },
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zap">⚡ Lightning</SelectItem>
                          <SelectItem value="shield">🛡️ Security</SelectItem>
                          <SelectItem value="support">💬 Support</SelectItem>
                          <SelectItem value="server">🖥️ Server</SelectItem>
                          <SelectItem value="database">💾 Database</SelectItem>
                          <SelectItem value="cloud">☁️ Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const newItems = [...settings.features.items];
                          newItems[index].title = e.target.value;
                          setSettings({
                            ...settings,
                            features: { ...settings.features, items: newItems },
                          });
                        }}
                        placeholder="Feature title"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => {
                          const newItems = [...settings.features.items];
                          newItems[index].description = e.target.value;
                          setSettings({
                            ...settings,
                            features: { ...settings.features, items: newItems },
                          });
                        }}
                        placeholder="Feature description"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistics Section</CardTitle>
              <CardDescription>
                Customize the statistics/numbers shown on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.stats.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      stats: { ...settings.stats, enabled: checked },
                    })
                  }
                />
                <Label>Enable Stats Section</Label>
              </div>
              <div className="space-y-4">
                {settings.stats.items.map((stat, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                      <Input
                        value={stat.value}
                        onChange={(e) => {
                          const newItems = [...settings.stats.items];
                          newItems[index].value = e.target.value;
                          setSettings({
                            ...settings,
                            stats: { ...settings.stats, items: newItems },
                          });
                        }}
                        placeholder="e.g., 99.99%"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          const newItems = [...settings.stats.items];
                          newItems[index].label = e.target.value;
                          setSettings({
                            ...settings,
                            stats: { ...settings.stats, items: newItems },
                          });
                        }}
                        placeholder="e.g., Uptime"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeStat(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStat}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stat
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Section</CardTitle>
              <CardDescription>
                Customize the footer of your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.footer.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, enabled: checked },
                    })
                  }
                />
                <Label>Enable Footer Section</Label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={settings.footer.companyName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: { ...settings.footer, companyName: e.target.value },
                      })
                    }
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings.footer.tagline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: { ...settings.footer, tagline: e.target.value },
                      })
                    }
                    placeholder="Company tagline"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={settings.footer.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, address: e.target.value },
                    })
                  }
                  placeholder="Company address"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={settings.footer.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: { ...settings.footer, phone: e.target.value },
                      })
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={settings.footer.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: { ...settings.footer, email: e.target.value },
                      })
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
