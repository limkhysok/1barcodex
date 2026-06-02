"use client";

import React from "react";
import { FileDown, ChevronDown } from "lucide-react";

interface InventoryHeaderProps {
  onNew: () => void;
  canEdit: boolean;
  exportOpen: boolean;
  setExportOpen: (v: boolean) => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
  onExport: (type: "no_stock" | "low" | "good" | "all") => void;
}

function ExportDropdown({ open, setOpen, exportRef, onExport, compact = false }: Readonly<{
  open: boolean;
  setOpen: (v: boolean) => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
  onExport: (type: "no_stock" | "low" | "good" | "all") => void;
  compact?: boolean;
}>) {
  return (
    <div className="relative" ref={exportRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-md text-sm font-regular border border-slate-500 transition-all cursor-pointer ${
          open ? "bg-slate-950 text-white border-slate-950" : "bg-white text-gray-600 hover:bg-slate-50"
        } ${compact ? "px-1.5 py-2" : "px-3 py-1.5"}`}
      >
        <FileDown size={13} className={open ? "text-white" : "text-gray-400"} />
        {!compact && <span>Export</span>}
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-28 bg-white border border-slate-200 rounded-md shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2">
          <button onClick={() => onExport("no_stock")} className="w-full text-left px-2.5 py-1.5 text-[13px] font-medium lg:text-sm text-gray-800 hover:text-red-500 focus:text-red-500 hover:bg-red-50 focus:bg-red-50 transition-colors flex items-center justify-between outline-none">
            <span>No Stock</span>
          </button>
          <button onClick={() => onExport("low")} className="w-full text-left px-2.5 py-1.5 text-[13px] font-medium lg:text-sm text-gray-800 hover:text-yellow-600 focus:text-yellow-600 hover:bg-yellow-50 focus:bg-yellow-50 transition-colors flex items-center justify-between border-t border-slate-50 outline-none">
            <span>Low Stock</span>
          </button>
          <button onClick={() => onExport("good")} className="w-full text-left px-2.5 py-1.5 text-[13px] font-medium lg:text-sm text-gray-800 hover:text-green-600 focus:text-green-600 hover:bg-green-50 focus:bg-green-50 transition-colors flex items-center justify-between border-t border-slate-50 outline-none">
            <span>Good Stock</span>
          </button>
          <button onClick={() => onExport("all")} className="w-full text-left px-2.5 py-1.5 text-[13px] font-medium lg:text-sm text-slate-600 hover:bg-slate-50  transition-colors border-t border-slate-100">
            All
          </button>
        </div>
      )}
    </div>
  );
}

export function InventoryHeader({ onNew, canEdit, exportOpen, setExportOpen, exportRef, onExport }: Readonly<InventoryHeaderProps>) {
  return (
    <>
      {/* ── MOBILE (< sm) ── */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-normal text-slate-950">Inventory</h1>
          <p className="text-xs text-slate-600">Track and manage stock.</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <ExportDropdown open={exportOpen} setOpen={setExportOpen} exportRef={exportRef} onExport={onExport} compact />
          )}
          <button
            onClick={onNew}
            className="px-3 py-1.5 rounded-md text-[13px] font-regular bg-orange-500 text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:flex lg:hidden items-center justify-between">
        <div className="flex flex-col border-l-2 border-orange-500 pl-3">
          <h1 className="text-xl font-normal text-slate-950">Inventory</h1>
          <p className="text-sm text-slate-600">Track and manage stock across all sites and locations.</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <ExportDropdown open={exportOpen} setOpen={setExportOpen} exportRef={exportRef} onExport={onExport} />
          )}
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-regular bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] transition-all cursor-pointer"
          >
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex flex-col border-l-4 border-orange-500 pl-4">
          <h1 className="text-2xl font-normal text-slate-950">Inventory</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-slate-600">Track and manage stock across all sites and locations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <ExportDropdown open={exportOpen} setOpen={setExportOpen} exportRef={exportRef} onExport={onExport} />
          )}
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm bg-orange-500 font-regular text-white hover:bg-orange-600 active:scale-[0.96] transition-all cursor-pointer"
          >
            <span>New</span>
          </button>
        </div>
      </div>
    </>
  );
}
