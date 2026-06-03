"use client";

import React from "react";
import type { Transaction } from "@/src/types/transaction.types";
import {
  Eye,
  Edit2,
  Printer,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  User,
  ArrowRightLeft,
} from "lucide-react";

export type SortDir = "asc" | "desc" | "";

interface TransactionsTableProps {
  displayed: Transaction[];
  loading: boolean;
  error: string;
  onView: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onPrint: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  canEdit: boolean;
  canDelete: boolean;
  onActionClick: (e: React.MouseEvent, t: Transaction) => void;
  ordering?: string;
  onSort?: (col: string) => void;
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
  handleSort?: (f: string) => void;
}) => {
  const isSortable = !!field && !!handleSort;
  const isActive = field && (ordering === field || ordering === `-${field}`);
  return (
    <th
      onClick={() => isSortable && field && handleSort?.(field)}
      className={`px-4 py-2 text-left text-sm font-medium transition-all duration-200 select-none ${
        isSortable ? "cursor-pointer hover:bg-slate-100/50" : ""
      } ${isActive ? "text-orange-600 bg-orange-50/30" : "text-gray-800"} ${className || ""}`}
    >
      <div className="flex items-center">
        {label}
        {isSortable && field && <SortIcon field={field} currentOrdering={ordering} />}
      </div>
    </th>
  );
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const h24 = d.getHours();
  const mins = d.getMinutes();
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  const time = mins === 0 ? `${h12}${ampm}` : `${h12}:${String(mins).padStart(2, "0")}${ampm}`;
  return `${day}/${month}/${year} ${time}`;
}

function TypeBadge({ type }: Readonly<{ type: "Receive" | "Sale" }>) {
  const isReceive = type === "Receive";
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-full ${
      isReceive ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-500 border border-red-100"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isReceive ? "bg-green-500" : "bg-red-500"}`} />
      {type}
    </span>
  );
}

