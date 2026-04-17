"use client";

import { useEffect } from "react";

export function ProductPageTracker({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "lastProductPage",
        JSON.stringify({ href: `/products/${slug}`, label: name })
      );
    } catch {}
  }, [slug, name]);

  return null;
}
