import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@shaurryatele.com" },
    update: {
      password: adminPassword,
    },
    create: {
      email: "admin@shaurryatele.com",
      name: "Admin User",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "cloud-services" },
      update: {},
      create: {
        name: "Cloud Services",
        slug: "cloud-services",
        description: "Virtual machines, containers, and serverless computing",
        icon: "Cloud",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "network-solutions" },
      update: {},
      create: {
        name: "Network Solutions",
        slug: "network-solutions",
        description: "Load balancers, CDN, VPN, and DNS services",
        icon: "Server",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "security" },
      update: {},
      create: {
        name: "Security",
        slug: "security",
        description: "Firewalls, DDoS protection, and identity management",
        icon: "Shield",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "databases" },
      update: {},
      create: {
        name: "Databases",
        slug: "databases",
        description: "Relational, NoSQL, and in-memory databases",
        icon: "Database",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "devops-tools" },
      update: {},
      create: {
        name: "DevOps Tools",
        slug: "devops-tools",
        description: "CI/CD, monitoring, and container orchestration",
        icon: "Settings",
        sortOrder: 5,
      },
    }),
  ]);
  console.log("Created categories:", categories.length);

  // Create subcategories
  const cloudCategory = categories.find((c) => c.slug === "cloud-services");
  if (cloudCategory) {
    await Promise.all([
      prisma.subCategory.upsert({
        where: { slug: "virtual-machines" },
        update: {},
        create: {
          categoryId: cloudCategory.id,
          name: "Virtual Machines",
          slug: "virtual-machines",
          description: "Scalable compute instances",
          sortOrder: 1,
        },
      }),
      prisma.subCategory.upsert({
        where: { slug: "storage-solutions" },
        update: {},
        create: {
          categoryId: cloudCategory.id,
          name: "Storage Solutions",
          slug: "storage-solutions",
          description: "Object and block storage",
          sortOrder: 2,
        },
      }),
      prisma.subCategory.upsert({
        where: { slug: "kubernetes" },
        update: {},
        create: {
          categoryId: cloudCategory.id,
          name: "Kubernetes",
          slug: "kubernetes",
          description: "Managed container orchestration",
          sortOrder: 3,
        },
      }),
    ]);
  }

  // Create products
  const vmSubCategory = await prisma.subCategory.findUnique({
    where: { slug: "virtual-machines" },
  });

  const product1 = await prisma.product.upsert({
    where: { slug: "virtual-machine-pro" },
    update: {},
    create: {
      name: "Virtual Machine Pro",
      slug: "virtual-machine-pro",
      shortDescription: "High-performance cloud computing with dedicated resources",
      description:
        "Enterprise-grade virtual machines with dedicated CPU and memory resources. Perfect for applications that require consistent performance.",
      features: [
        "Dedicated vCPU cores",
        "NVMe SSD Storage",
        "Private Networking",
        "Automatic Backups",
        "99.99% Uptime SLA",
      ],
      specifications: {
        CPU: "8 vCPU (Dedicated)",
        RAM: "32GB DDR4",
        Storage: "500GB NVMe SSD",
        Network: "10 Gbps",
      },
      sku: "VM-PRO-001",
      basePrice: 99.99,
      compareAtPrice: 149.99,
      productType: "CONFIGURABLE",
      status: "ACTIVE",
      categoryId: cloudCategory?.id,
      subCategoryId: vmSubCategory?.id,
      isFeatured: true,
      isDigital: true,
      stockQuantity: 100,
    },
  });

  // Create variants for the product
  await Promise.all([
    prisma.productVariant.upsert({
      where: { sku: "VM-PRO-BASIC" },
      update: {},
      create: {
        productId: product1.id,
        name: "Basic",
        sku: "VM-PRO-BASIC",
        price: 49.99,
        stockQuantity: 100,
        attributes: { tier: "basic", cpu: "4 vCPU", ram: "16GB" },
        isDefault: false,
        sortOrder: 0,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "VM-PRO-PRO" },
      update: {},
      create: {
        productId: product1.id,
        name: "Pro",
        sku: "VM-PRO-PRO",
        price: 99.99,
        compareAtPrice: 149.99,
        stockQuantity: 100,
        attributes: { tier: "pro", cpu: "8 vCPU", ram: "32GB" },
        isDefault: true,
        sortOrder: 1,
      },
    }),
    prisma.productVariant.upsert({
      where: { sku: "VM-PRO-ENT" },
      update: {},
      create: {
        productId: product1.id,
        name: "Enterprise",
        sku: "VM-PRO-ENT",
        price: 199.99,
        stockQuantity: 100,
        attributes: { tier: "enterprise", cpu: "16 vCPU", ram: "64GB" },
        isDefault: false,
        sortOrder: 2,
      },
    }),
  ]);

  // Create addons
  await Promise.all([
    prisma.productAddon.create({
      data: {
        productId: product1.id,
        name: "Additional IPv4 Address",
        description: "Get an additional dedicated IPv4 address",
        price: 5,
        pricingType: "RECURRING_MONTHLY",
        sortOrder: 0,
      },
    }),
    prisma.productAddon.create({
      data: {
        productId: product1.id,
        name: "Managed Backups",
        description: "Daily automated backups with 30-day retention",
        price: 15,
        pricingType: "RECURRING_MONTHLY",
        sortOrder: 1,
      },
    }),
  ]);

  // Create configs
  await Promise.all([
    prisma.productConfig.create({
      data: {
        productId: product1.id,
        name: "Operating System",
        type: "SELECT",
        options: [
          { value: "ubuntu-22", label: "Ubuntu 22.04 LTS", priceModifier: 0 },
          { value: "debian-12", label: "Debian 12", priceModifier: 0 },
          { value: "windows-2022", label: "Windows Server 2022", priceModifier: 25 },
        ],
        isRequired: true,
        defaultValue: "ubuntu-22",
        sortOrder: 0,
      },
    }),
    prisma.productConfig.create({
      data: {
        productId: product1.id,
        name: "Data Center Region",
        type: "SELECT",
        options: [
          { value: "us-east", label: "US East (N. Virginia)", priceModifier: 0 },
          { value: "us-west", label: "US West (Oregon)", priceModifier: 0 },
          { value: "eu-west", label: "EU West (Ireland)", priceModifier: 5 },
        ],
        isRequired: true,
        defaultValue: "us-east",
        sortOrder: 1,
      },
    }),
  ]);

  // Create more products
  const networkCategory = categories.find((c) => c.slug === "network-solutions");
  await prisma.product.upsert({
    where: { slug: "load-balancer-enterprise" },
    update: {},
    create: {
      name: "Load Balancer Enterprise",
      slug: "load-balancer-enterprise",
      shortDescription: "Distribute traffic efficiently across your infrastructure",
      description: "High-availability load balancing with automatic failover.",
      features: ["SSL Termination", "Health Checks", "Sticky Sessions", "Auto-scaling"],
      specifications: { Throughput: "10 Gbps", Connections: "100K concurrent" },
      sku: "LB-ENT-001",
      basePrice: 79.99,
      productType: "WITH_ADDONS",
      status: "ACTIVE",
      categoryId: networkCategory?.id,
      isFeatured: true,
      isDigital: true,
      stockQuantity: 100,
    },
  });

  // Create a bundle
  const bundle = await prisma.bundle.upsert({
    where: { slug: "startup-bundle" },
    update: {},
    create: {
      name: "Startup Bundle",
      slug: "startup-bundle",
      description: "Everything you need to launch your startup",
      shortDescription: "Perfect for startups and small teams",
      price: 199.99,
      compareAtPrice: 349.99,
      discountType: "FIXED",
      discountValue: 150,
      status: "ACTIVE",
      isFeatured: true,
    },
  });

  const products = await prisma.product.findMany({ take: 3 });
  for (const product of products) {
    await prisma.bundleItem.upsert({
      where: {
        bundleId_productId: {
          bundleId: bundle.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        bundleId: bundle.id,
        productId: product.id,
        quantity: 1,
        isRequired: true,
        isDefault: true,
      },
    });
  }

  // Create company info
  await prisma.companyInfo.upsert({
    where: { id: "company-info" },
    update: {
      name: "Shaurrya Teleservices",
      legalName: "Shaurrya Teleservices Pvt. Ltd.",
      email: "contact@shaurryatele.com",
      phone: "+91 (999) 123-4567",
      address: "Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
      supportEmail: "support@shaurryatele.com",
      supportPhone: "+91 (999) 987-6543",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      socialLinks: {
        facebook: "https://facebook.com/shaurryatele",
        twitter: "https://twitter.com/shaurryatele",
        linkedin: "https://linkedin.com/company/shaurryatele",
        instagram: "https://instagram.com/shaurryatele",
      },
    },
    create: {
      id: "company-info",
      name: "Shaurrya Teleservices",
      legalName: "Shaurrya Teleservices Pvt. Ltd.",
      email: "contact@shaurryatele.com",
      phone: "+91 (999) 123-4567",
      address: "Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
      supportEmail: "support@shaurryatele.com",
      supportPhone: "+91 (999) 987-6543",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      socialLinks: {
        facebook: "https://facebook.com/shaurryatele",
        twitter: "https://twitter.com/shaurryatele",
        linkedin: "https://linkedin.com/company/shaurryatele",
        instagram: "https://instagram.com/shaurryatele",
      },
    },
  });

  // Create homepage
  const homepage = await prisma.page.upsert({
    where: { slug: "home" },
    update: {
      description: "Shaurrya Teleservices Marketplace",
    },
    create: {
      title: "Home",
      slug: "home",
      description: "Shaurrya Teleservices Marketplace",
      status: "PUBLISHED",
      isHomepage: true,
      publishedAt: new Date(),
    },
  });

  // Create page sections
  await prisma.pageSection.createMany({
    data: [
      {
        pageId: homepage.id,
        type: "hero",
        title: "Welcome to Shaurrya Teleservices",
        content: {
          heading: "Enterprise Teleservices Marketplace",
          subheading: "Scale your infrastructure with enterprise-grade connectivity and cloud services",
          ctaText: "Browse Products",
          ctaLink: "/products",
        },
        sortOrder: 0,
      },
      {
        pageId: homepage.id,
        type: "featured-products",
        title: "Featured Products",
        content: {
          heading: "Popular Services",
          count: 4,
        },
        sortOrder: 1,
      },
      {
        pageId: homepage.id,
        type: "categories",
        title: "Categories",
        content: {
          heading: "Browse by Category",
        },
        sortOrder: 2,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
