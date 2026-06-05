"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Barcode } from "lucide-react";
import type { InventoryRecord } from "@/src/types/inventory.types";
import { getInventory } from "@/src/services/inventory.service";

interface InventoryPickerProps {
  inventory: InventoryRecord[];
  value: number;
  onChange: (id: number) => void;
  excludeIds: number[];
  onFetchExtra?: (record: InventoryRecord) => void;
}

const InventoryPicker: React.FC<InventoryPickerProps> = ({ inventory, value, onChange, excludeIds, onFetchExtra }) => {
  const selected = inventory.find((r) => r.id === value);

  // Always derived from live inventory — never stale state.
  // When extraRecords are replaced with real fetched records, this auto-updates.
  const displayLabel = selected
    ? `${selected.product_details.product_name ?? ""} (stock: ${selected.quantity_on_hand})`
    : "";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(""); // filter text only, used when open
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiResults, setApiResults] = useState<InventoryRecord[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onScroll(e: Event) {
      if (dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  // Debounced API search
  useEffect(() => {
    const q = search.trim();
    if (!q || !open) {
      setApiResults([]);
      setApiLoading(false);
      return;
    }
    setApiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await getInventory({ search: q });
        setApiResults(result.results);
      } catch {
        setApiResults([]);
      } finally {
        setApiLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search, open]);

  function handleFocus() {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setSearch("");
    setOpen(true);
  }

  const localFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const selectedLabel = selected
      ? (selected.product_details.product_name ?? "").toLowerCase()
      : "";
    const available = inventory.filter((r) => !excludeIds.includes(r.id) || r.id === value);
    if (!q || q === selectedLabel) return available;
    return available.filter((r) =>
      r.product_details?.product_name?.toLowerCase().includes(q) ||
      r.site?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.product_details?.barcode?.toLowerCase().includes(q)
    );
  }, [inventory, search, excludeIds, value, selected]);

  const allFiltered = useMemo(() => {
    const combined = [...localFiltered];
    for (const r of apiResults) {
      if (!combined.some((c) => c.id === r.id) && (!excludeIds.includes(r.id) || r.id === value)) {
        combined.push(r);
      }
    }
    return combined;
  }, [localFiltered, apiResults, excludeIds, value]);

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        placeholder="Search Product/Barcode..."
        value={open ? search : displayLabel}
        onFocus={handleFocus}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        className="w-full text-[13px] pr-1 py-1 outline-none transition placeholder:text-gray-700 text-black text-left bg-transparent focus:text-orange-600 font-medium"
      />

      {open && (
        <div
          ref={dropRef}
          className="bg-white border border-slate-950/10 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
        >
          <ul className="max-h-64 overflow-y-auto">
            {apiLoading && (
              <li className="px-5 py-3 text-center">
                <p className="text-[12px] font-medium text-slate-400">Searching...</p>
              </li>
            )}
            {!apiLoading && allFiltered.length === 0 && (
              <li className="px-5 py-6 text-center">
                <p className="text-[13px] font-medium text-slate-500">No matching results</p>
              </li>
            )}
            {!apiLoading && allFiltered.map((r) => (
              <li key={r.id} className="border-b border-gray-300 last:border-b-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!inventory.some((inv) => inv.id === r.id)) {
                      onFetchExtra?.(r);
                    }
                    onChange(r.id);
                    setSearch("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-start gap-4 transition-all duration-150 ${
                    value === r.id ? "bg-orange-500 text-white" : "text-slate-700 hover:bg-orange-50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-medium truncate ${value === r.id ? "text-white" : "text-slate-900"}`}>
                      {r.product_details.product_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Barcode size={12} className={`shrink-0 ${value === r.id ? "text-white/60" : "text-slate-400"}`} />
                      <span className={`text-[11px] font-mono truncate ${value === r.id ? "text-white/80" : "text-slate-500"}`}>
                        {r.product_details.barcode || "NO-BARCODE"}
                      </span>
                      <span className={`text-[11px] font-medium shrink-0 ${value === r.id ? "text-white/60" : "text-orange-500"}`}>
                        (Stock: {r.quantity_on_hand})
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InventoryPicker;
