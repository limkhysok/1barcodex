"use client";

import React from "react";
import type { TransactionStats } from "@/src/services/transaction.service";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

type StatsOverviewProps = {
  stats: TransactionStats | null;
};

function fmt(n: number) {
  return n.toLocaleString();
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const receiveCount = stats?.by_type?.Receive?.total_count || 0;
  const receiveToday = stats?.by_type?.Receive?.today_count || 0;

  const saleCount = stats?.by_type?.Sale?.total_count || 0;
  const saleToday = stats?.by_type?.Sale?.today_count || 0;

  const total = stats?.total_transactions || 0;
  const today = stats?.today_transactions || 0;

  return (
    <div className="w-full">

      {/* ── MOBILE (< sm) ── */}
      <div className="sm:hidden grid grid-cols-3 gap-1.5">
        <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Receive</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(receiveCount)}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-2.5">
            <TrendingDown size={18} className="text-orange-500 scale-x-[-1]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Sales</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(saleCount)}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-2.5">
            <TrendingUp size={18} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-white border border-gray-600 rounded-md overflow-hidden flex flex-col">
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Activity</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{fmt(total)}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-2.5">
            <Activity size={18} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:grid lg:hidden grid-cols-3 gap-2">
        <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-4 py-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Received</p>
            <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(receiveCount)}</p>
          </div>
          <div className="w-16 shrink-0 bg-white flex items-center justify-center ml-auto">
            <TrendingDown size={22} className="text-orange-500 scale-x-[-1]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-4 py-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Sales</p>
            <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(saleCount)}</p>
          </div>
          <div className="w-16 shrink-0 bg-white flex items-center justify-center ml-auto">
            <TrendingUp size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-md overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-4 py-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Activity</p>
            <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{fmt(total)}</p>
          </div>
          <div className="w-16 shrink-0 bg-white flex items-center justify-center ml-auto">
            <Activity size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:grid grid-cols-3 gap-3">
        <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="text-base font-regular text-slate-900">Lifetime Receive</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter">{fmt(receiveCount)}</p>
              <span className="text-[10px] font-medium text-slate-400">+{receiveToday} today</span>
            </div>
          </div>
          <div className="w-20 shrink-0 bg-white flex items-center justify-center ml-auto">
            <TrendingDown size={30} className="text-orange-500 scale-x-[-1]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="text-base font-regular text-slate-900">Lifetime Sales</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter">{fmt(saleCount)}</p>
              <span className="text-[10px] font-medium text-slate-400">-{saleToday} today</span>
            </div>
          </div>
          <div className="w-20 shrink-0 bg-white flex items-center justify-center ml-auto">
            <TrendingUp size={30} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>

        <div className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col justify-center px-5 py-4">
            <p className="text-base font-regular text-slate-900">Live Activity</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter">{fmt(total)}</p>
              <span className="text-[10px] font-medium text-slate-400">{today} today</span>
            </div>
          </div>
          <div className="w-20 shrink-0 bg-white flex items-center justify-center ml-auto">
            <Activity size={30} className="text-orange-500 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatsOverview;
