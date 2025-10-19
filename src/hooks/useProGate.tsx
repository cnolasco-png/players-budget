import type { ReactNode } from "react";
import usePro from "@/hooks/usePro";
import UpgradeLink from "@/components/UpgradeLink";

export function useProGate() {
  const { isPro, loading } = usePro();

  const requirePro = (
    label: ReactNode,
    interval: "monthly" | "yearly" = "monthly",
    source: string,
    className?: string,
  ) => <UpgradeLink interval={interval} source={source} className={className}>{label}</UpgradeLink>;

  return {
    isPro,
    loading,
    requirePro,
  };
}

export default useProGate;
