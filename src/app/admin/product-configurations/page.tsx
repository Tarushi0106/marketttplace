"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Loader2,
  Server,
  Cpu,
  Database,
  Globe,
  Layers,
  Save,
  Check,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface ConfigOption {
  id?: string;
  value: string;
  label: string;
  description: string;
  priceModifier: number;
  monthlyPriceModifier: number;
  yearlyPriceModifier: number;
  sortOrder: number;
}

interface ProductConfiguration {
  id?: string;
  name: string;
  displayName: string;
  description: string;
  configType: string;
  inputType: string;
  unit: string;
  unitPlural: string;
  minValue: number;
  maxValue: number;
  stepValue: number;
  defaultValue: string;
  isRequired: boolean;
  allowCustom: boolean;
  sortOrder: number;
  // Pricing
  basePrice: number;
  pricePerUnit: number;
  options: ConfigOption[];
}

interface PresetConfig {
  displayName: string;
  inputType: string;
  unit?: string;
  unitPlural?: string;
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
  options: Array<{
    value: string;
    label: string;
    description: string;
    priceModifier: number;
    monthlyPriceModifier: number;
    yearlyPriceModifier: number;
  }>;
}

const configTypeOptions = [
  { value: "OS", label: "Operating System", icon: Server },
  { value: "DATA_CENTER", label: "Data Center Region", icon: Globe },
  { value: "CPU", label: "CPU", icon: Cpu },
  { value: "RAM", label: "RAM/Memory", icon: Database },
  { value: "STORAGE", label: "Storage", icon: Layers },
  { value: "GPU", label: "GPU", icon: Cpu },
  { value: "BANDWIDTH", label: "Bandwidth", icon: Globe },
  { value: "LICENSE", label: "License", icon: Check },
  { value: "OTHER", label: "Other", icon: Settings },
];

const inputTypeOptions = [
  { value: "SELECT", label: "Dropdown" },
  { value: "RADIO", label: "Radio Buttons" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "SLIDER", label: "Slider" },
  { value: "NUMBER", label: "Number Input" },
];

// Preset configurations with separate monthly/yearly pricing
const presetConfigs: Record<string, PresetConfig> = {
  OS: {
    displayName: "Operating System",
    inputType: "SELECT",
    options: [
      { value: "ubuntu-22-04", label: "Ubuntu 22.04 LTS", description: "Latest stable Ubuntu LTS", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "ubuntu-20-04", label: "Ubuntu 20.04 LTS", description: "Ubuntu 20.04 LTS", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "debian-11", label: "Debian 11", description: "Debian Bullseye", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "centos-9", label: "CentOS Stream 9", description: "CentOS Stream 9", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "windows-2022", label: "Windows Server 2022", description: "Windows Server 2022 Standard", priceModifier: 15, monthlyPriceModifier: 15, yearlyPriceModifier: 150 },
      { value: "windows-2019", label: "Windows Server 2019", description: "Windows Server 2019 Standard", priceModifier: 12, monthlyPriceModifier: 12, yearlyPriceModifier: 120 },
    ],
  },
  DATA_CENTER: {
    displayName: "Data Center Region",
    inputType: "SELECT",
    options: [
      { value: "us-east", label: "US East (New York)", description: "New York, USA", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "us-west", label: "US West (Los Angeles)", description: "Los Angeles, USA", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "eu-west", label: "Europe (Frankfurt)", description: "Frankfurt, Germany", priceModifier: 5, monthlyPriceModifier: 5, yearlyPriceModifier: 50 },
      { value: "eu-north", label: "Europe (Stockholm)", description: "Stockholm, Sweden", priceModifier: 5, monthlyPriceModifier: 5, yearlyPriceModifier: 50 },
      { value: "asia-south", label: "Asia Pacific (Mumbai)", description: "Mumbai, India", priceModifier: 0, monthlyPriceModifier: 0, yearlyPriceModifier: 0 },
      { value: "asia-east", label: "Asia Pacific (Singapore)", description: "Singapore", priceModifier: 10, monthlyPriceModifier: 10, yearlyPriceModifier: 100 },
    ],
  },
  CPU: {
    displayName: "CPU Resources",
    inputType: "RADIO",
    unit: "vCPU",
    unitPlural: "vCPUs",
    options: [
      { value: "1", label: "1 vCPU", description: "1 CPU core", priceModifier: 5, monthlyPriceModifier: 5, yearlyPriceModifier: 50 },
      { value: "2", label: "2 vCPU", description: "2 CPU cores", priceModifier: 10, monthlyPriceModifier: 10, yearlyPriceModifier: 100 },
      { value: "4", label: "4 vCPU", description: "4 CPU cores", priceModifier: 20, monthlyPriceModifier: 20, yearlyPriceModifier: 200 },
      { value: "8", label: "8 vCPU", description: "8 CPU cores", priceModifier: 40, monthlyPriceModifier: 40, yearlyPriceModifier: 400 },
      { value: "16", label: "16 vCPU", description: "16 CPU cores", priceModifier: 80, monthlyPriceModifier: 80, yearlyPriceModifier: 800 },
    ],
  },
  RAM: {
    displayName: "Memory (RAM)",
    inputType: "RADIO",
    unit: "GB",
    unitPlural: "GB",
    options: [
      { value: "2", label: "2 GB", description: "2GB RAM", priceModifier: 3, monthlyPriceModifier: 3, yearlyPriceModifier: 30 },
      { value: "4", label: "4 GB", description: "4GB RAM", priceModifier: 6, monthlyPriceModifier: 6, yearlyPriceModifier: 60 },
      { value: "8", label: "8 GB", description: "8GB RAM", priceModifier: 12, monthlyPriceModifier: 12, yearlyPriceModifier: 120 },
      { value: "16", label: "16 GB", description: "16GB RAM", priceModifier: 24, monthlyPriceModifier: 24, yearlyPriceModifier: 240 },
      { value: "32", label: "32 GB", description: "32GB RAM", priceModifier: 48, monthlyPriceModifier: 48, yearlyPriceModifier: 480 },
      { value: "64", label: "64 GB", description: "64GB RAM", priceModifier: 96, monthlyPriceModifier: 96, yearlyPriceModifier: 960 },
    ],
  },
  STORAGE: {
    displayName: "Storage (SSD)",
    inputType: "SLIDER",
    unit: "GB",
    unitPlural: "GB",
    minValue: 20,
    maxValue: 1000,
    stepValue: 10,
    options: [],
  },
};

