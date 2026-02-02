import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: "Cloud & Infrastructure",
    slug: "cloud-infrastructure",
    description: "Cloud servers and hosting, domains, virtual machines",
    icon: "cloud",
    iconBgColor: "#DBEAFE",
    subCategories: [
      { name: "Cloud Servers & Hosting", slug: "cloud-servers-hosting", description: "Managed cloud hosting solutions" },
      { name: "Domains", slug: "domains", description: "Domain registration and management" },
      { name: "Virtual Machines", slug: "virtual-machines", description: "Scalable virtual machine instances" },
    ]
  },
  {
    name: "Business Applications",
    slug: "business-applications",
    description: "ERP, accounting, CRM, HRMS, finance & core business software",
    icon: "briefcase",
    iconBgColor: "#FEF3C7",
    subCategories: [
      { name: "Tally on Cloud", slug: "tally-on-cloud", description: "Cloud-based Tally accounting solutions" },
      { name: "ERP & Accounting", slug: "erp-accounting", description: "Enterprise resource planning software" },
      { name: "CRM", slug: "crm", description: "Customer relationship management" },
      { name: "HRMS", slug: "hrms", description: "Human resource management systems" },
      { name: "Finance Software", slug: "finance-software", description: "Core business finance tools" },
    ]
  },
  {
    name: "Connectivity",
    slug: "connectivity",
    description: "SDWAN and network connectivity solutions",
    icon: "wifi",
    iconBgColor: "#D1FAE5",
    subCategories: [
      { name: "SDWAN", slug: "sdwan", description: "Software-defined wide area networking" },
    ]
  },
  {
    name: "Workplace & Collaboration",
    slug: "workplace-collaboration",
    description: "Microsoft 365, email, cloud telephony, meetings, unified communications",
    icon: "users",
    iconBgColor: "#E9D5FF",
    subCategories: [
      { name: "Microsoft 365", slug: "microsoft-365", description: "Microsoft productivity suite" },
      { name: "Email Solutions", slug: "email-solutions", description: "Business email services" },
      { name: "Cloud Telephony (ATA Cloud)", slug: "cloud-telephony", description: "Cloud-based phone systems" },
      { name: "Meetings & Video", slug: "meetings-video", description: "Video conferencing solutions" },
      { name: "Unified Communications", slug: "unified-communications", description: "Integrated communication platforms" },
    ]
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Acronis Cyber Security and protection solutions",
    icon: "shield",
    iconBgColor: "#FFE4E4",
    subCategories: [
      { name: "Acronis Cyber Security", slug: "acronis-cyber-security", description: "Comprehensive cyber protection" },
      { name: "Endpoint Protection", slug: "endpoint-protection", description: "Device security solutions" },
      { name: "Backup & Recovery", slug: "backup-recovery", description: "Data backup and disaster recovery" },
    ]
  },
  {
    name: "Data, AI & Intelligence",
    slug: "data-ai-intelligence",
    description: "Analytics platforms, AI tools, reporting, data platforms",
    icon: "brain",
    iconBgColor: "#DBEAFE",
    subCategories: [
      { name: "Analytics Platforms", slug: "analytics-platforms", description: "Business intelligence and analytics" },
      { name: "AI Tools", slug: "ai-tools", description: "Artificial intelligence solutions" },
      { name: "Reporting", slug: "reporting", description: "Data reporting and visualization" },
      { name: "Data Platforms (Fueady)", slug: "data-platforms", description: "Enterprise data management" },
    ]
  },
  {
    name: "Industry Solutions",
    slug: "industry-solutions",
    description: "Drone as a Service, industry-specific monitoring, smart infrastructure",
    icon: "settings",
    iconBgColor: "#F5F5F5",
    subCategories: [
      { name: "Drone as a Service", slug: "drone-as-a-service", description: "Commercial drone solutions" },
      { name: "Industry Monitoring", slug: "industry-monitoring", description: "Industry-specific monitoring tools" },
      { name: "Smart Infrastructure", slug: "smart-infrastructure", description: "IoT and smart solutions" },
    ]
  },
  {
    name: "Pricing Calculators",
    slug: "pricing-calculators",
    description: "Get pricing and cost calculators for services",
    icon: "calculator",
    iconBgColor: "#D1FAE5",
    subCategories: []
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
        isTrending: i < 6, // First 6 are trending
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
