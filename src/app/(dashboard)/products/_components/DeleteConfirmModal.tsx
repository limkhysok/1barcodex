"use client";

import type { Product } from "@/src/types/product.types";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  target: Product | null;
  onClose: () => void;
  onDelete: () => Promise<void>;
  deleting: boolean;
}

export function DeleteConfirmModal({
  target,
  onClose,
  onDelete,
  deleting,
}: Readonly<DeleteConfirmModalProps>) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <button className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Close modal" />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden">

        <div className="px-5 py-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={17} strokeWidth={1.8} className="text-red-500" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900">Delete Product</p>
            <p className="text-[13px] text-gray-500 mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">{target.product_name}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-3 bg-white flex justify-end gap-2">
          <button onClick={onClose} disabled={deleting}
            className="px-5 py-2 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition disabled:opacity-60 cursor-pointer">
            Cancel
          </button>
          <button onClick={onDelete} disabled={deleting}
            className="px-5 py-2 rounded-xl text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 active:scale-[0.97] transition disabled:opacity-60 cursor-pointer shadow-md shadow-red-500/20">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
