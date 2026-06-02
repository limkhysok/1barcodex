  "use client";

  import React, { useMemo } from "react";
  import type { ProductStats } from "@/src/types/api.types";
  import type { Product } from "@/src/types/product.types";
  import { Package, Zap, Box } from "lucide-react";

  interface StatsOverviewProps {
    stats: ProductStats | null;
    products: Product[];
  }

  function fmt(n: number) {
    return n.toLocaleString();
  }

  export function StatsOverview({ stats, products }: Readonly<StatsOverviewProps>) {
    const s = useMemo(() => {
      const accCount = stats?.by_category?.Accessories?.count ?? products.filter(p => p.category === "Accessories").length;
      const fasCount = stats?.by_category?.Fasteners?.count ?? products.filter(p => p.category === "Fasteners").length;
      const total = stats?.total_products ?? (accCount + fasCount);
      const accShare = total > 0 ? Math.round((accCount / total) * 100) : 0;
      const fasShare = total > 0 ? 100 - accShare : 0;
      return { accCount, fasCount, total, accShare, fasShare };
    }, [stats, products]);

    return (
      <div className="w-full">

        {/* ── MOBILE (< sm) ── */}
        <div className="sm:hidden bg-white border border-slate-500 rounded-sm overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center gap-0.5 py-3">
              <Package size={14} className="text-orange-500" strokeWidth={2} />
              <p className="text-[18px] font-black text-slate-900 leading-none tabular-nums">{fmt(s.accCount)}</p>
              <p className="text-sm font-regular text-black-700 group-hover/hdr:text-orange-500 transition-colors duration-200">Accessories</p>
            </div>
            <div className="flex flex-col items-center gap-0.5 py-3">
              <Box size={14} className="text-orange-500" strokeWidth={2} />
              <p className="text-[18px] font-black text-slate-900 leading-none tabular-nums">{fmt(s.fasCount)}</p>
              <p className="text-sm font-regular text-black-700 group-hover/hdr:text-orange-500 transition-colors duration-200">Fasteners</p>
            </div>
            <div className="flex flex-col items-center gap-0.5 py-3">
              <Zap size={14} className="text-orange-500" strokeWidth={2} />
              <p className="text-[18px] font-black text-slate-900 leading-none tabular-nums">{fmt(s.total)}</p>
              <p className="text-sm font-regular text-black-700 group-hover/hdr:text-orange-500 transition-colors duration-200">Total</p>
            </div>
          </div>
          <div className="px-3 pb-3 flex flex-col gap-1">
            <div className="flex h-1.5 rounded-full overflow-hidden bg-orange-100">
              <div className="bg-orange-500 transition-all duration-700" style={{ width: `${s.accShare}%` }} />
              <div className="bg-orange-200 transition-all duration-700" style={{ width: `${s.fasShare}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">ACC {s.accShare}%</span>
              <span className="text-[8px] font-black text-orange-300 uppercase tracking-widest">FAS {s.fasShare}%</span>
            </div>
          </div>
        </div>

        {/* ── TABLET (sm → lg) ── */}
        <div className="hidden sm:grid lg:hidden grid-cols-3 gap-2">
          <div className="bg-white border border-slate-500 rounded-sm p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-orange-50 flex items-center justify-center">
                  <Package size={14} className="text-orange-500" strokeWidth={2} />
                </div>
                <p className="text-base font-regular text-black-700 group-hover/hdr:text-orange-500 transition-colors duration-200">Accessories</p>
              </div>
              <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">{s.accShare}%</span>
            </div>
            <p className="text-[26px] font-black text-slate-900 leading-none tabular-nums tracking-tighter">{fmt(s.accCount)}</p>
            <div className="h-1 rounded-full bg-orange-100 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${s.accShare}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-500 rounded-sm p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-orange-50 flex items-center justify-center">
                  <Box size={14} className="text-orange-500" strokeWidth={2} />
                </div>
                <p className="text-base font-regular text-black-700 group-hover/hdr:text-orange-500 transition-colors duration-200">Fasteners</p>
              </div>
              <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">{s.fasShare}%</span>
            </div>
            <p className="text-[26px] font-black text-slate-900 leading-none tabular-nums tracking-tighter">{fmt(s.fasCount)}</p>
            <div className="h-1 rounded-full bg-orange-100 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${s.fasShare}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-500 rounded-sm p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-orange-50 flex items-center justify-center">
                  <Zap size={14} className="text-orange-500" strokeWidth={2} />
                </div>
                <p className="text-base font-regular text-black-700 group-hover/hdr:text-orange-500 transition-colors duration-200">Total</p>
              </div>
            </div>
            <p className="text-[26px] font-black text-slate-900 leading-none tabular-nums tracking-tighter">{fmt(s.total)}</p>
            <div className="h-1 rounded-full bg-orange-100 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* ── DESKTOP (≥ lg) ── */}
        <div className="hidden lg:grid grid-cols-3 gap-3">
          <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
            <div className="w-20 shrink-0 bg-orange-500 flex items-center justify-center border-r border-orange-600 group-hover:bg-orange-600 transition-colors duration-200">
              <Package size={30} className="text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center px-5 py-4">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">Accessories</p>
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(s.accCount)}</p>
            </div>
          </div>

          <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
            <div className="w-20 shrink-0 bg-orange-500 flex items-center justify-center border-r border-orange-600 group-hover:bg-orange-600 transition-colors duration-200">
              <Box size={30} className="text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center px-5 py-4">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">Fasteners</p>
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(s.fasCount)}</p>
            </div>
          </div>

          <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
            <div className="w-20 shrink-0 bg-orange-500 flex items-center justify-center border-r border-orange-600 group-hover:bg-orange-600 transition-colors duration-200">
              <Zap size={30} className="text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center px-5 py-4">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-medium text-black-700 leading-none tabular-nums tracking-tighter mt-1">{fmt(s.total)}</p>
            </div>
          </div>
        </div>

      </div>
    );
  }
