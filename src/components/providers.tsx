"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { getQueryClient } from "@/lib/query-client";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SiteSettingsProvider>
          <ToastProvider>
            {children}
            <ToastViewport />
          </ToastProvider>
        </SiteSettingsProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
