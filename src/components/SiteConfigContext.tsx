"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SITE_CONFIG, type SiteConfig } from "@/lib/site-config-defaults";

const SiteConfigContext = createContext<SiteConfig>(DEFAULT_SITE_CONFIG);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: ReactNode;
}) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
