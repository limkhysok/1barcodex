"use client";

import React from "react";
import Image from "next/image";
import type { InventoryRecord } from "@/src/types/inventory.types";
import {
  Edit2,
  Trash2,
  Database,
  MapPin,
  Package,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export type SortDir = "asc" | "desc" | "";

interface InventoryTableProps {
  loading: boolean;
  error: string;
  displayed: InventoryRecord[];
  onEdit: (r: InventoryRecord) => void;
  onDelete: (r: InventoryRecord) => void;
  onView: (r: InventoryRecord) => void;
  canEdit: boolean;
  canDelete: boolean;
  ordering?: string;
  onSort: (col: string) => void;
}

const SortIcon = ({ field, currentOrdering }: { field: string; currentOrdering: string }) => {
  const isAsc = currentOrdering === field;
  const isDesc = currentOrdering === `-${field}`;
  if (!isAsc && !isDesc) return null;
  return isAsc ? (
    <ArrowUp size={10} className="ml-1.5 text-orange-500" strokeWidth={3} />
  ) : (
    <ArrowDown size={10} className="ml-1.5 text-orange-500" strokeWidth={3} />
  );
};

const Header = ({
  label,
  field,
  className,
  ordering,
  handleSort,
}: {
  label: string;
  field?: string;
  className?: string;
  ordering: string;
  handleSort: (f: string) => void;
}) => {
  const isSortable = !!field;
  const isActive = field && (ordering === field || ordering === `-${field}`);
  return (
    <th
      onClick={() => isSortable && field && handleSort(label)}
      className={`px-4 py-2 text-left text-sm font-medium transition-all duration-200 select-none ${
        isSortable ? "cursor-pointer hover:bg-slate-100/50" : ""
      } ${isActive ? "text-orange-600 bg-orange-50/30" : "text-gray-800"} ${className || ""}`}
    >
      <div className={`flex items-center ${className?.includes('center') ? 'justify-center' : ''} ${className?.includes('right') ? 'justify-end' : ''}`}>
        {label}
        {isSortable && field && <SortIcon field={field} currentOrdering={ordering} />}
      </div>
    </th>
  );
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StockBadge({ r }: Readonly<{ r: InventoryRecord }>) {
  if (r.quantity_on_hand === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> No Stock
      </span>
    );
  }
  if (r.reorder_status === "LOW") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100/50">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" /> Low
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100/50">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> Good
    </span>
  );
}

