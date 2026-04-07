import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import {
  Cloud,
  Shield,
  Wifi,
  Server,
  Database,
  Lock,
  Globe,
  Settings,
  Box,
  Monitor,
  Cpu,
  HardDrive,
  Briefcase,
  ShoppingCart,
  CreditCard,
  Truck,
  Package,
  FileText,
  Users,
  BarChart,
  Zap,
  Router,
  Headphones,
  Camera,
  Fingerprint,
  Layers,
  Folder,
} from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "All Categories | Shaurrya Teleservices",
  description: "Explore our comprehensive range of enterprise solutions and services. Find cloud infrastructure, security, networking, and more.",
};

// Icon mapping based on category name keywords
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  
  if (name.includes("cloud")) return Cloud;
  if (name.includes("security") || name.includes("secure")) return Shield;
  if (name.includes("network") || name.includes("wifi")) return Wifi;
  if (name.includes("server")) return Server;
  if (name.includes("database") || name.includes("data")) return Database;
  if (name.includes("lock") || name.includes("access")) return Lock;
  if (name.includes("web") || name.includes("internet")) return Globe;
  if (name.includes("setting") || name.includes("config")) return Settings;
  if (name.includes("storage")) return HardDrive;
  if (name.includes("computer") || name.includes("desktop")) return Monitor;
  if (name.includes("processor") || name.includes("cpu")) return Cpu;
  if (name.includes("hardware") || name.includes("device")) return Box;
  if (name.includes("software") || name.includes("app")) return Layers;
  if (name.includes("backup") || name.includes("recovery")) return FileText;
  if (name.includes("analytics") || name.includes("report")) return BarChart;
  if (name.includes("collab") || name.includes("team") || name.includes("user")) return Users;
  if (name.includes("payment") || name.includes("billing")) return CreditCard;
  if (name.includes("shipping") || name.includes("delivery")) return Truck;
  if (name.includes("erp") || name.includes("business")) return Briefcase;
  if (name.includes("crm") || name.includes("customer")) return Users;
  if (name.includes("phone") || name.includes("voip")) return Headphones;
  if (name.includes("camera") || name.includes("video")) return Camera;
  if (name.includes("identity") || name.includes("auth")) return Fingerprint;
  if (name.includes("power") || name.includes("energy")) return Zap;
  if (name.includes("router") || name.includes("switch")) return Router;
  
  return Folder; // default icon
}

// Get color based on category name
function getCategoryColor(categoryName: string) {
  const name = categoryName.toLowerCase();
  
  if (name.includes("cloud")) return "bg-blue-100 text-blue-600";
  if (name.includes("security") || name.includes("secure")) return "bg-red-100 text-red-600";
  if (name.includes("network") || name.includes("wifi")) return "bg-cyan-100 text-cyan-600";
  if (name.includes("server") || name.includes("database")) return "bg-indigo-100 text-indigo-600";
  if (name.includes("storage")) return "bg-purple-100 text-purple-600";
  if (name.includes("software") || name.includes("app")) return "bg-green-100 text-green-600";
  if (name.includes("payment") || name.includes("billing")) return "bg-yellow-100 text-yellow-600";
  if (name.includes("erp") || name.includes("business")) return "bg-orange-100 text-orange-600";
  
  return "bg-gray-100 text-gray-600"; // default color
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });
  return categories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="bg-white min-h-screen">
      {/* Headline */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Find, Buy, and Manage Everything on One Platform
          </h1>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex flex-col items-center p-6 rounded-xl hover:bg-gray-50 transition-colors w-64"
              >
                {category.image ? (
                  <div className="w-32 h-32 relative mb-4">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  // Show icon based on category name
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ${getCategoryColor(category.name)}`}>
                    {React.createElement(getCategoryIcon(category.name), { className: "w-16 h-16" })}
                  </div>
                )}
                <span className="text-xl font-semibold text-gray-900 text-center">
                  {category.name}
                </span>
                {category.description && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500">Check back soon for our product catalog.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
