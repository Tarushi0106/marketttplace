"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Menu as MenuIcon,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Menu {
  id: string;
  name: string;
  location: string;
  description?: string;
  isActive: boolean;
  _count?: { items: number };
  createdAt: string;
}

const menuLocationLabels: Record<string, string> = {
  header_main: "Header Main Navigation",
  header_categories: "Header Categories Dropdown",
  footer_solutions: "Footer - Solutions",
  footer_company: "Footer - Company",
  footer_support: "Footer - Support",
  footer_social: "Footer - Social Links",
};

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const [newMenu, setNewMenu] = useState({
    name: "",
    location: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    try {
      const response = await fetch("/api/menus?includeItems=false");
      const data = await response.json();
      if (data.data) {
        setMenus(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load menus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMenu() {
    if (!newMenu.name || !newMenu.location) {
      toast({
        title: "Error",
        description: "Name and location are required",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMenu),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create menu");
      }

      toast({
        title: "Success",
        description: "Menu created successfully",
      });

      setShowCreateDialog(false);
      setNewMenu({ name: "", location: "", description: "", isActive: true });
      fetchMenus();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create menu",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteMenu(id: string) {
    if (!confirm("Are you sure you want to delete this menu? All menu items will also be deleted.")) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/menus/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete menu");
      }

      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });

      fetchMenus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigation Menus</h1>
          <p className="text-muted-foreground mt-1">
            Manage your site&apos;s header and footer navigation
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Menu
        </Button>
      </div>

      {/* Menu Cards */}
      {menus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MenuIcon className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No menus yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first navigation menu to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Card key={menu.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MenuIcon className="h-4 w-4" />
                      {menu.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {menu.location}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/menus/${menu.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Menu
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteMenu(menu.id)}
                        disabled={deleting === menu.id}
                      >
                        {deleting === menu.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {menu.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {menu.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={menu.isActive ? "default" : "secondary"}>
                      {menu.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {menu._count?.items || 0} items
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/menus/${menu.id}`}>
                      <LayoutGrid className="mr-2 h-3 w-3" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preset Menu Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Setup</CardTitle>
          <CardDescription>
            Common menu locations you might want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(menuLocationLabels).map(([location, label]) => {
              const exists = menus.some((m) => m.location === location);
              return (
                <div
                  key={location}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    exists ? "bg-gray-50 border-gray-200" : "border-dashed border-gray-300"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{location}</p>
                  </div>
                  {exists ? (
                    <Badge variant="secondary">Created</Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewMenu({
                          name: label,
                          location,
                          description: "",
                          isActive: true,
                        });
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Menu Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Menu</DialogTitle>
            <DialogDescription>
              Add a new navigation menu to your site
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Menu Name *</Label>
              <Input
                id="name"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                placeholder="e.g., Main Navigation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location Key *</Label>
              <Input
                id="location"
                value={newMenu.location}
                onChange={(e) =>
                  setNewMenu({
                    ...newMenu,
                    location: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., header_main"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier used to fetch this menu in the frontend
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMenu.description}
                onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newMenu.isActive}
                onCheckedChange={(checked) => setNewMenu({ ...newMenu, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewMenu({ name: "", location: "", description: "", isActive: true });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateMenu} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
