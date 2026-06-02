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
        className={`flex items-center gap-2 rounded-md text-sm font-regular border border-slate-300 transition-all cursor-pointer ${
          open ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-600 hover:bg-slate-50"
        } ${compact ? "px-2 py-1" : "px-3 py-1.5"}`}
      >
        <FileDown size={13} className={open ? "text-white" : "text-slate-400"} />
        {!compact && <span>Export</span>}
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2">
          <button onClick={() => onExport("no_stock")} className="w-full text-left px-4 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-50 uppercase tracking-widest transition-colors flex items-center justify-between">
            <span>No Stock</span><span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          <button onClick={() => onExport("low")} className="w-full text-left px-4 py-2.5 text-[10px] font-black text-yellow-600 hover:bg-yellow-50 uppercase tracking-widest transition-colors flex items-center justify-between border-t border-slate-50">
            <span>Low Stock</span><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          </button>
          <button onClick={() => onExport("good")} className="w-full text-left px-4 py-2.5 text-[10px] font-black text-green-600 hover:bg-green-50 uppercase tracking-widest transition-colors flex items-center justify-between border-t border-slate-50">
            <span>Good Stock</span><span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </button>
          <button onClick={() => onExport("all")} className="w-full text-left px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest transition-colors border-t border-slate-100">
            Full Inventory
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
          <h1 className="text-base font-medium text-slate-950">Inventory</h1>
          <p className="text-xs text-slate-600">Overview</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <ExportDropdown open={exportOpen} setOpen={setExportOpen} exportRef={exportRef} onExport={onExport} compact />
          )}
          <button
            onClick={onNew}
            className="px-2 py-1 rounded-md text-[13px] font-regular bg-orange-500 text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:flex lg:hidden items-center justify-between">
        <div className="flex flex-col border-l-2 border-orange-500 pl-3">
          <h1 className="text-lg font-medium text-slate-950">Inventory</h1>
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
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex flex-col border-l-4 border-orange-500 pl-4">
          <h1 className="text-xl font-medium text-slate-950">Inventory</h1>
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
            <span>New Record</span>
          </button>
        </div>
      </div>
    </>
  );
}
