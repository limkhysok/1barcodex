"use client";

import type { Product } from "@/src/types/product.types";
import { Edit2, Trash2, Eye, Database, ArrowUp, ArrowDown, Package } from "lucide-react";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export type SortDir = "asc" | "desc" | "";

interface ProductsTableProps {
  loading: boolean;
  error: string;
  displayed: Product[];
  products: Product[];
  sortField: string;
  setSortField: (v: string) => void;
  sortDir: SortDir;
  setSortDir: (v: SortDir) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onView: (p: Product) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const SortIcon = ({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: SortDir }) => {
  if (sortField !== field || !sortDir) return null;
  return sortDir === "asc" ? (
    <ArrowUp size={10} className="ml-1.5 text-orange-500" strokeWidth={3} />
  ) : (
    <ArrowDown size={10} className="ml-1.5 text-orange-500" strokeWidth={3} />
  );
};

const Header = ({
  label,
  field,
  className,
  sortField,
  sortDir,
  handleSort,
}: {
  label: string;
  field?: string;
  className?: string;
  sortField: string;
  sortDir: SortDir;
  handleSort: (f: string) => void;
}) => {
  const isSortable = !!field;
  const isActive = sortField === field && sortDir !== "";
  return (
    <th
      onClick={() => isSortable && field && handleSort(field)}
      className={`px-4 py-2 text-left text-sm font-medium transition-all duration-200 select-none ${isSortable ? "cursor-pointer hover:bg-slate-100/50" : ""
        } ${isActive ? "text-orange-600 bg-orange-50/30" : "text-gray-800"} ${className || ""}`}
    >
      <div className="flex items-center">
        {label}
        {isSortable && field && <SortIcon field={field} sortField={sortField} sortDir={sortDir} />}
      </div>
    </th>
  );
};

export function ProductsTable({
  loading,
  error,
  displayed,
  products,
  sortField,
  setSortField,
  sortDir,
  setSortDir,
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
}: Readonly<ProductsTableProps>) {

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") setSortDir("");
      else setSortDir("asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  if (loading && products.length === 0) {
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
    const msg = products.length === 0 ? "Product is Empty" : "No Match Found";
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-600">
        <Database className="w-10 h-10 opacity-30" strokeWidth={1.5} />
        <p className="text-sm font-medium uppercase tracking-widest text-[10px]">{msg}</p>
      </div>
    );
  }

