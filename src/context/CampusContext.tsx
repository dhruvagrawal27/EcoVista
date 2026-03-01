import React, { createContext, useContext, ReactNode } from "react";
import { useCampus } from "@/hooks/useCampus";
import type { Campus } from "@/lib/types";

interface CampusContextValue {
  campus: Campus | undefined;
  campusId: number;
  isLoading: boolean;
}

const CampusContext = createContext<CampusContextValue>({
  campus: undefined,
  campusId: 0,
  isLoading: true,
});

export function CampusProvider({ children }: { children: ReactNode }) {
  const { data: campus, isLoading } = useCampus();

  return (
    <CampusContext.Provider
      value={{
        campus,
        campusId: campus?.id ?? 0,
        isLoading,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampusContext(): CampusContextValue {
  return useContext(CampusContext);
}
