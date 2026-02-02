"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Settings,
  Wifi,
  Shield,
  Cloud,
  Database,
  Server,
  Monitor,
  Brain,
  Share2,
  Lock,
  Folder,
  Globe,
  Wrench,
  Box,
  Home,
  ShoppingBag,
  Tag,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Users,
  Building,
  Briefcase,
  Heart,
  Star,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id?: string;
  label: string;
  href: string | null;
  icon: string | null;
  description: string | null;
  badge: string | null;
  badgeColor: string | null;
  target: string;
  isActive: boolean;
  sortOrder: number;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  items: MenuItem[];
}

const iconOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "home", label: "Home", icon: Home },
  { value: "shopping-bag", label: "Shopping Bag", icon: ShoppingBag },
  { value: "tag", label: "Tag / Sale", icon: Tag },
  { value: "wifi", label: "Wi-Fi / Connectivity", icon: Wifi },
  { value: "shield", label: "Shield / Security", icon: Shield },
  { value: "cloud", label: "Cloud Services", icon: Cloud },
  { value: "database", label: "Database", icon: Database },
  { value: "server", label: "Server", icon: Server },
  { value: "monitor", label: "Monitor", icon: Monitor },
  { value: "brain", label: "Brain / AI", icon: Brain },
  { value: "share2", label: "Network / IoT", icon: Share2 },
  { value: "lock", label: "Lock / Privacy", icon: Lock },
  { value: "folder", label: "Folder / General", icon: Folder },
  { value: "globe", label: "Globe / Web", icon: Globe },
  { value: "wrench", label: "Tools / DevOps", icon: Wrench },
  { value: "box", label: "Box / Package", icon: Box },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "mail", label: "Email", icon: Mail },
  { value: "help-circle", label: "Help", icon: HelpCircle },
  { value: "file-text", label: "Documentation", icon: FileText },
  { value: "users", label: "Users / Team", icon: Users },
  { value: "building", label: "Building / Company", icon: Building },
  { value: "briefcase", label: "Careers", icon: Briefcase },
  { value: "heart", label: "Heart / Favorites", icon: Heart },
  { value: "star", label: "Star / Featured", icon: Star },
  { value: "message-square", label: "Messages / Chat", icon: MessageSquare },
];

const getIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return Folder;
  const found = iconOptions.find((opt) => opt.value === iconName);
  return found ? found.icon : Folder;
};

const emptyMenuItem: MenuItem = {
  label: "",
  href: "",
  icon: null,
  description: null,
  badge: null,
  badgeColor: null,
  target: "_self",
  isActive: true,
  sortOrder: 0,
  children: [],
};