export function InventoryTable({
  loading,
  error,
  displayed,
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
  ordering = "",
  onSort,
}: Readonly<InventoryTableProps>) {

  if (loading && displayed.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#FA4900", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (error) {
    return <p className="text-center py-20 text-sm text-red-400">{error}</p>;
  }

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-600">
        <Database className="w-10 h-10 opacity-30" strokeWidth={1.5} />
        <p className="text-sm font-medium uppercase tracking-widest text-[10px]">No Records Found</p>
      </div>
    );
  }

  // ── Mobile + Tablet: card grid (1 col mobile, 4 cols tablet, hidden on desktop) ──
  const responsiveCards = (
    <div className="grid lg:hidden grid-cols-1 sm:grid-cols-4 gap-3">
      {displayed.map((r) => (
        <div key={r.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5 flex flex-col">
          <button type="button" onClick={() => onView(r)} className="w-full text-left flex flex-col cursor-pointer flex-1">
            <div className="relative h-36 w-full bg-gray-50 flex items-center justify-center overflow-hidden group-hover:bg-orange-50 transition-colors">
              {r.product_details.product_picture ? (
                <Image
                  src={`${BASE_URL}${r.product_details.product_picture}`}
                  alt={r.product_details.product_name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Package size={28} strokeWidth={1} className="opacity-20" />
              )}
              <span className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 tabular-nums bg-white/90 px-1.5 py-0.5 rounded-md border border-gray-200">
                #{r.id}
              </span>
              <div className="absolute top-2 right-2">
                <StockBadge r={r} />
              </div>
            </div>
            <div className="px-3 py-2.5 flex flex-col gap-1.5 flex-1">
              <p className="text-sm font-normal text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                {r.product_details.product_name}
              </p>
              <p className="text-sm font-normal font-mono text-gray-400 truncate">
                {r.product_details.barcode || "—"}
              </p>
              <div className="flex items-center gap-1 min-w-0">
                <MapPin size={10} className="text-slate-300 shrink-0" />
                <span className="text-sm font-normal text-gray-500 truncate">
                  {r.site}{r.location ? ` · ${r.location}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                <span className="text-sm font-medium text-gray-400">Qty</span>
                <span className="text-sm font-normal text-gray-900 tabular-nums">
                  {r.quantity_on_hand.toLocaleString()}
                </span>
              </div>
            </div>
          </button>
          <div className="absolute top-0 inset-x-0 h-36 bg-black/25 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center justify-center gap-1.5">
            <button onClick={() => onView(r)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" title="View">
              <Eye size={13} strokeWidth={2.5} />
            </button>
            {canEdit && (
              <button onClick={() => onEdit(r)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 transition-colors cursor-pointer" title="Edit">
                <Edit2 size={13} strokeWidth={2.5} />
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(r)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 transition-colors cursor-pointer" title="Delete">
                <Trash2 size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Desktop: List Table ──
  const desktopList = (
    <div className="hidden lg:block overflow-x-auto bg-white border border-slate-500 rounded-lg">
      <table className="w-full text-sm table-fixed">
        <thead className="bg-slate-50/50 border-b border-gray-600">
          <tr>
            <Header label="No" field="id" ordering={ordering} handleSort={onSort} className="w-[5%]" />
            <Header label="Product" field="product_name" ordering={ordering} handleSort={onSort} className="w-[20%]" />
            <Header label="Barcode" field="barcode" ordering={ordering} handleSort={onSort} className="w-[13%]" />
            <Header label="Status" field="reorder_status" ordering={ordering} handleSort={onSort} className="w-[9%]" />
            <Header label="Site" field="site" ordering={ordering} handleSort={onSort} className="w-[12%]" />
            <Header label="Location" field="location" ordering={ordering} handleSort={onSort} className="w-[10%]" />
            <Header label="Quantity" field="quantity_on_hand" ordering={ordering} handleSort={onSort} className="w-[9%]" />
            <Header label="Created" field="created_at" ordering={ordering} handleSort={onSort} className="w-[10%]" />
            <Header label="Actions" ordering={ordering} handleSort={onSort} className="w-[12%]" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {displayed.map((r) => (
            <tr key={r.id} className="group hover:bg-orange-50/60 transition-colors">
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-600 tabular-nums group-hover:text-orange-600 transition-colors">{r.id}</span>
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-900 group-hover:text-orange-600 transition-colors">
                  {r.product_details.product_name}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className="text-sm font-normal font-mono text-gray-700 tabular-nums group-hover:text-orange-400 transition-colors">
                  {r.product_details.barcode || "—"}
                </span>
              </td>
              <td className="px-4 py-2">
                <StockBadge r={r} />
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-700 truncate">{r.site}</span>
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-700 truncate">{r.location || "—"}</span>
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-900 tabular-nums">
                  {r.quantity_on_hand.toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap" suppressHydrationWarning>
                <span className="text-sm font-normal text-gray-600 tabular-nums">{formatDate(r.created_at)}</span>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onView(r)} className="p-1.5 text-slate-800 hover:text-blue-500 hover:bg-blue-50 rounded transition-all cursor-pointer" title="View">
                    <Eye size={16} strokeWidth={2.5} />
                  </button>
                  {canEdit && (
                    <button onClick={() => onEdit(r)} className="p-1.5 text-slate-800 hover:text-orange-500 hover:bg-orange-50 rounded transition-all cursor-pointer" title="Edit">
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => onDelete(r)} className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer" title="Delete">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className={`h-0.5 w-full overflow-hidden rounded-full mb-1 transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0"}`}>
        <div className="h-full bg-orange-500 animate-pulse w-full" />
      </div>
      {responsiveCards}
      {desktopList}
    </>
  );
}
