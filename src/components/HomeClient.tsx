"use client";

import { useState } from "react";
import BackgroundAtmosphere from "@/components/BackgroundAtmosphere";
import Particles from "@/components/Particles";
import HomeExperience, { type Phase } from "@/components/HomeExperience";
import { SiteConfigProvider } from "@/components/SiteConfigContext";
import type { SiteConfig } from "@/lib/site-config-defaults";

export default function HomeClient({ config }: { config: SiteConfig }) {
  const [phase, setPhase] = useState<Phase>("home");
  const dimmed = phase === "sentence1" || phase === "sentence2";

  return (
    <SiteConfigProvider config={config}>
      <div className="relative flex flex-1 flex-col">
        <BackgroundAtmosphere />
        <Particles dimmed={dimmed} />
        <HomeExperience phase={phase} setPhase={setPhase} />
      </div>
    </SiteConfigProvider>
  );
}