  // ── Mobile: 1-col cards ──
  const mobileRows = (
    <div className="sm:hidden grid grid-cols-1 gap-3 pt-1">
      {displayed.map((p) => (
        <div key={p.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
          <button type="button" onClick={() => onView(p)} className="w-full text-left flex flex-row cursor-pointer">
            <div className="w-28 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden group-hover:bg-orange-50 transition-colors relative">
              {p.product_picture ? (
                <Image src={`${BASE_URL}${p.product_picture}`} alt={p.product_name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              ) : (
                <Package size={28} strokeWidth={1} className="opacity-20" />
              )}
              <span className="absolute top-1.5 left-1.5 text-[13px] font-bold text-gray-500 tabular-nums bg-white/90 px-1.5 py-0.5 rounded-md border border-gray-200">#{p.id}</span>
            </div>
            <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100 self-start truncate max-w-full">{p.category}</span>
              <span className="text-[13px] font-black text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">{p.product_name}</span>
              <span className="text-[13px] font-mono text-gray-400 truncate">{p.barcode}</span>
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                <span className="text-[13px] text-gray-400 truncate">{p.supplier}</span>
                <span className="text-[13px] font-bold text-orange-600 tabular-nums bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 shrink-0 ml-1">{p.reorder_level}</span>
              </div>
            </div>
          </button>
          <div className="absolute top-0 left-0 w-28 h-full bg-black/25 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center justify-center gap-1.5">
            <button type="button" onClick={() => onView(p)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" title="View"><Eye size={13} strokeWidth={2.5} /></button>
            {canEdit && <button type="button" onClick={() => onEdit(p)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 transition-colors cursor-pointer" title="Edit"><Edit2 size={13} strokeWidth={2.5} /></button>}
            {canDelete && <button type="button" onClick={() => onDelete(p)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 transition-colors cursor-pointer" title="Delete"><Trash2 size={13} strokeWidth={2.5} /></button>}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Tablet: 4-col cards ──
  const tabletGrid = (
    <div className="hidden sm:grid lg:hidden grid-cols-4 gap-3 pt-1">
      {displayed.map((p) => (
        <div key={p.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5">
          {/* Card button — click anywhere to view */}
          <button type="button" onClick={() => onView(p)} className="w-full text-left flex flex-col cursor-pointer">
            <div className="h-24 w-full bg-gray-50 flex items-center justify-center overflow-hidden group-hover:bg-orange-50 transition-colors relative">
              {p.product_picture ? (
                <Image src={`${BASE_URL}${p.product_picture}`} alt={p.product_name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              ) : (
                <Package size={24} strokeWidth={1} className="opacity-20" />
              )}
              <span className="absolute top-1.5 left-1.5 text-[13px] font-bold text-gray-500 tabular-nums bg-white/90 px-1.5 py-0.5 rounded-md border border-gray-200">#{p.id}</span>
            </div>
            <div className="px-2.5 py-2 flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100 self-start truncate max-w-full">{p.category}</span>
              <span className="text-[13px] font-black text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">{p.product_name}</span>
              <span className="text-[13px] font-mono text-gray-400 truncate">{p.barcode}</span>
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                <span className="text-[13px] text-gray-400 truncate">{p.supplier}</span>
                <span className="text-[13px] font-bold text-orange-600 tabular-nums bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 shrink-0 ml-1">{p.reorder_level}</span>
              </div>
            </div>
          </button>
          {/* Action overlay — sibling to button, pointer-events-none so bg passes clicks to card */}
          <div className="absolute top-0 inset-x-0 h-24 bg-black/25 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center justify-center gap-1.5">
            <button type="button" onClick={() => onView(p)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" title="View"><Eye size={12} strokeWidth={2.5} /></button>
            {canEdit && <button type="button" onClick={() => onEdit(p)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 transition-colors cursor-pointer" title="Edit"><Edit2 size={12} strokeWidth={2.5} /></button>}
            {canDelete && <button type="button" onClick={() => onDelete(p)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 transition-colors cursor-pointer" title="Delete"><Trash2 size={12} strokeWidth={2.5} /></button>}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Desktop: List table ──
  const desktopList = (
    <div className="hidden lg:block overflow-x-auto bg-white border border-slate-500 rounded-lg">
      <table className="w-full text-sm table-fixed">
        <thead className="bg-slate-50/50 border-b border-gray-600">
          <tr>
            <Header label="No" field="id" className="w-[6%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Barcode" field="barcode" className="w-[12%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Name" field="product_name" className="w-[20%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Category" field="category" className="w-[14%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Reorder" field="reorder_level" className="w-[12%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Supplier" field="supplier" className="w-[12%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Date" field="created_at" className="w-[12%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            <Header label="Actions" className="w-[12%]" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {displayed.map((p) => (
            <tr key={p.id} className="group hover:bg-orange-50/60 transition-colors">
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-600 tabular-nums group-hover:text-orange-600 transition-colors">{p.id}</span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className="text-sm font-normal font-mono text-gray-700 tabular-nums group-hover:text-orange-400 transition-colors">{p.barcode}</span>
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-900 group-hover:text-orange-600 transition-colors">
                  {p.product_name}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className="inline-flex text-sm font-normal text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100/50">
                  {p.category}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-800 tabular-nums group-hover:text-orange-600 transition-colors">{p.reorder_level}</span>
              </td>
              <td className="px-4 py-2">
                <span className="text-sm font-normal text-gray-700 group-hover:text-orange-600 transition-colors">{p.supplier}</span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className="text-sm font-normal text-gray-600 tabular-nums">
                  {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onView(p)}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all cursor-pointer"
                    title="View Product"
                  >
                    <Eye size={16} strokeWidth={2.5} />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-all cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(p)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                      title="Delete Product"
                    >
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
      {mobileRows}
      {tabletGrid}
      {desktopList}
    </>
  );
}
