"use client";
import { SWRConfig } from "swr";

export function SWRProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 30_000,
        revalidateIfStale: true,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