export function TransactionsTable({
  displayed,
  loading,
  error,
  onView,
  onEdit,
  onPrint,
  onDelete,
  canEdit,
  canDelete,
  onActionClick,
  ordering = "",
  onSort,
}: Readonly<TransactionsTableProps>) {

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
        <ArrowRightLeft className="w-10 h-10 opacity-30" strokeWidth={1.5} />
        <p className="text-sm font-medium tracking-widest">No Transactions Found</p>
      </div>
    );
  }

  // ── Mobile: compact cards ──
  const mobileRows = (
    <div className="sm:hidden grid grid-cols-1 gap-3 pt-1">
      {displayed.map((t) => {
        const totalQty = t.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0);
        const isReceive = t.transaction_type === "Receive";
        return (
          <div key={t.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
            <button type="button" onClick={() => onView(t)} className="w-full text-left flex flex-row cursor-pointer">
              <div className={`w-20 shrink-0 flex items-center justify-center ${isReceive ? "bg-green-50" : "bg-red-50"}`}>
                <span className={`text-2xl font-bold tabular-nums ${isReceive ? "text-green-600" : "text-red-500"}`}>
                  {isReceive ? "+" : "-"}{totalQty}
                </span>
              </div>
              <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <TypeBadge type={t.transaction_type} />
                  <span className="text-[13px] text-gray-400 tabular-nums">#{t.id}</span>
                </div>
                <span className="text-[13px] font-medium text-gray-900 truncate">
                  {t.items.length} {t.items.length === 1 ? "item" : "items"}
                </span>
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="text-[13px] text-gray-400 truncate">{t.performed_by_username}</span>
                  <span className="text-[13px] text-gray-400 tabular-nums" suppressHydrationWarning>
                    {formatDateTime(t.transaction_date).split(" ")[0]}
                  </span>
                </div>
              </div>
            </button>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => onView(t)} className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" title="View"><Eye size={13} strokeWidth={2.5} /></button>
              <button onClick={(e) => onActionClick(e, t)} className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 transition-colors cursor-pointer" title="More"><ArrowRightLeft size={13} strokeWidth={2.5} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Tablet: 2-col cards ──
  const tabletGrid = (
    <div className="hidden sm:grid lg:hidden grid-cols-2 gap-3 pt-1">
      {displayed.map((t) => {
        const totalQty = t.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0);
        const isReceive = t.transaction_type === "Receive";
        return (
          <div key={t.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5">
            <button type="button" onClick={() => onView(t)} className="w-full text-left flex flex-col cursor-pointer p-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-400 tabular-nums">#{t.id}</span>
                <TypeBadge type={t.transaction_type} />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-4xl font-bold tabular-nums leading-none ${isReceive ? "text-green-600" : "text-red-500"}`}>
                    {isReceive ? "+" : "-"}{totalQty}
                  </span>
                  <span className="text-sm text-gray-400">qty</span>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                      {t.items.length} {t.items.length === 1 ? "Product" : "Products"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-gray-300" />
                      <span className="text-sm text-gray-400 tabular-nums" suppressHydrationWarning>
                        {formatDateTime(t.transaction_date).split(" ")[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={10} className="text-gray-300" />
                    <span className="text-sm text-gray-500 truncate">{t.performed_by_username}</span>
                  </div>
                </div>
              </div>
            </button>
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(t)} className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 shadow-sm transition-colors cursor-pointer" title="View"><Eye size={12} strokeWidth={2.5} /></button>
              {canEdit && <button onClick={() => onEdit(t)} className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 shadow-sm transition-colors cursor-pointer" title="Edit"><Edit2 size={12} strokeWidth={2.5} /></button>}
              <button onClick={() => onPrint(t)} className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-green-500 shadow-sm transition-colors cursor-pointer" title="Print"><Printer size={12} strokeWidth={2.5} /></button>
              {canDelete && <button onClick={() => onDelete(t)} className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 shadow-sm transition-colors cursor-pointer" title="Delete"><Trash2 size={12} strokeWidth={2.5} /></button>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Desktop: List table ──
  const desktopList = (
    <div className="hidden lg:block overflow-x-auto bg-white border border-slate-500 rounded-lg">
      <table className="w-full text-sm table-fixed">
        <thead className="bg-slate-50/50 border-b border-gray-600">
          <tr>
            <Header label="No" field="id" className="w-[11%]" ordering={ordering} handleSort={onSort} />
            <Header label="Products" field="items_count" className="w-[14%]" ordering={ordering} handleSort={onSort} />
            <Header label="Total Qty" field="total_qty" className="w-[12%]" ordering={ordering} handleSort={onSort} />
            <Header label="Type" field="transaction_type" className="w-[12%]" ordering={ordering} handleSort={onSort} />
            <Header label="Date" field="transaction_date" className="w-[19%]" ordering={ordering} handleSort={onSort} />
            <Header label="Actions" className="w-[14%]" ordering={ordering} />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {displayed.map((t) => {
            const totalQty = t.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0);
            const isReceive = t.transaction_type === "Receive";
            return (
              <tr key={t.id} className="group hover:bg-orange-50/60 transition-colors">
                <td className="px-4 py-2">
                  <span className="text-sm font-normal text-gray-600 tabular-nums group-hover:text-orange-600 transition-colors">{t.id}</span>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex text-sm font-normal text-gray-700  px-2.5 py-0.5 ">
                    {t.items.length} {t.items.length === 1 ? "Item" : "Items"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-sm font-medium tabular-nums transition-colors ${isReceive ? "text-green-600" : "text-red-500"}`}>
                    {isReceive ? "+" : "-"}{totalQty.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <TypeBadge type={t.transaction_type} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap" suppressHydrationWarning>
                  <span className="text-sm font-normal text-gray-700 tabular-nums">{formatDateTime(t.transaction_date)}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(t)} className="p-1.5 text-slate-800 hover:text-blue-500 hover:bg-blue-50 rounded transition-all cursor-pointer" title="View Details">
                      <Eye size={16} strokeWidth={2.5} />
                    </button>
                    {canEdit && (
                      <button onClick={() => onEdit(t)} className="p-1.5 text-slate-800 hover:text-orange-500 hover:bg-orange-50 rounded transition-all cursor-pointer" title="Edit">
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                    )}
                    <button onClick={() => onPrint(t)} className="p-1.5 text-slate-800 hover:text-green-500 hover:bg-green-50 rounded transition-all cursor-pointer" title="Print PDF">
                      <Printer size={16} strokeWidth={2.5} />
                    </button>
                    {canDelete && (
                      <button onClick={() => onDelete(t)} className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer" title="Delete">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
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

export default TransactionsTable;
