"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save,
  Globe,
  CreditCard,
  Mail,
  Shield,
  Palette,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SiteSettings {
  id?: string;
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  currency: string;
  currencySymbol: string;
  siteTitle: string;
  siteTagline: string;
  metaDescription: string;
  siteLogo: string | null;
  logoDark: string | null;
  logoLight: string | null;
  siteFavicon: string | null;
  headerLogo: string | null;
  footerLogo: string | null;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  } | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const siteLogoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);
  const logoLightInputRef = useRef<HTMLInputElement>(null);
  const headerLogoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    name: "Shaurrya Teleservices",
    legalName: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    currency: "INR",
    currencySymbol: "₹",
    siteTitle: "Shaurrya Teleservices",
    siteTagline: "Enterprise Solutions",
    metaDescription: "",
    siteLogo: null,
    logoDark: null,
    logoLight: null,
    siteFavicon: null,
    headerLogo: null,
    footerLogo: null,
    socialLinks: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings/site");
      const data = await response.json();
      if (data.data) {
        setSettings(data.data);
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
      const response = await fetch("/api/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      // Refresh settings from server to confirm save worked
      await fetchSettings();

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    field: "siteLogo" | "logoDark" | "logoLight" | "headerLogo" | "footerLogo" | "siteFavicon"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(field);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "branding");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSettings({ ...settings, [field]: data.url });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
      // Reset file input
      event.target.value = "";
    }
  }

  function clearImage(field: "siteLogo" | "logoDark" | "logoLight" | "headerLogo" | "footerLogo" | "siteFavicon") {
    setSettings({ ...settings, [field]: null });
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Site Logo & Branding
              </CardTitle>
              <CardDescription>
                Upload your site logo and configure branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Site Logo */}
              <div className="space-y-3">
                <Label>Main Site Logo</Label>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-48 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 group ${
                      !settings.siteLogo ? "cursor-pointer hover:border-primary hover:bg-gray-100" : ""
                    }`}
                    onClick={() => !settings.siteLogo && siteLogoInputRef.current?.click()}
                  >
                    {uploading === "siteLogo" ? (
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    ) : settings.siteLogo ? (
                      <>
                        <img
                          src={settings.siteLogo}
                          alt="Site Logo"
                          className="max-h-20 max-w-44 object-contain"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearImage("siteLogo"); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="h-8 w-8 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter logo URL or upload"
                        value={settings.siteLogo || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, siteLogo: e.target.value || null })
                        }
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={siteLogoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "siteLogo")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => siteLogoInputRef.current?.click()}
                        disabled={uploading === "siteLogo"}
                      >
                        {uploading === "siteLogo" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 200x60px. PNG or SVG format.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dark Logo (for light backgrounds) */}
              <div className="space-y-3">
                <Label>Dark Logo (for light backgrounds - Header)</Label>
                <p className="text-xs text-muted-foreground">Used in the header and other light background areas</p>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-48 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-white group ${
                      !settings.logoDark ? "cursor-pointer hover:border-primary hover:bg-gray-50" : ""
                    }`}
                    onClick={() => !settings.logoDark && logoDarkInputRef.current?.click()}
                  >
                    {uploading === "logoDark" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : settings.logoDark ? (
                      <>
                        <img
                          src={settings.logoDark}
                          alt="Dark Logo"
                          className="max-h-16 max-w-44 object-contain"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearImage("logoDark"); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter dark logo URL"
                        value={settings.logoDark || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, logoDark: e.target.value || null })
                        }
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={logoDarkInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logoDark")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoDarkInputRef.current?.click()}
                        disabled={uploading === "logoDark"}
                      >
                        {uploading === "logoDark" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Light Logo (for dark backgrounds) */}
              <div className="space-y-3">
                <Label>Light Logo (for dark backgrounds - Footer, Admin)</Label>
                <p className="text-xs text-muted-foreground">Used in the footer, admin sidebar, and other dark background areas</p>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-48 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800 group ${
                      !settings.logoLight ? "cursor-pointer hover:border-primary hover:bg-gray-700" : ""
                    }`}
                    onClick={() => !settings.logoLight && logoLightInputRef.current?.click()}
                  >
                    {uploading === "logoLight" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : settings.logoLight ? (
                      <>
                        <img
                          src={settings.logoLight}
                          alt="Light Logo"
                          className="max-h-16 max-w-44 object-contain"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearImage("logoLight"); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter light logo URL"
                        value={settings.logoLight || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, logoLight: e.target.value || null })
                        }
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={logoLightInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logoLight")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoLightInputRef.current?.click()}
                        disabled={uploading === "logoLight"}
                      >
                        {uploading === "logoLight" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Header Logo */}
              <div className="space-y-3">
                <Label>Header Logo Override (Optional - falls back to Dark Logo)</Label>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-48 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 group ${
                      !settings.headerLogo ? "cursor-pointer hover:border-primary hover:bg-gray-100" : ""
                    }`}
                    onClick={() => !settings.headerLogo && headerLogoInputRef.current?.click()}
                  >
                    {uploading === "headerLogo" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : settings.headerLogo ? (
                      <>
                        <img
                          src={settings.headerLogo}
                          alt="Header Logo"
                          className="max-h-16 max-w-44 object-contain"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearImage("headerLogo"); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter header logo URL (optional)"
                        value={settings.headerLogo || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, headerLogo: e.target.value || null })
                        }
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={headerLogoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "headerLogo")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => headerLogoInputRef.current?.click()}
                        disabled={uploading === "headerLogo"}
                      >
                        {uploading === "headerLogo" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Logo */}
              <div className="space-y-3">
                <Label>Footer Logo Override (Optional - falls back to Light Logo)</Label>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-48 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800 group ${
                      !settings.footerLogo ? "cursor-pointer hover:border-primary hover:bg-gray-700" : ""
                    }`}
                    onClick={() => !settings.footerLogo && footerLogoInputRef.current?.click()}
                  >
                    {uploading === "footerLogo" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : settings.footerLogo ? (
                      <>
                        <img
                          src={settings.footerLogo}
                          alt="Footer Logo"
                          className="max-h-16 max-w-44 object-contain"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearImage("footerLogo"); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter footer logo URL (optional)"
                        value={settings.footerLogo || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, footerLogo: e.target.value || null })
                        }
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={footerLogoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "footerLogo")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => footerLogoInputRef.current?.click()}
                        disabled={uploading === "footerLogo"}
                      >
                        {uploading === "footerLogo" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-3">
                <Label>Favicon</Label>
                <div className="flex items-start gap-4">
                  <div
                    className={`relative w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 group ${
                      !settings.siteFavicon ? "cursor-pointer hover:border-primary hover:bg-gray-100" : ""
                    }`}
                    onClick={() => !settings.siteFavicon && faviconInputRef.current?.click()}
                  >
                    {uploading === "siteFavicon" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : settings.siteFavicon ? (
                      <>
                        <img
                          src={settings.siteFavicon}
                          alt="Favicon"
                          className="w-8 h-8 object-contain"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearImage("siteFavicon"); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter favicon URL"
                        value={settings.siteFavicon || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, siteFavicon: e.target.value || null })
                        }
                        className="flex-1"
                      />
                      <input
                        type="file"
                        ref={faviconInputRef}
                        className="hidden"
                        accept="image/*,.ico"
                        onChange={(e) => handleFileUpload(e, "siteFavicon")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={uploading === "siteFavicon"}
                      >
                        {uploading === "siteFavicon" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 32x32px ICO or PNG format.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Site Title & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, siteTitle: e.target.value })
                    }
                    placeholder="Your site name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in browser tab and search results
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Site Tagline</Label>
                  <Input
                    id="siteTagline"
                    value={settings.siteTagline}
                    onChange={(e) =>
                      setSettings({ ...settings, siteTagline: e.target.value })
                    }
                    placeholder="Your tagline"
                  />
                  <p className="text-xs text-muted-foreground">
                    Short description shown below logo
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, metaDescription: e.target.value })
                  }
                  placeholder="Brief description for search engines"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Used for SEO. Keep it under 160 characters.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/yourpage"
                    value={settings.socialLinks?.facebook || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          facebook: e.target.value || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/yourhandle"
                    value={settings.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          twitter: e.target.value || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/company/yourcompany"
                    value={settings.socialLinks?.linkedin || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          linkedin: e.target.value || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/yourhandle"
                    value={settings.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          instagram: e.target.value || undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store / Company Name</Label>
                  <Input
                    id="storeName"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    value={settings.legalName || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, legalName: e.target.value || null })
                    }
                    placeholder="Registered business name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Support Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Support Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value || null })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value || null })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.city || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, city: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={settings.state || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, state: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={settings.country || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, country: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={settings.postalCode || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, postalCode: e.target.value || null })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>
                Configure currency and locale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        currency: value,
                        currencySymbol:
                          value === "INR"
                            ? "₹"
                            : value === "USD"
                            ? "$"
                            : value === "EUR"
                            ? "€"
                            : "£",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                      <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) =>
                      setSettings({ ...settings, currencySymbol: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe
              </CardTitle>
              <CardDescription>
                Configure Stripe payment gateway
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Stripe</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept payments via Stripe
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="stripePublishable">Publishable Key</Label>
                <Input
                  id="stripePublishable"
                  type="password"
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripeSecret">Secret Key</Label>
                <Input
                  id="stripeSecret"
                  type="password"
                  placeholder="sk_test_..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Razorpay
              </CardTitle>
              <CardDescription>
                Configure Razorpay payment gateway
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Razorpay</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept payments via Razorpay
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="razorpayKey">Key ID</Label>
                <Input
                  id="razorpayKey"
                  type="password"
                  placeholder="rzp_test_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpaySecret">Key Secret</Label>
                <Input
                  id="razorpaySecret"
                  type="password"
                  placeholder="..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" placeholder="587" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input id="smtpUser" placeholder="username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPass">SMTP Password</Label>
                  <Input id="smtpPass" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security options for your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out inactive users
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
