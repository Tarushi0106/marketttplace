"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, X, GripVertical } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface PageSection {
  id: string;
  type: string;
  title: string;
  content: string;
  sortOrder: number;
}

const sectionTypes = [
  { value: "HERO", label: "Hero Banner" },
  { value: "TEXT", label: "Text Content" },
  { value: "FEATURES", label: "Features Grid" },
  { value: "CTA", label: "Call to Action" },
  { value: "FAQ", label: "FAQ Section" },
  { value: "TESTIMONIALS", label: "Testimonials" },
  { value: "PRODUCTS", label: "Products Grid" },
  { value: "CONTACT", label: "Contact Form" },
  { value: "CUSTOM", label: "Custom HTML" },
];

const templateOptions = [
  { value: "CONTENT", label: "Content Page" },
  { value: "LANDING", label: "Landing Page" },
  { value: "CONTACT", label: "Contact Page" },
  { value: "HOME", label: "Homepage" },
];

export default function NewPagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    template: "CONTENT",
    status: "DRAFT",
    isHomepage: false,
    sortOrder: 0,
  });
  const [sections, setSections] = useState<PageSection[]>([]);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(value: string) {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
  }

  function addSection() {
    const newSection: PageSection = {
      id: `temp-${Date.now()}`,
      type: "TEXT",
      title: "",
      content: "",
      sortOrder: sections.length,
    };
    setSections([...sections, newSection]);
  }

  function updateSection(id: string, updates: Partial<PageSection>) {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  }

  function removeSection(id: string) {
    setSections(sections.filter((section) => section.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast({
        title: "Validation Error",
        description: "Title and slug are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          sections: sections.map((section, index) => ({
            type: section.type,
            title: section.title || null,
            content: section.content ? JSON.parse(section.content) : {},
            sortOrder: index,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create page");
      }

      toast({
        title: "Success",
        description: "Page created successfully",
      });

      router.push("/admin/pages");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create page",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">New Page</h1>
          <p className="text-muted-foreground mt-1">Create a new website page</p>
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Page"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Page Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Information</CardTitle>
                <CardDescription>Basic page details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter page title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="page-url-slug"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Page will be accessible at: /{formData.slug || "slug"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Meta Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description for search engines..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Page Sections */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Page Sections</CardTitle>
                    <CardDescription>
                      Add content sections to your page
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addSection}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No sections added yet</p>
                    <p className="text-sm">
                      Click &quot;Add Section&quot; to start building your page
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center gap-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Section Type</Label>
                              <Select
                                value={section.type}
                                onValueChange={(value) =>
                                  updateSection(section.id, { type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {sectionTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Section Title</Label>
                              <Input
                                value={section.title}
                                onChange={(e) =>
                                  updateSection(section.id, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Section title (optional)"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSection(section.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Content (JSON)</Label>
                          <Textarea
                            value={section.content}
                            onChange={(e) =>
                              updateSection(section.id, {
                                content: e.target.value,
                              })
                            }
                            placeholder='{"heading": "Title", "text": "Content..."}'
                            rows={4}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter content as JSON object
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select
                    value={formData.template}
                    onValueChange={(value) =>
                      setFormData({ ...formData, template: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Homepage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isHomepage"
                    checked={formData.isHomepage}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isHomepage: checked })
                    }
                  />
                  <Label htmlFor="isHomepage">Set as Homepage</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  This page will be displayed at the root URL. Only one page can
                  be the homepage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
