  "use client";

  import React, { useState, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
  import useSWR from "swr";
  import Link from "next/link";
  import {
    Package,
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    RefreshCw,
    Boxes,
    Activity,
    ChevronRight,
    ChevronDown,
    Check,
  } from "lucide-react";
  import {
    ResponsiveContainer,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
  } from "recharts";
  import { getDashboardStats } from "@/src/services/dashboard.service";
  import type { DashboardStats } from "@/src/types/dashboard.types";

  type RangeLabel = "today" | "7_days" | "14_days" | "30_days" | "3_months" | "12_months" | "all_time" | "custom";

  const RANGE_TABS: { label: string; value: RangeLabel }[] = [
    { label: "Today",     value: "today"     },
    { label: "7 Days",    value: "7_days"    },
    { label: "14 Days",   value: "14_days"   },
    { label: "30 Days",   value: "30_days"   },
    { label: "3 Months",  value: "3_months"  },
    { label: "12 Months", value: "12_months" },
    { label: "All Time",  value: "all_time"  },
    { label: "Custom",    value: "custom"    },
  ];


  function RangeTabs({
    value,
    onChange,
    customStart,
    customEnd,
    onCustomStartChange,
    onCustomEndChange,
  }: Readonly<{
    value: RangeLabel;
    onChange: (v: RangeLabel) => void;
    customStart: string;
    customEnd: string;
    onCustomStartChange: (v: string) => void;
    onCustomEndChange: (v: string) => void;
  }>) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLabel = RANGE_TABS.find((t) => t.value === value)?.label ?? "Select Date";

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      if (open) document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    function handleTriggerClick() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const dropdownW = 220;
      const spaceBelow = window.innerHeight - r.bottom;
      const style: React.CSSProperties = { position: "fixed", zIndex: 9999, width: dropdownW };
      if (spaceBelow < 340) {
        style.bottom = window.innerHeight - r.top + 4;
      } else {
        style.top = r.bottom + 4;
      }
      const rightAligned = r.right - dropdownW;
      style.left = Math.max(8, rightAligned);
      setPos(style);
      setOpen((v) => !v);
    }

    function handleSelect(v: RangeLabel) {
      onChange(v);
      if (v !== "custom") setOpen(false);
    }

    return (
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTriggerClick}
          className="flex items-center gap-2 h-8 px-3 text-[13px] font-regular border border-gray-900 rounded-md bg-white text-slate-900 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer active:scale-95"
        >
          <span>{currentLabel}</span>
          <ChevronDown size={11} strokeWidth={3} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            ref={dropdownRef}
            style={pos}
            className="bg-white border border-gray-600 rounded-md shadow-lg py-1 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {RANGE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleSelect(tab.value)}
                className={`flex items-center justify-between px-4 py-2 text-[13px] font-regular text-left transition-colors cursor-pointer ${
                  value === tab.value
                    ? "bg-orange-50 text-orange-500"
                    : "text-slate-900 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                {value === tab.value && <Check size={11} strokeWidth={3} className="text-orange-500 shrink-0" />}
              </button>
            ))}

            {value === "custom" && (
              <div className="border-t border-gray-600 mt-1 px-4 pt-3 pb-3 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => onCustomStartChange(e.target.value)}
                    className="h-8 px-2.5 text-[11px] font-bold border border-gray-600 rounded-md bg-white text-slate-700 focus:outline-none focus:border-orange-400 cursor-pointer hover:border-gray-600 transition-colors w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</span>
                  <input
                    type="date"
                    value={customEnd}
                    min={customStart}
                    onChange={(e) => onCustomEndChange(e.target.value)}
                    className="h-8 px-2.5 text-[11px] font-bold border border-gray-600 rounded-md bg-white text-slate-700 focus:outline-none focus:border-orange-400 cursor-pointer hover:border-gray-600 transition-colors w-full"
                  />
                </div>
                <button
                  type="button"
                  disabled={!customStart || !customEnd || customStart > customEnd}
                  onClick={() => setOpen(false)}
                  className="h-7 text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white rounded-sm hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }


  interface ChartTooltipProps {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }

  function ChartTooltip({ active, payload, label }: Readonly<ChartTooltipProps>) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-600 rounded-lg shadow-md px-3.5 py-3 min-w-35">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2.5 border-b border-slate-500 pb-2">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{entry.name}</span>
              </div>
              <span className="text-[11px] font-black tabular-nums text-slate-800">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function formatTxDate(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  }

  type ChartPoint = { date: string; isoKey: string; receive: number; sale: number };

  function buildEmptyPoint(d: Date): ChartPoint {
    return { date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }), isoKey: d.toISOString().slice(0, 10), receive: 0, sale: 0 };
  }

  function prefillDateGrid(rangeStart: string, rangeEnd: string): Record<string, ChartPoint> {
    const groups: Record<string, ChartPoint> = {};
    const startMs  = new Date(rangeStart).getTime();
    const endMs    = new Date(rangeEnd).getTime();
    if ((endMs - startMs) / 86_400_000 > 90) return groups;
    for (let ms = startMs; ms <= endMs; ms += 86_400_000) {
      const d = new Date(ms);
      groups[d.toISOString().slice(0, 10)] = buildEmptyPoint(d);
    }
    return groups;
  }

  function buildChartData(stats: DashboardStats | null | undefined): ChartPoint[] {
    const rangeStart = stats?.range?.start?.slice(0, 10) ?? null;
    const rangeEnd   = stats?.range?.end?.slice(0, 10)   ?? null;
    const groups     = rangeStart && rangeEnd ? prefillDateGrid(rangeStart, rangeEnd) : {} as Record<string, ChartPoint>;

    for (const tx of stats?.transactions?.recent_activity ?? []) {
      const dateObj = new Date(tx.transaction_date);
      const isoKey  = dateObj.toISOString().slice(0, 10);
      if (rangeStart && isoKey < rangeStart) continue;
      if (rangeEnd   && isoKey > rangeEnd)   continue;
      if (!groups[isoKey]) groups[isoKey] = buildEmptyPoint(dateObj);
      if (tx.transaction_type === "Receive") groups[isoKey].receive += tx.total_quantity;
      else groups[isoKey].sale += tx.total_quantity;
    }

    return Object.values(groups).sort((a, b) => a.isoKey.localeCompare(b.isoKey));
  }

  interface KpiCardsProps {
    productsTotal: number;
    needsReorder: number;
    transactionsTotal: number;
    loading: boolean;
  }

  function KpiCards({ productsTotal, needsReorder, transactionsTotal, loading }: Readonly<KpiCardsProps>) {
    const lowTextCls = needsReorder > 0 ? "text-red-500" : "text-slate-900";
    const lowIconCls = needsReorder > 0 ? "text-red-500" : "text-orange-500";
    return (
      <div className={`transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {/* MOBILE (< sm) */}
        <div className="sm:hidden grid grid-cols-3 gap-1.5">
          <Link href="/products" className="bg-white border border-gray-400 rounded-md overflow-hidden flex flex-col px-2 py-2.5 relative">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Product</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{productsTotal.toLocaleString()}</p>
            <Package size={18} className="text-orange-500 absolute right-2 top-2" strokeWidth={1.5} />
          </Link>
          <Link href="/inventory" className="bg-white border border-gray-400 rounded-md overflow-hidden flex flex-col px-2 py-2.5 relative">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Low Stock</p>
            <p className={`text-base font-medium leading-none tabular-nums tracking-tighter mt-0.5 ${lowTextCls}`}>{needsReorder.toLocaleString()}</p>
            <AlertCircle size={18} className={`absolute right-2 top-2 ${lowIconCls}`} strokeWidth={1.5} />
          </Link>
          <Link href="/transactions" className="bg-white border border-gray-400 rounded-md overflow-hidden flex flex-col px-2 py-2.5 relative">
            <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Transaction</p>
            <p className="text-base font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-0.5">{transactionsTotal.toLocaleString()}</p>
            <Boxes size={18} className="text-orange-500 absolute right-2 top-2" strokeWidth={1.5} />
          </Link>
        </div>

        {/* TABLET (sm → lg) */}
        <div className="hidden sm:grid lg:hidden grid-cols-3 gap-2">
          <Link href="/products" className="group bg-white border border-gray-600 rounded-md overflow-hidden flex items-center justify-between px-4 py-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Product</p>
              <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{productsTotal.toLocaleString()}</p>
            </div>
            <Package size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200 shrink-0" strokeWidth={1.5} />
          </Link>
          <Link href="/inventory" className="group bg-white border border-gray-600 rounded-md overflow-hidden flex items-center justify-between px-4 py-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Low Stock</p>
              <p className={`text-xl font-medium leading-none tabular-nums tracking-tighter mt-1 ${lowTextCls}`}>{needsReorder.toLocaleString()}</p>
            </div>
            <AlertCircle size={22} className={`group-hover:scale-110 transition-transform duration-200 shrink-0 ${lowIconCls}`} strokeWidth={1.5} />
          </Link>
          <Link href="/transactions" className="group bg-white border border-gray-600 rounded-md overflow-hidden flex items-center justify-between px-4 py-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">Transaction</p>
              <p className="text-xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{transactionsTotal.toLocaleString()}</p>
            </div>
            <Boxes size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-200 shrink-0" strokeWidth={1.5} />
          </Link>
        </div>

        {/* DESKTOP (≥ lg) */}
        <div className="hidden lg:grid grid-cols-3 gap-5">
          <Link href="/products" className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex items-center justify-between px-5 py-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col justify-center">
              <p className="text-base font-regular text-slate-900">Product</p>
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{productsTotal.toLocaleString()}</p>
            </div>
            <Package size={40} className="text-orange-500 group-hover:scale-110 transition-transform duration-200 shrink-0" strokeWidth={1} />
          </Link>
          <Link href="/inventory" className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex items-center justify-between px-5 py-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col justify-center">
              <p className="text-base font-regular text-slate-900">Low Stock</p>
              <p className={`text-2xl font-medium leading-none tabular-nums tracking-tighter mt-1 ${lowTextCls}`}>{needsReorder.toLocaleString()}</p>
            </div>
            <AlertCircle size={40} className={`group-hover:scale-110 transition-transform duration-200 shrink-0 ${lowIconCls}`} strokeWidth={1} />
          </Link>
          <Link href="/transactions" className="group bg-white border border-gray-600 rounded-lg overflow-hidden flex items-center justify-between px-5 py-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col justify-center">
              <p className="text-base font-regular text-slate-900">Transaction</p>
              <p className="text-2xl font-medium text-slate-900 leading-none tabular-nums tracking-tighter mt-1">{transactionsTotal.toLocaleString()}</p>
            </div>
            <Boxes size={40} className="text-orange-500 group-hover:scale-110 transition-transform duration-200 shrink-0" strokeWidth={1} />
          </Link>
        </div>
      </div>
    );
  }

  export default function DashboardClient() {
    const [range, setRange]             = useState<RangeLabel>("7_days");
    const [customStart, setCustomStart] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    });
    const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));
    // useSyncExternalStore: false on server/hydration, true on client — no setState-in-effect needed
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

    // SWR key: null when custom range isn't ready yet (pauses fetch)
    let swrKey: string | null;
    if (range !== "custom") {
      swrKey = `dashboard-${range}`;
    } else if (customStart && customEnd && customStart <= customEnd) {
      swrKey = `dashboard-custom-${customStart}-${customEnd}`;
    } else {
      swrKey = null;
    }

    const { data: stats, isValidating: loading, error: swrError, mutate } = useSWR<DashboardStats | null>(
      swrKey,
      () => getDashboardStats(undefined, {
        range,
        start: range === "custom" ? customStart : undefined,
        end: range === "custom" ? customEnd : undefined,
      }),
    );

    const error = swrError ? "Failed to load stats. Please refresh." : "";

    const products     = stats?.products;
    const inventory    = stats?.inventory;
    const transactions = stats?.transactions;

  const chartData = useMemo(() => buildChartData(stats), [stats]);

    return (
      <div className="px-4 py-5 sm:px-5 sm:py-5 space-y-3">

        {/* ── HEADER: MOBILE (< sm) — single row ── */}
        <div className="sm:hidden flex items-center justify-between gap-2">
          <div className="flex flex-col shrink-0">
            <h1 className="text-lg font-normal text-slate-950">Dashboard</h1>
            <p className="text-xs text-slate-600">Overview</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <RangeTabs
              value={range}
              onChange={setRange}
              customStart={customStart}
              customEnd={customEnd}
              onCustomStartChange={setCustomStart}
              onCustomEndChange={setCustomEnd}
            />
            <button
              type="button"
              onClick={() => mutate()}
              disabled={loading}
              className="p-2 border border-gray-600 rounded-md text-slate-400 active:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw size={14} strokeWidth={3} className={loading ? "animate-spin text-orange-500" : ""} />
            </button>
          </div>
        </div>

        {/* ── HEADER: TABLET / DESKTOP (≥ sm) ── */}
        <div className="hidden sm:flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col border-l-4 border-orange-500 pl-4">
            <h1 className="text-2xl font-normal text-slate-950">Dashboard</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-slate-600">Overview of inventory, products, and transactions.</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <RangeTabs
                value={range}
                onChange={setRange}
                customStart={customStart}
                customEnd={customEnd}
                onCustomStartChange={setCustomStart}
                onCustomEndChange={setCustomEnd}
              />
              <button
                type="button"
                onClick={() => mutate()}
                disabled={loading}
                className="group flex items-center gap-2 px-4 h-8 text-[13px] font-regular  border border-slate-900 rounded-md text-slate-900 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <RefreshCw
                  size={12}
                  strokeWidth={3}
                  className={`transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
                />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-sm uppercase tracking-widest">
            {error}
          </p>
        )}

        {/* ── KPI GRID ── */}
        <KpiCards
          productsTotal={products?.total ?? 0}
          needsReorder={inventory?.needs_reorder ?? 0}
          transactionsTotal={transactions?.total ?? 0}
          loading={loading}
        />

        {/* ── ANALYTICS + SIGNAL LOG ── */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5 items-stretch transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <div className="lg:col-span-2 bg-white border border-gray-600 rounded-lg flex flex-col overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-orange-500 shrink-0" strokeWidth={2} />
                <h2 className="text-base font-regular text-slate-900">Analytics Summary</h2>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[13px] font-regular text-slate-900">Receive</span>
                  <span className="text-[13px] font-medium text-green-600 tabular-nums">
                    {(transactions?.by_type?.Receive?.total_quantity ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-[13px] font-regular text-slate-900">Sale</span>
                  <span className="text-[13px] font-medium text-orange-500 tabular-nums">
                    {(transactions?.by_type?.Sale?.total_quantity ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full min-w-0 relative h-64 sm:h-90 md:h-110 lg:h-120 xl:h-120 p-5 pl-2">
              {mounted && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#1a1a1a', fontSize: 11, fontWeight: 400 }} dy={10} />
                    <YAxis width={32} axisLine={false} tickLine={false} tick={{ fill: '#1a1a1a', fontSize: 11, fontWeight: 400 }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 2' }} />
                    <Area type="monotone" dataKey="receive" stroke="#22C55E" strokeWidth={1.5} fill="#22C55E" fillOpacity={0.05} />
                    <Area type="monotone" dataKey="sale" stroke="#F97316" strokeWidth={1.5} fill="#F97316" fillOpacity={0.05} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <Boxes size={48} strokeWidth={1} className="text-slate-300" />
                  <p className="text-xs font-normal text-slate-400">No trend data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-600 rounded-lg flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-orange-500 shrink-0" strokeWidth={2} />
                <h2 className="text-base font-regular text-slate-900">Signal Log</h2>
              </div>
              <Link href="/transactions" className="group/hist text-sm text-slate-800 hover:text-orange-500 transition-colors flex items-center gap-1">
                History <ChevronRight size={10} strokeWidth={3} className="transition-transform duration-150 group-hover/hist:translate-x-0.5" />
              </Link>
            </div>
            <div className="overflow-y-auto divide-y divide-slate-400 max-h-[clamp(220px,45vh,700px)]">
              {(transactions?.recent_activity ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Clock size={36} strokeWidth={1} className="text-slate-300" />
                  <p className="text-xs font-normal text-slate-400">No transactions in this period</p>
                </div>
              ) : (transactions?.recent_activity ?? []).map((txn, i) => (
                <Link key={txn.id} href="/transactions" className={`group/row flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/40 transition-colors ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <div className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center transition-all duration-200 group-hover/row:scale-110 group-hover/row:shadow-sm ${txn.transaction_type === "Receive" ? "bg-green-50 text-green-600 group-hover/row:bg-green-500 group-hover/row:text-white" : "bg-orange-50 text-orange-600 group-hover/row:bg-orange-500 group-hover/row:text-white"}`}>
                    {txn.transaction_type === "Receive" ? <ArrowDownLeft size={15} strokeWidth={2} /> : <ArrowUpRight size={15} strokeWidth={2} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-slate-800">No.{txn.id}</span>
                      <span className={`text-[13px] font-semibold px-2 py-0.5 rounded-full ${txn.transaction_type === "Receive" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{txn.transaction_type}</span>
                    </div>
                    <p className="text-[13px] font-normal text-slate-800 truncate">By {txn.performed_by ?? "Unknown"} · {txn.item_count} items</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-regular text-slate-800 tabular-nums">{new Date(txn.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[13px] font-regular text-slate-800 tabular-nums">{formatTxDate(txn.transaction_date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
