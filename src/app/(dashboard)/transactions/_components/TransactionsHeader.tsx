"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, X, Check } from "lucide-react";

interface TransactionsHeaderProps {
  onNew: () => void;
  pdfDate: string;
  setPdfDate: (d: string) => void;
  pdfType: "Receive" | "Sale";
  setPdfType: (t: "Receive" | "Sale") => void;
  onExportPdf: () => void;
  pdfLoading: boolean;
  pdfError: string;
  pdfPanelOpen: boolean;
  setPdfPanelOpen: (open: boolean) => void;
  pdfPanelRef: React.RefObject<HTMLDivElement | null>;
}

function ReportDropdown({ 
  open, 
  setOpen, 
  reportRef, 
  pdfDate, 
  setPdfDate, 
  pdfType, 
  setPdfType, 
  onExportPdf, 
  pdfLoading, 
  pdfError,
  compact = false 
}: Readonly<{
  open: boolean;
  setOpen: (v: boolean) => void;
  reportRef: React.RefObject<HTMLDivElement | null>;
  pdfDate: string;
  setPdfDate: (d: string) => void;
  pdfType: "Receive" | "Sale";
  setPdfType: (t: "Receive" | "Sale") => void;
  onExportPdf: () => void;
  pdfLoading: boolean;
  pdfError: string;
  compact?: boolean;
}>) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const inputId = `pdf-date-${compact ? "compact" : "normal"}`;

  return (
    <div className="relative" ref={reportRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-sm text-[11px] font-black uppercase tracking-wider border border-slate-500 transition-all cursor-pointer ${
          open ? "bg-black text-white border-black" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
        } ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
      >
        <FileText size={13} strokeWidth={3} className={open ? "text-white" : "text-slate-400"} />
        {!compact && <span>Report</span>}
        <ChevronDown size={10} strokeWidth={3} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute right-0 mt-3 z-50 bg-white border border-slate-200 rounded-sm shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200 ${compact ? "w-64" : "w-80"}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Report Configuration</h3>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-slate-950 transition-colors">
              <X size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor={inputId} className="text-[9px] font-black text-slate-400 uppercase tracking-widest block cursor-pointer">Operational Date</label>
              <input 
                id={inputId}
                type="date" 
                value={pdfDate} 
                onChange={(e) => setPdfDate(e.target.value)} 
                className="w-full text-[12px] font-bold p-2.5 border border-slate-200 rounded-sm focus:border-orange-500 outline-none transition-all" 
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Transaction Category</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTypeMenuOpen(!typeMenuOpen)}
                  className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 border border-slate-200 rounded-sm bg-white text-[12px] font-bold text-slate-900 focus:border-orange-500 transition-all outline-none"
                >
                  <span className="uppercase tracking-widest">{pdfType === "Receive" ? "RECEIVE (RESTOCK)" : "SALE (OUTBOUND)"}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${typeMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {typeMenuOpen && (
                  <div className="absolute top-full left-0 right-0 z-60 mt-1.5 bg-white border border-slate-200 rounded-sm shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {(["Receive", "Sale"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => { setPdfType(cat); setTypeMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-colors ${pdfType === cat ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        {cat === "Receive" ? "RECEIVE (Restock)" : "SALE (Outbound)"}
                        {pdfType === cat && <Check size={14} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {pdfError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight bg-red-50 p-2 rounded-sm border border-red-100">{pdfError}</p>}
            
            <button 
              onClick={onExportPdf} 
              disabled={pdfLoading} 
              className="w-full py-3 bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              {pdfLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <FileText size={16} strokeWidth={3} />
              )}
              {pdfLoading ? "Preparing…" : "Generate PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TransactionsHeader({ 
  onNew, 
  pdfDate,
  setPdfDate,
  pdfType,
  setPdfType,
  onExportPdf,
  pdfLoading,
  pdfError,
  pdfPanelOpen, 
  setPdfPanelOpen, 
  pdfPanelRef 
}: Readonly<TransactionsHeaderProps>) {
  return (
    <>
      {/* ── MOBILE (< sm) ── */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-base font-medium text-slate-950">Transactions</h1>
          <p className="text-xs text-slate-600">Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportDropdown
            open={pdfPanelOpen}
            setOpen={setPdfPanelOpen}
            reportRef={pdfPanelRef}
            pdfDate={pdfDate}
            setPdfDate={setPdfDate}
            pdfType={pdfType}
            setPdfType={setPdfType}
            onExportPdf={onExportPdf}
            pdfLoading={pdfLoading}
            pdfError={pdfError}
            compact
          />
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
          <h1 className="text-lg font-medium text-slate-950">Transactions</h1>
          <p className="text-sm text-slate-600">Log and review all stock receive and sale transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportDropdown
            open={pdfPanelOpen}
            setOpen={setPdfPanelOpen}
            reportRef={pdfPanelRef}
            pdfDate={pdfDate}
            setPdfDate={setPdfDate}
            pdfType={pdfType}
            setPdfType={setPdfType}
            onExportPdf={onExportPdf}
            pdfLoading={pdfLoading}
            pdfError={pdfError}
          />
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-regular bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] transition-all cursor-pointer"
          >
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex flex-col border-l-4 border-orange-500 pl-4">
          <h1 className="text-xl font-medium text-slate-950">Transactions</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-slate-600">Log and review all stock receive and sale transactions.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ReportDropdown
            open={pdfPanelOpen}
            setOpen={setPdfPanelOpen}
            reportRef={pdfPanelRef}
            pdfDate={pdfDate}
            setPdfDate={setPdfDate}
            pdfType={pdfType}
            setPdfType={setPdfType}
            onExportPdf={onExportPdf}
            pdfLoading={pdfLoading}
            pdfError={pdfError}
          />
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm bg-orange-500 font-regular text-white hover:bg-orange-600 active:scale-[0.96] transition-all cursor-pointer"
          >
            <span>New Transaction</span>
          </button>
        </div>
      </div>
    </>
  );
}
