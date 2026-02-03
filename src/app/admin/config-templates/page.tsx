"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ConfigTemplate {
  id: string;
  name: string;
  description: string | null;
  inputType: string;
  unit: string | null;
  pricePerUnit: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function ConfigTemplatesPage() {
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConfigTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    inputType: "SELECT",
    unit: "",
    pricePerUnit: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch("/api/config-templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      inputType: "SELECT",
      unit: "",
      pricePerUnit: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (template: ConfigTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      inputType: template.inputType,
      unit: template.unit || "",
      pricePerUnit: template.pricePerUnit?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/config-templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/config-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          inputType: formData.inputType,
          unit: formData.unit || null,
          pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : null,
          isActive: true,
        }),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        if (editingTemplate) {
          setTemplates(templates.map((t) => (t.id === editingTemplate.id ? newTemplate : t)));
        } else {
          setTemplates([newTemplate, ...templates]);
        }
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: editingTemplate ? "Template updated" : "Template created",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configuration Templates</h1>
          <p className="text-gray-500 mt-1">
            Create reusable configuration options for your products
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-[#8B1D1D] hover:bg-[#7A1919]">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
          <p className="text-gray-500 mt-1">
            Create your first configuration template to get started
          </p>
          <Button onClick={handleCreate} className="mt-4 bg-[#8B1D1D] hover:bg-[#7A1919]">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#8B1D1D]" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{template.inputType}</Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unit:</span>
                    <span className="font-medium">{template.unit || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="font-medium">
                      {template.pricePerUnit ? `$${template.pricePerUnit}` : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="flex-1"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Configuration Template" : "Create Configuration Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update the configuration template details"
                : "Add a new reusable configuration template"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CPU Cores, RAM Size"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this configuration is for"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inputType">Input Type *</Label>
              <Select
                value={formData.inputType}
                onValueChange={(value) => setFormData({ ...formData, inputType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select input type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELECT">Dropdown</SelectItem>
                  <SelectItem value="RADIO">Radio Buttons</SelectItem>
                  <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                  <SelectItem value="SLIDER">Slider</SelectItem>
                  <SelectItem value="NUMBER">Number Input</SelectItem>
                  <SelectItem value="TEXT">Text Input</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit (for display)</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., GB, Core, TB"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerUnit">Price Per Unit</Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#8B1D1D] hover:bg-[#7A1919]">
              {editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
