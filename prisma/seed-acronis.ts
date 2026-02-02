import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Acronis Cyber Protect product...');

  // Find Cybersecurity category and Acronis subcategory
  const category = await prisma.category.findFirst({
    where: { slug: 'cybersecurity' }
  });

  const subCategory = await prisma.subCategory.findFirst({
    where: { slug: 'acronis-cyber-security' }
  });

  if (!category || !subCategory) {
    throw new Error('Category or subcategory not found');
  }

  // Create the product
  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      subCategoryId: subCategory.id,
      name: "Acronis Cyber Protect Cloud",
      slug: "acronis-cyber-protect-cloud",
      brandLogo: "https://www.acronis.com/media/images/content/acronis-logo-large-dark.png",
      shortDescription: "All-in-one cyber protection solution integrating backup, disaster recovery, AI-based malware protection, and remote management.",
      description: `
<h2>Complete Cyber Protection for Modern Businesses</h2>
<p>Acronis Cyber Protect Cloud is the only solution that natively integrates cybersecurity, data protection, and endpoint protection management to safeguard endpoints, systems, and data. This integration eliminates complexity so service providers can protect customers better while keeping costs down.</p>

<h3>Why Choose Acronis Cyber Protect Cloud?</h3>
<p>Traditional security solutions are no longer enough. Today's threats require a new approach that combines backup, disaster recovery, next-generation anti-malware, and endpoint management into one integrated solution.</p>

<h3>Key Capabilities</h3>
<ul>
  <li><strong>Backup & Recovery:</strong> Reliable image-based backup for physical and virtual systems with flexible recovery options</li>
  <li><strong>Anti-Malware & Antivirus:</strong> AI and ML-based protection against malware, ransomware, and zero-day attacks</li>
  <li><strong>URL Filtering:</strong> Block malicious URLs and web-based threats before they reach endpoints</li>
  <li><strong>Vulnerability Assessments:</strong> Identify security gaps and prioritize patches</li>
  <li><strong>Patch Management:</strong> Automate patch deployment across Windows, macOS, and Linux</li>
  <li><strong>Remote Desktop:</strong> Secure remote access to managed endpoints</li>
  <li><strong>Hardware Inventory:</strong> Track and manage hardware assets across your organization</li>
</ul>

<h3>Advanced Protection Packs</h3>
<p>Extend your protection with specialized add-on packs:</p>
<ul>
  <li><strong>Advanced Security:</strong> Enhanced threat detection with EDR capabilities</li>
  <li><strong>Advanced Backup:</strong> Continuous data protection and SAP HANA support</li>
  <li><strong>Advanced Disaster Recovery:</strong> Orchestrated failover to Acronis Cloud</li>
  <li><strong>Advanced Email Security:</strong> Protection against email-borne threats</li>
  <li><strong>Advanced Data Loss Prevention:</strong> Prevent sensitive data leakage</li>
</ul>
      `.trim(),
      features: [
        "AI-powered anti-malware with behavioral detection",
        "Integrated backup and disaster recovery",
        "Automated patch management for 300+ applications",
        "URL filtering with real-time threat intelligence",
        "Vulnerability assessments and remediation",
        "Centralized management console",
        "Remote desktop and assistance",
        "Hardware and software inventory",
        "Continuous Data Protection (CDP)",
        "Microsoft 365 and Google Workspace backup",
        "Forensic backup capabilities",
        "Blockchain-based notarization",
        "Active Protection against ransomware",
        "Safe recovery with anti-malware scanning",
        "Fail-safe patching with automatic backup"
      ],
      specifications: {
        "Supported OS": "Windows 7/8/10/11, Windows Server 2008 R2-2022, macOS 10.13+, Linux (major distributions)",
        "Backup Destinations": "Local, Network, Acronis Cloud, Azure, AWS, Google Cloud",
        "Recovery Options": "Full system, File-level, Universal Restore, Instant Restore",
        "Anti-malware Engine": "AI/ML-based with signature and behavioral detection",
        "Management Console": "Web-based, multi-tenant architecture",
        "API": "REST API for integration and automation",
        "Compliance": "GDPR, HIPAA, SOC 2 Type II compliant",
        "Data Centers": "50+ worldwide with geo-redundancy"
      },
      basePrice: 0,
      productType: "CONFIGURABLE",
      status: "ACTIVE",
      isFeatured: true,
      isDigital: true,
      requiresShipping: false,
      trackInventory: false,
      stockQuantity: 9999,
    }
  });

  console.log('Product created:', product.id);

  // Add product images
  await prisma.productImage.createMany({
    data: [
      {
        productId: product.id,
        url: "https://www.acronis.com/en-us/media/images/content/2023/cyber-protect-cloud-console.png",
        alt: "Acronis Cyber Protect Cloud Console",
        sortOrder: 0,
        isPrimary: true
      },
      {
        productId: product.id,
        url: "https://www.acronis.com/en-us/media/images/content/2023/cyber-protect-dashboard.png",
        alt: "Acronis Dashboard",
        sortOrder: 1,
        isPrimary: false
      }
    ]
  });

  // Add product variants (pricing tiers)
  await prisma.productVariant.createMany({
    data: [
      {
        productId: product.id,
        name: "Starter",
        sku: "ACRONIS-STARTER",
        price: 2999,
        attributes: {
          "Workstations": "Up to 10",
          "Servers": "1",
          "Cloud Storage": "50 GB",
          "Support": "Email"
        },
        isDefault: true,
        isActive: true,
        sortOrder: 0
      },
      {
        productId: product.id,
        name: "Business",
        sku: "ACRONIS-BUSINESS",
        price: 7999,
        attributes: {
          "Workstations": "Up to 50",
          "Servers": "5",
          "Cloud Storage": "250 GB",
          "Support": "Email + Phone"
        },
        isDefault: false,
        isActive: true,
        sortOrder: 1
      },
      {
        productId: product.id,
        name: "Enterprise",
        sku: "ACRONIS-ENTERPRISE",
        price: 19999,
        attributes: {
          "Workstations": "Unlimited",
          "Servers": "Unlimited",
          "Cloud Storage": "1 TB",
          "Support": "24/7 Priority"
        },
        isDefault: false,
        isActive: true,
        sortOrder: 2
      }
    ]
  });

  // Add product configurations
  await prisma.productConfig.createMany({
    data: [
      {
        productId: product.id,
        name: "Number of Workstations",
        type: "SELECT",
        options: [
          { value: "10", label: "Up to 10 Workstations", priceModifier: "0" },
          { value: "25", label: "Up to 25 Workstations", priceModifier: "2000" },
          { value: "50", label: "Up to 50 Workstations", priceModifier: "4000" },
          { value: "100", label: "Up to 100 Workstations", priceModifier: "7500" },
          { value: "unlimited", label: "Unlimited Workstations", priceModifier: "12000" }
        ],
        isRequired: true,
        defaultValue: "10",
        sortOrder: 0
      },
      {
        productId: product.id,
        name: "Number of Servers",
        type: "SELECT",
        options: [
          { value: "1", label: "1 Server", priceModifier: "0" },
          { value: "3", label: "Up to 3 Servers", priceModifier: "3000" },
          { value: "5", label: "Up to 5 Servers", priceModifier: "5000" },
          { value: "10", label: "Up to 10 Servers", priceModifier: "9000" },
          { value: "unlimited", label: "Unlimited Servers", priceModifier: "15000" }
        ],
        isRequired: true,
        defaultValue: "1",
        sortOrder: 1
      },
      {
        productId: product.id,
        name: "Cloud Storage",
        type: "SELECT",
        options: [
          { value: "50", label: "50 GB Cloud Storage", priceModifier: "0" },
          { value: "100", label: "100 GB Cloud Storage", priceModifier: "500" },
          { value: "250", label: "250 GB Cloud Storage", priceModifier: "1200" },
          { value: "500", label: "500 GB Cloud Storage", priceModifier: "2200" },
          { value: "1000", label: "1 TB Cloud Storage", priceModifier: "4000" },
          { value: "5000", label: "5 TB Cloud Storage", priceModifier: "15000" }
        ],
        isRequired: true,
        defaultValue: "50",
        sortOrder: 2
      },
      {
        productId: product.id,
        name: "Billing Cycle",
        type: "RADIO",
        options: [
          { value: "monthly", label: "Monthly Billing", priceModifier: "0" },
          { value: "annual", label: "Annual Billing (Save 20%)", priceModifier: "-20%" }
        ],
        isRequired: true,
        defaultValue: "monthly",
        sortOrder: 3
      }
    ]
  });

  // Add product add-ons
  await prisma.productAddon.createMany({
    data: [
      {
        productId: product.id,
        name: "Advanced Security Pack",
        description: "Enhanced threat detection with EDR, exploit prevention, and threat intelligence feeds",
        price: 1500,
        pricingType: "RECURRING_MONTHLY",
        isRequired: false,
        isActive: true,
        sortOrder: 0
      },
      {
        productId: product.id,
        name: "Advanced Backup Pack",
        description: "Continuous Data Protection, SAP HANA support, and enhanced backup features",
        price: 1200,
        pricingType: "RECURRING_MONTHLY",
        isRequired: false,
        isActive: true,
        sortOrder: 1
      },
      {
        productId: product.id,
        name: "Advanced Disaster Recovery",
        description: "Production and test failover to Acronis Cloud with orchestrated runbooks",
        price: 2500,
        pricingType: "RECURRING_MONTHLY",
        isRequired: false,
        isActive: true,
        sortOrder: 2
      },
      {
        productId: product.id,
        name: "Advanced Email Security",
        description: "Protection against spam, phishing, malware, and advanced email threats",
        price: 800,
        pricingType: "RECURRING_MONTHLY",
        isRequired: false,
        isActive: true,
        sortOrder: 3
      },
      {
        productId: product.id,
        name: "Advanced DLP",
        description: "Data Loss Prevention to protect sensitive data across endpoints and cloud",
        price: 1000,
        pricingType: "RECURRING_MONTHLY",
        isRequired: false,
        isActive: true,
        sortOrder: 4
      },
      {
        productId: product.id,
        name: "Professional Services - Implementation",
        description: "Expert deployment and configuration by certified Acronis engineers",
        price: 25000,
        pricingType: "ONE_TIME",
        isRequired: false,
        isActive: true,
        sortOrder: 5
      }
    ]
  });

  // Add SEO metadata
  await prisma.seoMetadata.create({
    data: {
      productId: product.id,
      metaTitle: "Acronis Cyber Protect Cloud | Complete Cyber Protection Solution",
      metaDescription: "Protect your business with Acronis Cyber Protect Cloud. All-in-one solution for backup, disaster recovery, anti-malware, and endpoint management. Start your free trial today.",
      metaKeywords: "acronis, cyber protect, backup, disaster recovery, anti-malware, ransomware protection, endpoint protection, cloud backup",
      ogTitle: "Acronis Cyber Protect Cloud - Enterprise Cyber Protection",
      ogDescription: "All-in-one cyber protection integrating backup, disaster recovery, AI-based anti-malware, and endpoint management.",
    }
  });

  console.log('Acronis Cyber Protect product created successfully!');
  console.log('View at: /products/acronis-cyber-protect-cloud');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