export default function MenuEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingParentIndex, setEditingParentIndex] = useState<number | null>(null);
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMenu();
  }, [resolvedParams.id]);

  async function fetchMenu() {
    try {
      const response = await fetch(`/api/menus/${resolvedParams.id}`);
      const data = await response.json();

      if (data.data) {
        setMenu(data.data);
        setItems(data.data.items || []);
      } else {
        toast({
          title: "Error",
          description: "Menu not found",
          variant: "destructive",
        });
        router.push("/admin/menus");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!menu) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/menus/${menu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menu.name,
          description: menu.description,
          isActive: menu.isActive,
          items: items.map((item, index) => ({
            ...item,
            sortOrder: index,
            children: item.children?.map((child, childIndex) => ({
              ...child,
              sortOrder: childIndex,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save menu");
      }

      toast({
        title: "Success",
        description: "Menu saved successfully",
      });

      fetchMenu();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save menu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function openAddItemDialog(parentIndex?: number) {
    setEditingItem({ ...emptyMenuItem });
    setEditingParentIndex(parentIndex ?? null);
    setEditingChildIndex(null);
    setShowItemDialog(true);
  }

  function openEditItemDialog(parentIndex: number, childIndex?: number) {
    if (childIndex !== undefined) {
      setEditingItem({ ...items[parentIndex].children![childIndex] });
      setEditingParentIndex(parentIndex);
      setEditingChildIndex(childIndex);
    } else {
      setEditingItem({ ...items[parentIndex] });
      setEditingParentIndex(parentIndex);
      setEditingChildIndex(null);
    }
    setShowItemDialog(true);
  }

  function saveItem() {
    if (!editingItem || !editingItem.label) return;

    const newItems = [...items];

    if (editingParentIndex !== null && editingChildIndex !== null) {
      // Editing existing child item
      newItems[editingParentIndex].children![editingChildIndex] = editingItem;
    } else if (editingParentIndex !== null && editingChildIndex === null && editingItem.id === undefined && !items[editingParentIndex]?.id) {
      // Adding new child to existing parent (parentIndex is set, but we're adding not editing)
      // Actually, let's check if we're adding a child
      if (editingParentIndex < items.length) {
        // Adding child to existing item
        if (!newItems[editingParentIndex].children) {
          newItems[editingParentIndex].children = [];
        }
        newItems[editingParentIndex].children!.push(editingItem);
      }
    } else if (editingParentIndex !== null && !editingItem.id) {
      // Could be adding child or editing parent
      const existingItem = items[editingParentIndex];
      if (existingItem && editingItem.label !== existingItem.label) {
        // It's an edit of the parent item
        newItems[editingParentIndex] = { ...editingItem, children: existingItem.children };
      } else if (!existingItem) {
        // Adding new top-level item
        newItems.push(editingItem);
      }
    } else if (editingParentIndex !== null) {
      // Editing existing top-level item
      const existingChildren = newItems[editingParentIndex]?.children || [];
      newItems[editingParentIndex] = { ...editingItem, children: existingChildren };
    } else {
      // Adding new top-level item
      newItems.push(editingItem);
    }

    setItems(newItems);
    setShowItemDialog(false);
    setEditingItem(null);
    setEditingParentIndex(null);
    setEditingChildIndex(null);
  }

  function addChildItem(parentIndex: number) {
    setEditingItem({ ...emptyMenuItem });
    setEditingParentIndex(parentIndex);
    setEditingChildIndex(-1); // -1 indicates adding new child
    setShowItemDialog(true);
  }

  function saveChildItem() {
    if (!editingItem || !editingItem.label || editingParentIndex === null) return;

    const newItems = [...items];

    if (editingChildIndex === -1) {
      // Adding new child
      if (!newItems[editingParentIndex].children) {
        newItems[editingParentIndex].children = [];
      }
      newItems[editingParentIndex].children!.push(editingItem);
    } else if (editingChildIndex !== null) {
      // Editing existing child
      newItems[editingParentIndex].children![editingChildIndex] = editingItem;
    }

    setItems(newItems);
    setShowItemDialog(false);
    setEditingItem(null);
    setEditingParentIndex(null);
    setEditingChildIndex(null);
  }

  function removeItem(parentIndex: number, childIndex?: number) {
    const newItems = [...items];
    if (childIndex !== undefined) {
      newItems[parentIndex].children = newItems[parentIndex].children?.filter(
        (_, i) => i !== childIndex
      );
    } else {
      newItems.splice(parentIndex, 1);
    }
    setItems(newItems);
  }

  function moveItem(parentIndex: number, direction: "up" | "down", childIndex?: number) {
    const newItems = [...items];

    if (childIndex !== undefined) {
      // Moving child item
      const children = [...(newItems[parentIndex].children || [])];
      const targetIndex = direction === "up" ? childIndex - 1 : childIndex + 1;
      if (targetIndex < 0 || targetIndex >= children.length) return;
      [children[childIndex], children[targetIndex]] = [children[targetIndex], children[childIndex]];
      newItems[parentIndex].children = children;
    } else {
      // Moving parent item
      const targetIndex = direction === "up" ? parentIndex - 1 : parentIndex + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return;
      [newItems[parentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[parentIndex]];
    }

    setItems(newItems);
  }

  function toggleExpanded(index: number) {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!menu) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/menus">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{menu.name}</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {menu.location}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>
                    Drag to reorder, click to edit
                  </CardDescription>
                </div>
                <Button onClick={() => openAddItemDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No menu items yet</p>
                  <p className="text-sm">Click &quot;Add Item&quot; to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const IconComponent = getIconComponent(item.icon);
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedItems.has(index);

                    return (
                      <div key={index} className="border rounded-lg">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg">
                          <div className="flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveItem(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronDown className="h-3 w-3 rotate-180" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveItem(index, "down")}
                              disabled={index === items.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>

                          {hasChildren && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleExpanded(index)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          <div className="w-8 h-8 rounded bg-white border flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{item.label}</span>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  style={{ backgroundColor: item.badgeColor || undefined }}
                                  className={item.badgeColor ? "text-white" : ""}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {!item.isActive && (
                                <Badge variant="outline">Hidden</Badge>
                              )}
                            </div>
                            {item.href && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.href}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addChildItem(index)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Sub-item
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditItemDialog(index)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Children */}
                        {hasChildren && isExpanded && (
                          <div className="border-t bg-white rounded-b-lg">
                            {item.children!.map((child, childIndex) => {
                              const ChildIconComponent = getIconComponent(child.icon);
                              return (
                                <div
                                  key={childIndex}
                                  className="flex items-center gap-2 p-3 pl-12 border-b last:border-b-0"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => moveItem(index, "up", childIndex)}
                                      disabled={childIndex === 0}
                                    >
                                      <ChevronDown className="h-3 w-3 rotate-180" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => moveItem(index, "down", childIndex)}
                                      disabled={childIndex === item.children!.length - 1}
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center">
                                    <ChildIconComponent className="h-3.5 w-3.5 text-gray-500" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium truncate">
                                        {child.label}
                                      </span>
                                      {child.badge && (
                                        <Badge variant="secondary" className="text-xs">
                                          {child.badge}
                                        </Badge>
                                      )}
                                      {!child.isActive && (
                                        <Badge variant="outline" className="text-xs">
                                          Hidden
                                        </Badge>
                                      )}
                                    </div>
                                    {child.href && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {child.href}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openEditItemDialog(index, childIndex)}
                                    >
                                      <Settings className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => removeItem(index, childIndex)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Menu Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Menu Name</Label>
                <Input
                  value={menu.name}
                  onChange={(e) => setMenu({ ...menu, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location Key</Label>
                <Input value={menu.location} disabled className="bg-gray-50" />
                <p className="text-xs text-muted-foreground">
                  Location cannot be changed after creation
                </p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={menu.description || ""}
                  onChange={(e) => setMenu({ ...menu, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={menu.isActive}
                  onCheckedChange={(checked) => setMenu({ ...menu, isActive: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Use this code to fetch this menu in your components:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                {`fetch('/api/menus?location=${menu.location}')`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Item Edit Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChildIndex !== null && editingChildIndex >= 0
                ? "Edit Sub-item"
                : editingChildIndex === -1
                ? "Add Sub-item"
                : editingParentIndex !== null && items[editingParentIndex]
                ? "Edit Menu Item"
                : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={editingItem.label}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, label: e.target.value })
                  }
                  placeholder="e.g., Products"
                />
              </div>

              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={editingItem.href || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, href: e.target.value || null })
                  }
                  placeholder="e.g., /products"
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={editingItem.icon || "none"}
                  onValueChange={(value) =>
                    setEditingItem({
                      ...editingItem,
                      icon: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Icon</SelectItem>
                    {iconOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value || null,
                    })
                  }
                  placeholder="Short description (for mega menus)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input
                    value={editingItem.badge || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        badge: e.target.value || null,
                      })
                    }
                    placeholder="e.g., New"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Color</Label>
                  <Input
                    type="color"
                    value={editingItem.badgeColor || "#8B1D1D"}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, badgeColor: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Open In</Label>
                <Select
                  value={editingItem.target}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, target: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Tab</SelectItem>
                    <SelectItem value="_blank">New Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch
                  checked={editingItem.isActive}
                  onCheckedChange={(checked) =>
                    setEditingItem({ ...editingItem, isActive: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingChildIndex === -1 || editingChildIndex !== null) {
                  saveChildItem();
                } else {
                  saveItem();
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
