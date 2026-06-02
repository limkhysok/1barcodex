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
        <div className="sm:hidden grid grid-cols-3 gap-1.5">
          <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
            <div className="bg-orange-500 flex items-center justify-center py-2.5 border-b border-orange-600">
              <Package size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center justify-center px-1 py-2">
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Accessories</p>
              <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(s.accCount)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
            <div className="bg-orange-500 flex items-center justify-center py-2.5 border-b border-orange-600">
              <Box size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center justify-center px-1 py-2">
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Fasteners</p>
              <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(s.fasCount)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
            <div className="bg-orange-500 flex items-center justify-center py-2.5 border-b border-orange-600">
              <Zap size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center justify-center px-1 py-2">
              <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Total</p>
              <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(s.total)}</p>
            </div>
          </div>
        </div>

        {/* ── TABLET (sm → lg) ── */}
        <div className="hidden sm:grid lg:hidden grid-cols-3 gap-2">
          <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
            <div className="w-16 shrink-0 bg-orange-500 flex items-center justify-center border-r border-orange-600 group-hover:bg-orange-600 transition-colors duration-200">
              <Package size={22} className="text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center px-4 py-3">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Accessories</p>
              <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(s.accCount)}</p>
            </div>
          </div>

          <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
            <div className="w-16 shrink-0 bg-orange-500 flex items-center justify-center border-r border-orange-600 group-hover:bg-orange-600 transition-colors duration-200">
              <Box size={22} className="text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center px-4 py-3">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Fasteners</p>
              <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(s.fasCount)}</p>
            </div>
          </div>

          <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
            <div className="w-16 shrink-0 bg-orange-500 flex items-center justify-center border-r border-orange-600 group-hover:bg-orange-600 transition-colors duration-200">
              <Zap size={22} className="text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center px-4 py-3">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Total</p>
              <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(s.total)}</p>
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
