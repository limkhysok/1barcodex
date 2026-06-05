"use client";

import { Database, Package, AlertCircle } from "lucide-react";

interface StatsOverviewProps {
  stats: {
    total: number;
    totalQty: number;
    needsReorder: number;
  };
}

function fmt(n: number) {
  return n.toLocaleString();
}

export function StatsOverview({ stats }: Readonly<StatsOverviewProps>) {
  const { total, totalQty, needsReorder } = stats;

  return (
    <div className="w-full">

      {/* ── MOBILE (< sm) ── */}
      <div className="sm:hidden grid grid-cols-3 gap-1.5">
        <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Products</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(total)}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-2.5">
            <Database size={18} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Total Qty</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(totalQty)}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-2.5">
            <Package size={18} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Low Stock</p>
            <p className={`text-base font-medium leading-none tabular-nums tracking-tighter mt-0.5 ${needsReorder > 0 ? "text-orange-600" : "text-slate-900"}`}>{fmt(needsReorder)}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-2.5">
            <AlertCircle size={18} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:grid lg:hidden grid-cols-3 gap-2">
        <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-4 py-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Total Products</p>
            <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(total)}</p>
          </div>
          <div className="w-16 shrink-0 bg-white flex items-center justify-center ml-auto">
            <Database size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-4 py-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Total Quantity</p>
            <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(totalQty)}</p>
          </div>
          <div className="w-16 shrink-0 bg-white flex items-center justify-center ml-auto">
            <Package size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-4 py-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Low Stock</p>
            <p className={`text-xl font-medium leading-none tabular-nums tracking-tighter mt-1 ${needsReorder > 0 ? "text-orange-600" : "text-slate-900"}`}>{fmt(needsReorder)}</p>
          </div>
          <div className="w-16 shrink-0 bg-white flex items-center justify-center ml-auto">
            <AlertCircle size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:grid grid-cols-3 gap-3">
        <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="text-base font-regular text-slate-900">Total Products</p>
            <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(total)}</p>
          </div>
          <div className="w-20 shrink-0 bg-white flex items-center justify-center ml-auto">
            <Database size={30} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="text-base font-regular text-slate-900">Total Quantity</p>
            <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(totalQty)}</p>
          </div>
          <div className="w-20 shrink-0 bg-white flex items-center justify-center ml-auto">
            <Package size={30} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="text-base font-regular text-slate-900">Low Stock</p>
            <p className={`text-2xl font-medium leading-none tabular-nums tracking-tighter mt-1 ${needsReorder > 0 ? "text-orange-600" : "text-slate-900"}`}>{fmt(needsReorder)}</p>
          </div>
          <div className="w-20 shrink-0 bg-white flex items-center justify-center ml-auto">
            <AlertCircle size={30} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>
      </div>

    </div>
  );
}
