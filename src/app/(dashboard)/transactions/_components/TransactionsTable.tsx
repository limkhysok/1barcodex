"use client";

import type { Transaction } from "@/src/types/transaction.types";
import { Eye, Edit2, Printer, Trash2, ArrowRightLeft } from "lucide-react";

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
}

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
}: Readonly<TransactionsTableProps>) {

  if (loading && displayed.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#FA4900", borderTopColor: "transparent" }}
        />
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

  // ── Mobile: 1-col horizontal cards ──
  const mobileRows = (
    <div className="sm:hidden grid grid-cols-1 gap-3 pt-1">
      {displayed.map((t) => {
        const totalQty = t.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0);
        const isReceive = t.transaction_type === "Receive";
        return (
          <div key={t.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">
            <button type="button" onClick={() => onView(t)} className="w-full text-left flex flex-row cursor-pointer">
              <div className={`w-28 shrink-0 flex items-center justify-center overflow-hidden transition-colors relative ${isReceive ? "bg-green-50 group-hover:bg-green-100" : "bg-red-50 group-hover:bg-red-100"}`}>
                <span className={`text-2xl font-bold tabular-nums ${isReceive ? "text-green-600" : "text-red-500"}`}>
                  {isReceive ? "+" : "-"}{totalQty}
                </span>
                <span className="absolute top-1.5 left-1.5 text-[13px] font-bold text-gray-500 tabular-nums bg-white/90 px-1.5 py-0.5 rounded-md border border-gray-200">#{t.id}</span>
              </div>
              <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col gap-1.5">
                <span className={`text-[13px] font-semibold px-1.5 py-0.5 rounded-full border self-start ${isReceive ? "text-green-600 bg-green-50 border-green-100" : "text-red-500 bg-red-50 border-red-100"}`}>
                  {t.transaction_type}
                </span>
                <span className="text-[13px] font-black text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">
                  {t.items.length} {t.items.length === 1 ? "Item" : "Items"}
                </span>
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                  <span className="text-[13px] text-gray-400 truncate" suppressHydrationWarning>
                    {formatDateTime(t.transaction_date).split(" ")[0]}
                  </span>
                  <span className="text-[13px] text-gray-400 truncate ml-1">{t.performed_by_username}</span>
                </div>
              </div>
            </button>
            <div className="absolute top-0 left-0 w-28 h-full bg-black/25 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center justify-center gap-1.5">
              <button type="button" onClick={() => onView(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" title="View"><Eye size={13} strokeWidth={2.5} /></button>
              {canEdit && <button type="button" onClick={() => onEdit(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 transition-colors cursor-pointer" title="Edit"><Edit2 size={13} strokeWidth={2.5} /></button>}
              <button type="button" onClick={() => onPrint(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-green-500 transition-colors cursor-pointer" title="Print"><Printer size={13} strokeWidth={2.5} /></button>
              {canDelete && <button type="button" onClick={() => onDelete(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 transition-colors cursor-pointer" title="Delete"><Trash2 size={13} strokeWidth={2.5} /></button>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Tablet: 4-col vertical cards ──
  const tabletGrid = (
    <div className="hidden sm:grid lg:hidden grid-cols-4 gap-3 pt-1">
      {displayed.map((t) => {
        const totalQty = t.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0);
        const isReceive = t.transaction_type === "Receive";
        return (
          <div key={t.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5">
            <button type="button" onClick={() => onView(t)} className="w-full text-left flex flex-col cursor-pointer">
              <div className={`h-24 w-full flex items-center justify-center overflow-hidden transition-colors relative ${isReceive ? "bg-green-50 group-hover:bg-green-100" : "bg-red-50 group-hover:bg-red-100"}`}>
                <span className={`text-3xl font-bold tabular-nums ${isReceive ? "text-green-600" : "text-red-500"}`}>
                  {isReceive ? "+" : "-"}{totalQty}
                </span>
                <span className="absolute top-1.5 left-1.5 text-[13px] font-bold text-gray-500 tabular-nums bg-white/90 px-1.5 py-0.5 rounded-md border border-gray-200">#{t.id}</span>
              </div>
              <div className="px-2.5 py-2 flex flex-col gap-1.5">
                <span className={`text-[13px] font-semibold px-1.5 py-0.5 rounded-full border self-start ${isReceive ? "text-green-600 bg-green-50 border-green-100" : "text-red-500 bg-red-50 border-red-100"}`}>
                  {t.transaction_type}
                </span>
                <span className="text-[13px] font-black text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">
                  {t.items.length} {t.items.length === 1 ? "Item" : "Items"}
                </span>
                <span className="text-[13px] font-mono text-gray-400 truncate" suppressHydrationWarning>
                  {formatDateTime(t.transaction_date).split(" ")[0]}
                </span>
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                  <span className="text-[13px] text-gray-400 truncate">{t.performed_by_username}</span>
                </div>
              </div>
            </button>
            <div className="absolute top-0 inset-x-0 h-24 bg-black/25 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center justify-center gap-1.5">
              <button type="button" onClick={() => onView(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" title="View"><Eye size={12} strokeWidth={2.5} /></button>
              {canEdit && <button type="button" onClick={() => onEdit(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-500 transition-colors cursor-pointer" title="Edit"><Edit2 size={12} strokeWidth={2.5} /></button>}
              <button type="button" onClick={() => onPrint(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-green-500 transition-colors cursor-pointer" title="Print"><Printer size={12} strokeWidth={2.5} /></button>
              {canDelete && <button type="button" onClick={() => onDelete(t)} className="pointer-events-auto p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-500 transition-colors cursor-pointer" title="Delete"><Trash2 size={12} strokeWidth={2.5} /></button>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Desktop (≥ lg): table list ──
  const desktopList = (
    <div className="hidden lg:block overflow-x-auto bg-white border border-slate-500 rounded-lg">
      <table className="w-full text-sm table-fixed">
        <thead className="bg-slate-50/50 border-b border-gray-600">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 w-[11%]">No</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 w-[14%]">Products</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 w-[12%]">Total Quantity</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 w-[12%]">Type</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 w-[19%]">Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 w-[14%]">Actions</th>
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
                  <span className="text-sm font-normal text-gray-700">
                    {t.items.length} {t.items.length === 1 ? "Item" : "Items"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-sm font-medium tabular-nums ${isReceive ? "text-green-600" : "text-red-500"}`}>
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
                    <button onClick={() => onView(t)} className="p-1.5 text-slate-800 hover:text-blue-500 hover:bg-blue-50 rounded transition-all cursor-pointer" title="View Details"><Eye size={16} strokeWidth={2.5} /></button>
                    {canEdit && <button onClick={() => onEdit(t)} className="p-1.5 text-slate-800 hover:text-orange-500 hover:bg-orange-50 rounded transition-all cursor-pointer" title="Edit"><Edit2 size={16} strokeWidth={2.5} /></button>}
                    <button onClick={() => onPrint(t)} className="p-1.5 text-slate-800 hover:text-green-500 hover:bg-green-50 rounded transition-all cursor-pointer" title="Print PDF"><Printer size={16} strokeWidth={2.5} /></button>
                    {canDelete && <button onClick={() => onDelete(t)} className="p-1.5 text-slate-800 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer" title="Delete"><Trash2 size={16} strokeWidth={2.5} /></button>}
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
