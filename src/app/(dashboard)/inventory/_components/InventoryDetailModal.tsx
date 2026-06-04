"use client";

import React from "react";
import Image from "next/image";
import type { InventoryRecord } from "@/src/types/inventory.types";
import { Package } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface InventoryDetailModalProps {
  open: boolean;
  record: InventoryRecord | null;
  onClose: () => void;
}

function Row({ label, value, labelClassName, valueClassName }: Readonly<{
  label: string;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}>) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className={`text-[13px] font-medium w-36 shrink-0 pt-0.5 ${labelClassName ?? "text-gray-800"}`}>{label}</span>
      <span className={`text-[13px] font-semibold break-all ${valueClassName ?? "text-gray-800"}`}>{value}</span>
    </div>
  );
}

export function InventoryDetailModal({ open, record, onClose }: Readonly<InventoryDetailModalProps>) {
  if (!open || !record) return null;

  const recordPic = record.product_details.product_picture;
  let imageUrl: string | null = null;
  if (recordPic) {
    imageUrl = recordPic.startsWith("http") ? recordPic : `${BASE_URL}${recordPic}`;
  }

  const updatedAt = new Date(record.updated_at).toLocaleString();

  const isLow = record.reorder_status === "LOW";
  const isOut = record.quantity_on_hand === 0;

  let statusLabel = "Good Stock";
  let statusColor = "text-green-600 bg-green-50 border-green-100";
  let statusDot = "bg-green-500";
  if (isOut) {
    statusLabel = "No Stock";
    statusColor = "text-red-500 bg-red-50 border-red-100";
    statusDot = "bg-red-500";
  } else if (isLow) {
    statusLabel = "Low Stock";
    statusColor = "text-yellow-600 bg-yellow-50 border-yellow-100";
    statusDot = "bg-yellow-500";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-400 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <Package size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                {record.product_details.product_name}
              </h2>
              <p className="text-[13px] text-gray-400">Inventory detail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="px-5 pt-4">
          {imageUrl ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <Image src={imageUrl} alt={record.product_details.product_name} fill className="object-contain" />
            </div>
          ) : (
            <div className="w-full h-40 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Package size={18} className="text-gray-300" />
              </div>
              <span className="text-[13px] font-medium text-gray-300">No image</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-5 py-4">
          <Row label="Record ID" value={`${record.id}`} />
          <Row label="Barcode" value={record.product_details.barcode || "N/A"} />
          <Row label="Category" value={record.product_details.category} />
          <Row label="Site" value={record.site} />
          <Row label="Zone / Location" value={record.location} />
          <Row label="Quantity on Hand" value={
            <span className="text-[14px] font-bold text-orange-500 tabular-nums">
              {record.quantity_on_hand.toLocaleString()}
            </span>
          } />
          <Row label="Status" value={
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
              {statusLabel}
            </span>
          } />
          <Row label="Last Update" value={updatedAt} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
