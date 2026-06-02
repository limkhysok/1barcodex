"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  ChevronDown,
  Filter,
  MapPin,
  Activity,
} from "lucide-react";

interface InventoryToolbarProps {
  siteFilter: string;
  setSiteFilter: (v: string) => void;
  siteOptions: string[];
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  setOrdering: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  totalResults: number;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filtersRef: React.RefObject<HTMLDivElement | null>;
}

function DropdownFilter({
  label, value, onChange, options, icon: Icon, compact = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
  icon: React.ElementType;
  compact?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeLabel = options.find(o => o.key === value)?.label || label;
  const isActive = value !== "";

  let btnCls = "border-slate-500 bg-gray-50/50 text-gray-400 hover:text-white hover:bg-orange-500 hover:border-orange-300";
  if (isActive) btnCls = "border-orange-500 bg-orange-500 text-white font-black shadow-sm";
  else if (open) btnCls = "border-orange-500 bg-white text-gray-900 shadow-sm";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`px-2.5 py-1 border rounded-lg text-[13px] lg:text-sm font-regular transition-all duration-150 focus:outline-none flex items-center gap-2 group ${btnCls} h-8 ${compact ? "min-w-0" : "min-w-30"}`}
      >
        <div className={`transition-colors duration-200 shrink-0 ${isActive ? "text-white" : "text-gray-700 group-hover:text-white"}`}>
          <Icon size={13} strokeWidth={3} />
        </div>
        {!compact && (
          <span className={`truncate flex-1 text-left text-[13px] lg:text-sm font-regular ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`}>
            {activeLabel}
          </span>
        )}
        {compact && isActive && (
          <span className="truncate max-w-20 text-left text-sm font-regular text-white">
            {activeLabel}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
          strokeWidth={3}
        />
      </button>

      {open && (
        <div className="absolute z-50 left-0 mt-1 min-w-48 bg-white border border-slate-500 rounded-sm shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden max-h-64 overflow-y-auto">
          <ul className="divide-y divide-gray-50">
            {options.map((opt) => (
              <li key={opt.key}>
                <button type="button" onClick={() => { onChange(opt.key); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[13px] lg:text-sm font-regular transition-colors flex items-center justify-between ${value === opt.key ? "bg-slate-50 text-orange-500 border-l-2 border-orange-500" : "text-gray-500 hover:bg-orange-500 hover:text-white"}`}>
                  {opt.label}
                  {value === opt.key && (
                    <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


function SearchBar({ search, setSearch, placeholder = "Search record..." }: Readonly<{ search: string; setSearch: (v: string) => void; placeholder?: string }>) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-gray-400 rounded-lg px-2.5 h-8 focus-within:border-orange-200 focus-within:bg-white transition-all overflow-hidden flex-1">
      <Search size={13} className="text-gray-700 shrink-0" strokeWidth={3} />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-transparent border-none outline-none text-[13px] lg:text-sm text-slate-900 placeholder:text-gray-500 w-full font-regular"
      />
      <button
        onClick={() => setSearch("")}
        className={`shrink-0 transition-colors ${search ? "text-gray-300 hover:text-slate-900 cursor-pointer" : "opacity-0 pointer-events-none"}`}
      >
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

export function InventoryToolbar({
  siteFilter, setSiteFilter, siteOptions,
  statusFilter, setStatusFilter,
  setOrdering,
  search, setSearch,
  totalResults,
  filtersOpen, setFiltersOpen, filtersRef,
}: Readonly<InventoryToolbarProps>) {
  const activeCount = [siteFilter, statusFilter, search].filter(Boolean).length;
  const isFiltered = activeCount > 0;

  const clearAll = () => {
    setSiteFilter("");
    setStatusFilter("");
    setSearch("");
    setOrdering("-updated_at");
  };

  const statusOptions = [
    { key: "", label: "All Status" },
    { key: "No", label: "Good" },
    { key: "LOW", label: "Low" },
    { key: "no_stock", label: "No Stock" },
  ];

  const siteDropdownOptions = [
    { key: "", label: "All Sites" },
    ...siteOptions.map(s => ({ key: s, label: s }))
  ];

  let mobileFilterBtnClass = "bg-white text-gray-400 border-slate-400";
  if (filtersOpen) mobileFilterBtnClass = "bg-orange-500 text-white border-orange-500";
  else if (activeCount > 0) mobileFilterBtnClass = "bg-orange-50 text-orange-500 border-orange-300";

  return (
    <div className="flex flex-col gap-2">

      {/* ── MOBILE (< sm) ── */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative" ref={filtersRef}>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-3 h-8 rounded-lg border text-[13px] transition-all cursor-pointer ${mobileFilterBtnClass}`}
          >
            <Filter size={13} strokeWidth={3} />
            <span>Filter</span>
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-orange-600 text-white text-[8px] rounded-lg flex items-center justify-center font-black border border-white">
                {activeCount}
              </span>
            )}
          </button>

          {filtersOpen && (
            <div className="absolute left-0 mt-2 z-50 w-60 bg-white border border-slate-500 rounded-sm shadow-2xl p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-[13px] text-slate-400 border-b border-slate-200 pb-2">
                Showing {totalResults} Records
              </div>

              <div className="space-y-1">
                <span className="text-[13px] font-regular text-gray-500 flex items-center gap-1.5"><MapPin size={10} /> Site</span>
                <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto pr-1">
                  {siteDropdownOptions.map((opt) => (
                    <button key={opt.key} onClick={() => { setSiteFilter(opt.key); setFiltersOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 text-[13px] font-regular transition-colors rounded-sm ${siteFilter === opt.key ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-slate-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[13px] font-regular text-gray-500 flex items-center gap-1.5"><Activity size={10} /> Status</span>
                <div className="flex flex-col gap-0.5 pr-1">
                  {statusOptions.map((opt) => (
                    <button key={opt.key} onClick={() => { setStatusFilter(opt.key); setFiltersOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 text-[13px] font-regular transition-colors rounded-sm ${statusFilter === opt.key ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-slate-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button onClick={clearAll} className="flex-1 py-1 text-[13px] font-regular text-gray-400 hover:text-red-500 border border-slate-500 rounded-lg cursor-pointer">Reset</button>
                <button onClick={() => setFiltersOpen(false)} className="flex-1 py-1 text-[13px] font-regular bg-slate-900 text-white rounded-lg cursor-pointer">Done</button>
              </div>
            </div>
          )}
        </div>

        <SearchBar search={search} setSearch={setSearch} placeholder="Search records..." />
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:flex lg:hidden items-center gap-2">
        <DropdownFilter label="Site" value={siteFilter} onChange={setSiteFilter} options={siteDropdownOptions} icon={MapPin} />
        <DropdownFilter label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} icon={Activity} />
        {isFiltered && (
          <button onClick={clearAll} className="flex items-center gap-1.5 px-2.5 h-8 text-[13px] font-normal text-gray-600 hover:text-red-500 transition-colors border border-dashed border-slate-500 rounded-sm hover:border-red-200 hover:bg-red-50 shrink-0 cursor-pointer">
            <X size={11} strokeWidth={3} />
            Clear
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <SearchBar search={search} setSearch={setSearch} />
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center gap-2">
        <DropdownFilter label="All Sites" value={siteFilter} onChange={setSiteFilter} options={siteDropdownOptions} icon={MapPin} />
        <DropdownFilter label="All Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} icon={Activity} />

        {isFiltered && (
          <button onClick={clearAll} className="flex items-center gap-2 px-3 h-8 text-sm font-normal text-gray-600 hover:text-red-500 transition-colors border border-dashed border-slate-500 rounded-sm hover:border-red-200 hover:bg-red-50 cursor-pointer">
            <X size={12} strokeWidth={3} />
            Clear All
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <SearchBar search={search} setSearch={setSearch} placeholder="Search record..." />
        </div>
      </div>

    </div>
  );
}
