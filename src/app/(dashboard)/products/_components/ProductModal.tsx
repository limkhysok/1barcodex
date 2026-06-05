import React, { useState, useRef, useEffect } from "react";
import type { Product, ProductPayload } from "@/src/types/product.types";
import { ChevronDown, Check, Image as ImageIcon, X, Package } from "lucide-react";
import Image from "next/image";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-600 text-[13px] text-gray-800 placeholder:text-gray-700 outline-none focus:ring-1 focus:border-orange-400 focus:bg-white transition";

function Field({ label, id, type = "text", value, onChange, placeholder, disabled, optional }: Readonly<{
  label: string; id: string; type?: string;
  value: string | number; onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
  optional?: boolean;
}>) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
          {label}
          {disabled && <span className="font-normal text-gray-300">(locked)</span>}
        </label>
        <span className={`text-[13px] font-medium px-2 py-0.5 rounded-full ${optional ? "text-gray-300 bg-gray-50" : "text-orange-500 bg-orange-50"}`}>
          {optional ? "Optional" : "Required"}
        </span>
      </div>
      <input
        id={id} type={type} placeholder={placeholder} value={value} required={!disabled && !optional} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "focus:shadow-sm"}`}
      />
    </div>
  );
}

function ModalSelect({ label, value, options, onChange, placeholder, optional }: Readonly<{
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div
      className={`space-y-1.5 ${open ? "relative z-60" : "relative z-0"}`}
      ref={ref}
    >
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-gray-800">
          {label}
        </label>
        <span className={`text-[13px] font-medium px-2 py-0.5 rounded-full ${optional ? "text-gray-300 bg-gray-50" : "text-orange-500 bg-orange-50"}`}>
          {optional ? "Optional" : "Required"}
        </span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full px-3 py-2 rounded-lg border text-[13px] text-left flex items-center justify-between transition-all duration-200 ${open ? "border-orange-400 bg-white shadow-sm" : "border-gray-600 bg-white hover:border-gray-400"}`}
        >
          <span className={selected ? "text-gray-800 font-medium" : "text-gray-300"}>
            {selected ? selected.label : placeholder || "Select…"}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${open ? "rotate-180 text-orange-500" : "text-gray-400"}`}
            strokeWidth={2.5}
          />
        </button>

        {open && (
          <div className="absolute z-100 top-full left-0 right-0 mt-1.5 bg-white border border-gray-400 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <ul className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-gray-100">
              {options.map((o) => (
                <li key={String(o.value)}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(String(o.value));
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between transition-all duration-150 ${String(value) === String(o.value)
                        ? "bg-orange-500 text-white"
                        : "text-gray-700 hover:bg-orange-50"
                      }`}
                  >
                    <span className={`text-[13px] font-medium ${String(value) === String(o.value) ? "text-white" : "text-gray-700"}`}>
                      {o.label}
                    </span>
                    {String(value) === String(o.value) && (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function convertToSquareWebP(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new globalThis.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 600, 600);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" })),
        "image/webp",
        0.85
      );
    };
    img.src = objectUrl;
  });
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  editing: Product | null;
  form: ProductPayload;
  setForm: React.Dispatch<React.SetStateAction<ProductPayload>>;
  reorderCustom: boolean;
  setReorderCustom: (val: boolean) => void;
  saving: boolean;
  formError: string;
  onSave: (e: React.SyntheticEvent) => Promise<void>;
}

export function ProductModal({
  open,
  onClose,
  editing,
  form,
  setForm,
  reorderCustom,
  setReorderCustom,
  saving,
  formError,
  onSave,
}: Readonly<ProductModalProps>) {
  if (!open) return null;

  let saveLabel = "Add Product";
  if (saving) saveLabel = "Saving…";
  else if (editing) saveLabel = "Save Changes";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const converted = await convertToSquareWebP(file);
    setForm((f) => ({ ...f, product_picture: converted }));
  };

  const removePicture = () => {
    setForm((f) => ({ ...f, product_picture: "" }));
  };

  const currentPic = form.product_picture;

  let previewUrl: string | null = null;
  if (currentPic instanceof File) {
    previewUrl = URL.createObjectURL(currentPic);
  } else if (typeof currentPic === 'string' && currentPic !== "") {
    previewUrl = `${process.env.NEXT_PUBLIC_API_URL}${currentPic}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <button className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Close modal" />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-400 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{editing ? "Edit Product" : "New Product"}</h2>
              <p className="text-[13px] text-gray-400">{editing ? "Update product details below" : "Fill in the product details below"}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSave} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/40 min-h-0 pb-32">

          {/* Image + Name + Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Image — full width on mobile, spans 2 rows on sm+ */}
            <div className="sm:row-span-2 space-y-1.5">
              <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                <ImageIcon size={13} />
                Picture
                <span className="text-[13px] font-medium text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">Optional</span>
              </label>
              <div className="relative group w-full h-40 sm:h-[calc(100%-28px)] sm:min-h-27.5 rounded-xl border-2 border-dashed border-gray-400 bg-white flex items-center justify-center overflow-hidden transition-colors hover:border-orange-400">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={removePicture}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-300 px-2 text-center">
                    <Package size={28} strokeWidth={1} />
                    <span className="text-[13px]">Click to upload</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload picture" />
              </div>
            </div>

            {/* Product Name */}
            <Field label="Product Name" id="product_name" value={form.product_name} placeholder="Engine Oil Filter"
              onChange={(v) => setForm((f) => ({ ...f, product_name: v }))} />

            {/* Barcode */}
            <Field label="Barcode" id="barcode" value={form.barcode} placeholder="SN-ABC123"
              onChange={(v) => setForm((f) => ({ ...f, barcode: v }))} disabled={!!editing} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalSelect label="Category" value={form.category} placeholder="Select…"
              onChange={(v) => setForm((f) => ({ ...f, category: v }))}
              options={[
                { value: "Accessories", label: "Accessories" },
                { value: "Fasteners", label: "Fasteners" },
              ]} />
            <div className="space-y-1.5">
              <ModalSelect label="Reorder Level"
                value={reorderCustom ? "custom" : form.reorder_level} placeholder="Select…"
                onChange={(v) => {
                  if (v === "custom") {
                    setReorderCustom(true);
                    setForm((f) => ({ ...f, reorder_level: 0 }));
                  } else {
                    setReorderCustom(false);
                    setForm((f) => ({ ...f, reorder_level: Number.parseInt(v) }));
                  }
                }}
                options={[
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                  { value: 15, label: "15" },
                  { value: 20, label: "20" },
                  { value: "custom", label: "Custom…" },
                ]} />
              {reorderCustom && (
                <input type="number" min={1} placeholder="Enter value" required
                  value={form.reorder_level || ""}
                  onChange={(e) => setForm((f) => ({ ...f, reorder_level: Number.parseInt(e.target.value) || 0 }))}
                  className={`${inputCls} mt-1`} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Supplier" id="supplier" value={form.supplier} placeholder="CTK Supply Co."
              onChange={(v) => setForm((f) => ({ ...f, supplier: v }))} />
            <Field label="Cost / Unit ($)" id="cost_per_unit" type="number" value={form.cost_per_unit} placeholder="12.50"
              onChange={(v) => setForm((f) => ({ ...f, cost_per_unit: Number.parseFloat(v) || 0 }))} />
          </div>

          {formError && (
            <p className="text-[13px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-xl text-[13px] font-medium text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.97] transition disabled:opacity-60"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
