"use client";

import { useEffect } from "react";
import { Header } from "@/components/storefront/Header";
import { SolutionsNavbar } from "@/components/storefront/SolutionsNavbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { SearchModal } from "@/components/storefront/SearchModal";
import { useCartStore } from "@/store/cart-store";
import Script from "next/script";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // On bfcache restore (browser back/forward), check localStorage for isCheckedOut.
  // sidebarItems is not persisted, so bfcache can restore stale sidebar state.
  // If checkout happened, explicitly clear the sidebar in the live Zustand store.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        try {
          const stored = JSON.parse(localStorage.getItem("naas-cart") || "{}");
          if (stored?.state?.isCheckedOut) {
            useCartStore.setState({ sidebarItems: [], isCheckedOut: true, isOpen: false });
          }
        } catch {}
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SolutionsNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
