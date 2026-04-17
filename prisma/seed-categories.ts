import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: "Software as a Service",
    slug: "software-as-a-service",
    description: "Cloud-based software solutions for business operations",
    icon: "cloud",
    iconBgColor: "#DBEAFE",
    isTrending: true,
    subCategories: [
      { name: "Business Applications", slug: "business-applications", description: "ERP, accounting, CRM, HRMS" },
      { name: "Productivity Tools", slug: "productivity-tools", description: "Office and productivity software" },
      { name: "Collaboration Tools", slug: "collaboration-tools", description: "Team collaboration platforms" },
    ]
  },
  {
    name: "Connectivity",
    slug: "connectivity",
    description: "Network connectivity and communication solutions",
    icon: "wifi",
    iconBgColor: "#D1FAE5",
    isTrending: true,
    subCategories: [
      { name: "SDWAN", slug: "sdwan", description: "Software-defined wide area networking" },
      { name: "Internet Services", slug: "internet-services", description: "Business internet and broadband" },
      { name: "VPN Solutions", slug: "vpn-solutions", description: "Virtual private network services" },
    ]
  },
  {
    name: "Security",
    slug: "security",
    description: "Cybersecurity and protection solutions",
    icon: "shield",
    iconBgColor: "#FFE4E4",
    isTrending: true,
    subCategories: [
      { name: "Endpoint Protection", slug: "endpoint-protection", description: "Device and endpoint security" },
      { name: "Backup & Recovery", slug: "backup-recovery", description: "Data backup and disaster recovery" },
      { name: "Cyber Insurance", slug: "cyber-insurance", description: "Cybersecurity insurance" },
    ]
  },
  {
    name: "Managed Infrastructure Services",
    slug: "managed-infrastructure",
    description: "Managed IT infrastructure and support services",
    icon: "server",
    iconBgColor: "#F5F5F5",
    isTrending: true,
    subCategories: [
      { name: "Cloud Hosting", slug: "cloud-hosting", description: "Managed cloud hosting" },
      { name: "Server Management", slug: "server-management", description: "Server maintenance and monitoring" },
      { name: "IT Support", slug: "it-support", description: "Technical support services" },
    ]
  },
  {
    name: "Mobility & IOT",
    slug: "mobility-iot",
    description: "Mobile solutions and Internet of Things",
    icon: "smartphone",
    iconBgColor: "#E9D5FF",
    isTrending: false,
    subCategories: [
      { name: "Mobile Device Management", slug: "mobile-device-management", description: "MDM solutions" },
      { name: "IoT Solutions", slug: "iot-solutions", description: "Internet of Things platforms" },
      { name: "Connected Devices", slug: "connected-devices", description: "Smart device management" },
    ]
  },
  {
    name: "AI",
    slug: "ai",
    description: "Artificial intelligence and machine learning solutions",
    icon: "brain",
    iconBgColor: "#FEF3C7",
    isTrending: true,
    subCategories: [
      { name: "AI Tools", slug: "ai-tools", description: "Artificial intelligence applications" },
      { name: "Machine Learning", slug: "machine-learning", description: "ML platforms and services" },
      { name: "Analytics", slug: "analytics", description: "AI-powered analytics" },
    ]
  },
  {
    name: "Hardware & Logistics",
    slug: "hardware-logistics",
    description: "Hardware procurement and logistics services",
    icon: "package",
    iconBgColor: "#D4A574",
    isTrending: false,
    subCategories: [
      { name: "CCTV Cameras", slug: "cctv-cameras", description: "Video surveillance equipment" },
      { name: "Hardware Procurement", slug: "hardware-procurement", description: "IT hardware purchasing" },
      { name: "Logistics Services", slug: "logistics-services", description: "Hardware delivery and setup" },
    ]
  },
];

async function main() {
  console.log('Deleting existing categories and subcategories...');
  
  // Delete all existing subcategories first (due to foreign key)
  await prisma.subCategory.deleteMany({});
  
  // Delete all existing categories
  await prisma.category.deleteMany({});
  
  console.log('Creating new categories...');
  
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    console.log(`Creating: ${cat.name}`);
    
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        iconBgColor: cat.iconBgColor,
        isActive: true,
        isTrending: cat.isTrending ?? false,
        sortOrder: i,
      }
    });
    
    // Create subcategories
    for (let j = 0; j < cat.subCategories.length; j++) {
      const sub = cat.subCategories[j];
      await prisma.subCategory.create({
        data: {
          categoryId: category.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          isActive: true,
          sortOrder: j,
        }
      });
    }
  }
  
  console.log('Done! Categories created successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
