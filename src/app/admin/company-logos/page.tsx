"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CompanyLogo {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function CompanyLogosPage() {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<CompanyLogo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    isActive: true,
    sortOrder: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLogos();
  }, []);

  async function fetchLogos() {
    try {
      const response = await fetch("/api/company-logos");
      const data = await response.json();
      setLogos(data.data || []);
    } catch (error) {
      console.error("Error fetching logos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch company logos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingLogo(null);
    setFormData({
      name: "",
      logo: "",
      website: "",
      isActive: true,
      sortOrder: logos.length,
    });
    setDialogOpen(true);
  }

  function openEditDialog(logo: CompanyLogo) {
    setEditingLogo(logo);
    setFormData({
      name: logo.name,
      logo: logo.logo,
      website: logo.website || "",
      isActive: logo.isActive,
      sortOrder: logo.sortOrder,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formData.name || !formData.logo) {
      toast({
        title: "Validation Error",
        description: "Name and logo URL are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const url = editingLogo
        ? `/api/company-logos/${editingLogo.id}`
        : "/api/company-logos";
      const method = editingLogo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          website: formData.website || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      toast({
        title: "Success",
        description: editingLogo
          ? "Company logo updated"
          : "Company logo created",
      });

      setDialogOpen(false);
      fetchLogos();
    } catch (error) {
      console.error("Error saving logo:", error);
      toast({
        title: "Error",
        description: "Failed to save company logo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this logo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/company-logos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast({
        title: "Success",
        description: "Company logo deleted",
      });

      fetchLogos();
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast({
        title: "Error",
        description: "Failed to delete company logo",
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
          <h1 className="text-3xl font-bold">Company Logos</h1>
          <p className="text-muted-foreground mt-1">
            Manage the auto-scrolling company logos section on the homepage
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Logo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No company logos yet. Click &quot;Add Logo&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              logos.map((logo) => (
                <TableRow key={logo.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-10 flex items-center justify-center bg-gray-50 rounded border">
                      <img
                        src={logo.logo}
                        alt={logo.name}
                        className="max-h-8 max-w-20 object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{logo.name}</TableCell>
                  <TableCell>
                    {logo.website ? (
                      <a
                        href={logo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        {new URL(logo.website).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={logo.isActive ? "default" : "secondary"}>
                      {logo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{logo.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(logo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(logo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLogo ? "Edit Company Logo" : "Add Company Logo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Microsoft, Google, Amazon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL *</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
              {formData.logo && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <img
                    src={formData.logo}
                    alt="Preview"
                    className="max-h-12 max-w-32 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL (optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://company-website.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingLogo ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
