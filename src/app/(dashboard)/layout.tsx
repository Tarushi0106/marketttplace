import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="block px-4 py-2 rounded-md hover:bg-surface transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/orders"
                className="block px-4 py-2 rounded-md hover:bg-surface transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/dashboard/profile"
                className="block px-4 py-2 rounded-md hover:bg-surface transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/addresses"
                className="block px-4 py-2 rounded-md hover:bg-surface transition-colors"
              >
                Addresses
              </Link>
              <Link
                href="/dashboard/wishlist"
                className="block px-4 py-2 rounded-md hover:bg-surface transition-colors"
              >
                Wishlist
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
