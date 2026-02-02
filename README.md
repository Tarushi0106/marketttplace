# NetNxt - Enterprise NaaS Marketplace

A modern, full-featured Network-as-a-Service (NaaS) marketplace platform built by **Shaurrya Teleservices Private Limited**. NetNxt enables businesses to discover, configure, and purchase networking solutions including cloud services, security products, connectivity solutions, and enterprise bundles.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Icon library
- **Zustand** - Lightweight state management
- **TanStack React Query** - Server state management

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database toolkit and ORM
- **PostgreSQL** - Relational database
- **NextAuth.js v5** - Authentication solution
- **Zod** - Schema validation

### Integrations
- **Stripe** - International payment processing
- **Razorpay** - Indian payment gateway
- **Cloudinary** - Media storage and optimization
- **Meilisearch** - Full-text search engine

### Security
- **bcryptjs** - Password hashing
- **NextAuth.js** - Session management and OAuth

## Features

### Storefront
- Product catalog with categories and subcategories
- Advanced product filtering and search
- Product variants and configurations
- Bundle deals with customizable options
- Shopping cart with persistent state
- Secure checkout with multiple payment options
- Customer reviews and ratings
- Wishlist functionality

### Admin Dashboard
- Comprehensive product management
- Category and subcategory organization
- Order management and tracking
- Customer management
- Discount and coupon system
- Media library with Cloudinary integration
- CMS for pages and content
- Testimonials management
- Company logos (trusted by) management
- SEO metadata configuration
- Navigation menu builder
- Site settings and configurations
- Analytics dashboard

### Technical Features
- Server-side rendering (SSR) and static generation
- Responsive design for all devices
- SEO optimized with dynamic sitemaps
- Role-based access control (Customer, Admin, Super Admin)
- Comprehensive API with RESTful endpoints

## Project Structure

```
marketplace/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── public/                # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Customer dashboard
│   │   ├── (storefront)/  # Public storefront pages
│   │   ├── admin/         # Admin dashboard
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── admin/         # Admin components
│   │   ├── shared/        # Shared components
│   │   ├── storefront/    # Storefront components
│   │   └── ui/            # Radix UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── cloudinary.ts  # Cloudinary client
│   │   ├── meilisearch.ts # Meilisearch client
│   │   ├── prisma.ts      # Prisma client
│   │   └── razorpay.ts    # Razorpay client
│   ├── store/             # Zustand stores
│   └── types/             # TypeScript type definitions
├── .env.example           # Environment variables template
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Dependencies
```

## Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** 14.x or higher
- **Meilisearch** (optional, for search functionality)

### Step 1: Clone the Repository

```bash
git clone https://github.com/shaurryatele/marketplace.git
cd marketplace
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/netnxt_marketplace"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (for international payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Razorpay (for Indian payments)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

# Cloudinary (for media storage)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Meilisearch (optional)
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="NetNxt"
```

### Step 4: Setup Database

Generate Prisma client and push schema to database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push

# Import initial data from backup (recommended)
npm run db:import

# OR seed database with basic sample data
npm run db:seed
```

### Step 5: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:export` | Export database to JSON backup |
| `npm run db:import` | Import database from JSON backup |

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product (Admin)
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (Admin)
- `GET /api/categories/[id]` - Get category details
- `PUT /api/categories/[id]` - Update category (Admin)
- `DELETE /api/categories/[id]` - Delete category (Admin)
- `GET /api/categories/trending` - Get trending categories

### Bundles
- `GET /api/bundles` - List all bundles
- `POST /api/bundles` - Create bundle (Admin)
- `GET /api/bundles/[id]` - Get bundle details
- `PUT /api/bundles/[id]` - Update bundle (Admin)
- `DELETE /api/bundles/[id]` - Delete bundle (Admin)

### Orders
- `GET /api/orders` - List orders
- `POST /api/checkout` - Create checkout session

### Discounts
- `GET /api/discounts` - List discounts (Admin)
- `POST /api/discounts` - Create discount (Admin)

### Media
- `POST /api/upload` - Upload media to Cloudinary
- `GET /api/media` - List media files
- `DELETE /api/media/[id]` - Delete media file

### CMS
- `GET /api/pages` - List pages
- `POST /api/pages` - Create page (Admin)
- `GET /api/menus` - Get navigation menus
- `GET /api/testimonials` - Get testimonials
- `GET /api/company-logos` - Get company logos
- `GET /api/settings/site` - Get site settings

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Database Backup & Restore

The project includes scripts for backing up and restoring database data:

```bash
# Export current database to JSON
npm run db:export

# Import data from backup
npm run db:import
```

The backup file is stored at `prisma/database-backup.json` and includes all categories, products, settings, testimonials, and other content data (excluding sensitive user passwords).

**Default Admin Credentials:**
- Email: `admin@shaurryatele.com`
- Password: `admin@123`

## Database Schema

The application uses a comprehensive PostgreSQL schema including:

- **Users & Authentication** - User accounts, sessions, OAuth
- **Products & Variants** - Configurable products with variants and addons
- **Categories** - Hierarchical category structure
- **Bundles** - Product bundle deals
- **Orders** - Order management with multiple statuses
- **CMS** - Pages, sections, and navigation menus
- **SEO** - Metadata for all content types
- **Media** - Cloudinary-backed media library

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by Shaurrya Teleservices Private Limited. All rights reserved.

## Support

For support and inquiries, please contact:

**Shaurrya Teleservices Private Limited**
- Website: [https://shaurryatele.com](https://shaurryatele.com)
- Email: support@shaurryatele.com

---

Built with passion by **Shaurrya Teleservices Private Limited**