export default function ProductConfigurationsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [configurations, setConfigurations] = useState<ProductConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ProductConfiguration | null>(null);
  const [formData, setFormData] = useState<ProductConfiguration>({
    name: "",
    displayName: "",
    description: "",
    configType: "STANDARD",
    inputType: "SELECT",
    unit: "",
    unitPlural: "",
    minValue: 0,
    maxValue: 100,
    stepValue: 1,
    defaultValue: "",
    isRequired: true,
    allowCustom: false,
    sortOrder: 0,
    basePrice: 0,
    pricePerUnit: 0,
    options: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchConfigurations();
    } else {
      setConfigurations([]);
    }
  }, [selectedProduct]);

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.data) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfigurations() {
    try {
      const response = await fetch(`/api/products/${selectedProduct}/configs`);
      const data = await response.json();
      const parsed = (data || []).map((config: any) => ({
        ...config,
        options:
          typeof config.options === "string"
            ? JSON.parse(config.options)
            : config.options || [],
      }));
      setConfigurations(parsed);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      setConfigurations([]);
    }
  }

  async function handleSave() {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log("Saving configurations:", configurations);
      
      const configsResponse = await fetch(`/api/products/${selectedProduct}/configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configurations }),
      });

      if (!configsResponse.ok) {
        const errorText = await configsResponse.text();
        console.error("Configs save error:", errorText);
        throw new Error(`Failed to save configurations: ${errorText}`);
      }

      const configsData = await configsResponse.json();
      console.log("Configs saved successfully:", configsData);

      toast({
        title: "Success",
        description: "Configurations saved successfully",
      });
      fetchConfigurations();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configurations",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function applyPreset(configType: string) {
    const preset = presetConfigs[configType];
    if (!preset) return;

    const newConfig: ProductConfiguration = {
      name: configType,
      displayName: preset.displayName,
      description: `Select your preferred ${preset.displayName.toLowerCase()}`,
      configType,
      inputType: preset.inputType,
      unit: preset.unit || "",
      unitPlural: preset.unitPlural || "",
      minValue: preset.minValue || 0,
      maxValue: preset.maxValue || 100,
      stepValue: preset.stepValue || 1,
      defaultValue: "",
      isRequired: true,
      allowCustom: false,
      sortOrder: configurations.length,
      basePrice: 0,
      pricePerUnit: 0,
      options: preset.options.map((opt, index) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description,
        priceModifier: opt.priceModifier,
        monthlyPriceModifier: opt.monthlyPriceModifier,
        yearlyPriceModifier: opt.yearlyPriceModifier,
        sortOrder: index,
      })),
    };

    setConfigurations([...configurations, newConfig]);
    toast({
      title: "Preset Applied",
      description: `${preset.displayName} configuration has been added`,
    });
  }

  function handleCreate() {
    setEditingConfig(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      configType: "STANDARD",
      inputType: "SELECT",
      unit: "",
      unitPlural: "",
      minValue: 0,
      maxValue: 100,
      stepValue: 1,
      defaultValue: "",
      isRequired: true,
      allowCustom: false,
      sortOrder: configurations.length,
      basePrice: 0,
      pricePerUnit: 0,
      options: [],
    });
    setIsDialogOpen(true);
  }

  function handleEdit(config: ProductConfiguration) {
    setEditingConfig(config);
    setFormData(config);
    setIsDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this configuration?")) return;
    setConfigurations(configurations.filter((c) => c.id !== id));
  }

  function handleSubmit() {
    if (editingConfig) {
      setConfigurations(
        configurations.map((c) =>
          c.id === editingConfig.id ? { ...formData, id: editingConfig.id } : c
        )
      );
    } else {
      const newConfig = {
        ...formData,
        id: `config-${Date.now()}`,
      };
      setConfigurations([...configurations, newConfig]);
    }
    setIsDialogOpen(false);
  }

  function addOption() {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          value: "",
          label: "",
          description: "",
          priceModifier: 0,
          monthlyPriceModifier: 0,
          yearlyPriceModifier: 0,
          sortOrder: formData.options.length,
        },
      ],
    });
  }

  function updateOption(index: number, field: string, value: any) {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  }

  function removeOption(index: number) {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  }

  const selectedProductName = products.find((p) => p.id === selectedProduct)?.name;

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
          <h1 className="text-3xl font-bold">Product Configurations</h1>
          <p className="text-muted-foreground mt-1">
            Manage OS, Data Center, CPU, RAM, Storage with monthly/yearly pricing
          </p>
        </div>
        {selectedProduct && configurations.length > 0 && (
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        )}
      </div>

      {/* Product Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
          <CardDescription>
            Choose a product to manage its configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Presets</CardTitle>
              <CardDescription>
                Click to add common configurations with monthly/yearly pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {configTypeOptions.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    onClick={() => applyPreset(type.value)}
                    disabled={configurations.some((c) => c.configType === type.value)}
                  >
                    <type.icon className="mr-2 h-4 w-4" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurations List */}
          {configurations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No configurations for {selectedProductName}
                </h3>
                <p className="text-gray-500 mt-1">
                  Add configurations using the presets above or create custom ones
                </p>
                <Button onClick={handleCreate} className="mt-4 bg-[#1E2260] hover:bg-[#161848]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Configurations ({configurations.length})
                </h2>
                <Button onClick={handleCreate} className="bg-[#1E2260] hover:bg-[#161848]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Configuration
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {configurations.map((config) => {
                  const configType = configTypeOptions.find((c) => c.value === config.configType);
                  const Icon = configType?.icon || Settings;
                  return (
                    <Card key={config.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-[#1E2260]" />
                            <CardTitle className="text-lg">{config.displayName}</CardTitle>
                          </div>
                          <Badge variant="outline">{config.configType}</Badge>
                        </div>
                        <CardDescription>{config.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Input Type:</span>
                            <span className="font-medium">{config.inputType}</span>
                          </div>
                          {config.unit && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Unit:</span>
                              <span className="font-medium">{config.unit}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Options:</span>
                            <span className="font-medium">{config.options.length}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(config.id!)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edit Configuration" : "Add New Configuration"}
            </DialogTitle>
            <DialogDescription>
              Configure {editingConfig ? "the existing" : "a new"} configuration option with monthly/yearly pricing
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="options">Options with Pricing</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g., Operating System"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="configType">Configuration Type *</Label>
                  <Select
                    value={formData.configType}
                    onValueChange={(value) => setFormData({ ...formData, configType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {configTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this configuration option"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inputType">Input Type *</Label>
                  <Select
                    value={formData.inputType}
                    onValueChange={(value) => setFormData({ ...formData, inputType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select input type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inputTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
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
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit (singular)</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., Core"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPlural">Unit (plural)</Label>
                  <Input
                    id="unitPlural"
                    value={formData.unitPlural}
                    onChange={(e) => setFormData({ ...formData, unitPlural: e.target.value })}
                    placeholder="e.g., Cores"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultValue">Default Value</Label>
                  <Input
                    id="defaultValue"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>
              {(formData.inputType === "SLIDER" || formData.inputType === "NUMBER") && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="minValue">Minimum Value</Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={formData.minValue}
                      onChange={(e) =>
                        setFormData({ ...formData, minValue: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxValue">Maximum Value</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={formData.maxValue}
                      onChange={(e) =>
                        setFormData({ ...formData, maxValue: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stepValue">Step Value</Label>
                    <Input
                      id="stepValue"
                      type="number"
                      value={formData.stepValue}
                      onChange={(e) =>
                        setFormData({ ...formData, stepValue: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isRequired">Required</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowCustom"
                    checked={formData.allowCustom}
                    onChange={(e) => setFormData({ ...formData, allowCustom: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="allowCustom">Allow Custom Value</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="pricing" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Configuration Pricing
                  </CardTitle>
                  <CardDescription>
                    Set the base price and per-unit pricing for this configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Base Price (Rs)</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="e.g., 0"
                      />
                      <p className="text-sm text-gray-500">
                        Base price added when this configuration is selected
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerUnit">Price Per Unit (Rs)</Label>
                      <Input
                        id="pricePerUnit"
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={(e) =>
                          setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="e.g., 5"
                      />
                      <p className="text-sm text-gray-500">
                        Price per unit (for SLIDER/NUMBER input types)
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Pricing Examples:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Base Price Rs 0 + Price Per Unit Rs 5 for slider = Rs 5 per unit selected</li>
                      <li>• Base Price Rs 10 = Fixed Rs 10 added to total</li>
                      <li>• Option prices are ADDED to base price</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="options" className="space-y-4 mt-4">
              <Tabs defaultValue="monthly">
                <TabsList>
                  <TabsTrigger value="monthly">Monthly Price (Rs)</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly Price (Rs)</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Monthly Pricing Options</Label>
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  {formData.options.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No options added yet. Click "Add Option" to create monthly pricing options.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                          <div className="flex-1 grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={option.label}
                                onChange={(e) => updateOption(index, "label", e.target.value)}
                                placeholder="Option Label (e.g., Ubuntu 22.04 LTS)"
                                className="flex-1"
                              />
                              {Number(option.monthlyPriceModifier) > 0 && (
                                <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                                  ₹{option.monthlyPriceModifier}/mo
                                </span>
                              )}
                            </div>
                            <Input
                              value={option.value}
                              onChange={(e) => updateOption(index, "value", e.target.value)}
                              placeholder="Option Value (e.g., ubuntu-22-04)"
                            />
                            <Textarea
                              value={option.description}
                              onChange={(e) => updateOption(index, "description", e.target.value)}
                              placeholder="Description"
                              className="md:col-span-2"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Monthly Price:</span>
                              <Input
                                type="number"
                                value={option.monthlyPriceModifier}
                                onChange={(e) =>
                                  updateOption(index, "monthlyPriceModifier", parseFloat(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-32"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#1E2260]"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="yearly" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Yearly Pricing Options</Label>
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  {formData.options.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No options added yet. Click "Add Option" to create yearly pricing options.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                          <div className="flex-1 grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={option.label}
                                onChange={(e) => updateOption(index, "label", e.target.value)}
                                placeholder="Option Label (e.g., Ubuntu 22.04 LTS)"
                                className="flex-1"
                              />
                              {Number(option.yearlyPriceModifier) > 0 && (
                                <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                                  ₹{option.yearlyPriceModifier}/yr
                                </span>
                              )}
                            </div>
                            <Input
                              value={option.value}
                              onChange={(e) => updateOption(index, "value", e.target.value)}
                              placeholder="Option Value (e.g., ubuntu-22-04)"
                            />
                            <Textarea
                              value={option.description}
                              onChange={(e) => updateOption(index, "description", e.target.value)}
                              placeholder="Description"
                              className="md:col-span-2"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Yearly Price:</span>
                              <Input
                                type="number"
                                value={option.yearlyPriceModifier}
                                onChange={(e) =>
                                  updateOption(index, "yearlyPriceModifier", parseFloat(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-32"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#1E2260]"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#1E2260] hover:bg-[#161848]">
              {editingConfig ? "Save Changes" : "Add Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
