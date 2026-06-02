"use client";

import type { Product } from "@/src/types/product.types";
import { X, Package, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ProductViewModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit?: (p: Product) => void;
  onDelete?: (p: Product) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function Row({ label, value }: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[13px] font-medium text-gray-600 w-28 shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-gray-800 break-all">{value}</span>
    </div>
  );
}

export function ProductViewModal({ product, onClose, onEdit, onDelete, canEdit, canDelete }: Readonly<ProductViewModalProps>) {
  if (!product) return null;

  const rawPicture = product.product_picture;
  const resolvedPicture = rawPicture?.startsWith("http") ? rawPicture : `${BASE_URL}${rawPicture}`;
  const imageUrl = rawPicture ? resolvedPicture : null;

  const createdAt = new Date(product.created_at).toLocaleDateString("en-GB");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <Package size={17} strokeWidth={1.8} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{product.product_name}</h2>
              <p className="text-[13px] text-gray-400">#{product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">

            {/* Image — full width on mobile, left panel on sm+ */}
            <div className="sm:row-span-2 sm:border-r border-gray-100">
              {imageUrl ? (
                <div className="relative w-full h-48 sm:h-full sm:min-h-52 bg-gray-50">
                  <Image src={imageUrl} alt={product.product_name} fill className="object-contain" unoptimized />
                </div>
              ) : (
                <div className="w-full h-48 sm:h-full sm:min-h-52 bg-gray-50 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Package size={20} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] text-gray-300">No Image</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="px-5 py-3">
              <span className="inline-flex text-[13px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100 mb-3">
                {product.category}
              </span>
              <Row label="Barcode" value={<span className="text-[13px] font-sm ">{product.barcode}</span>} />
              <Row label="Supplier" value={product.supplier} />
              <Row label="Cost / Unit" value={`$${Number(product.cost_per_unit).toFixed(2)}`} />
              <Row label="Reorder Level" value={product.reorder_level} />
              <Row label="Created" value={createdAt} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 bg-white shrink-0 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => { onEdit(product); onClose(); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 active:scale-[0.97] transition cursor-pointer"
              >
                <Edit2 size={13} strokeWidth={2.5} />
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => { onDelete(product); onClose(); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.97] transition cursor-pointer"
              >
                <Trash2 size={13} strokeWidth={2.5} />
                Delete
              </button>
            )}
          </div>
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
