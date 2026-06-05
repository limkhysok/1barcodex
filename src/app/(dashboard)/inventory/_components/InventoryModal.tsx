"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { InventoryRecord, InventoryPayload } from "@/src/types/inventory.types";
import type { Product } from "@/src/types/product.types";
import { Package, LayoutGrid, Plus, Check } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-600 text-[13px] text-gray-800 placeholder:text-gray-700 outline-none focus:ring-1 focus:border-orange-400 focus:bg-white transition";

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  optional,
}: Readonly<{
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
}>) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-gray-800">
          {label}
        </label>
        <span className={`text-[13px] font-medium px-2 py-0.5 rounded-full ${optional ? "text-gray-300 bg-gray-50" : "text-orange-500 bg-orange-50"}`}>
          {optional ? "Optional" : "Required"}
        </span>
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={!optional && required}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

const PRESET_SITES = ["Store A", "Store B", "Store C", "Store D"];

function SiteCombobox({
  value,
  onChange,
}: Readonly<{ value: string; onChange: (v: string) => void }>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setInput(value); }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = PRESET_SITES.filter((s) =>
    s.toLowerCase().includes(input.trim().toLowerCase())
  );
  const showCustom = input.trim() !== "" && !PRESET_SITES.includes(input.trim());

  function select(site: string) {
    setInput(site);
    onChange(site);
    setOpen(false);
  }

  return (
    <div className={`space-y-1.5 ${open ? "relative z-60" : "relative z-0"}`} ref={ref}>
      <div className="flex items-center justify-between">
        <label htmlFor="site" className="text-[13px] font-medium text-gray-800">
          Site
        </label>
        <span className="text-[13px] font-medium px-2 py-0.5 rounded-full text-orange-500 bg-orange-50">
          Required
        </span>
      </div>
      <div className="relative">
        <input
          id="site"
          type="text"
          autoComplete="off"
          placeholder="Select or type a site…"
          value={input}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInput(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          className={inputCls}
        />
        {open && (filtered.length > 0 || showCustom) && (
          <ul className="absolute z-200 top-full mt-1.5 w-full bg-white border border-gray-400 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 divide-y divide-gray-100">
            {filtered.map((site) => {
              const active = value === site;
              return (
                <li key={site}>
                  <button
                    type="button"
                    onClick={() => select(site)}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between transition-all duration-150 ${
                      active ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"
                    }`}
                  >
                    <span className={`text-[13px] font-medium ${active ? "text-white" : "text-gray-700"}`}>
                      {site}
                    </span>
                    {active && <Check size={13} strokeWidth={3} className="text-white" />}
                  </button>
                </li>
              );
            })}
            {showCustom && (
              <li>
                <button
                  type="button"
                  onClick={() => select(input.trim())}
                  className="w-full text-left px-4 py-2 text-[13px] font-medium text-orange-500 hover:bg-orange-50 transition flex items-center gap-2"
                >
                  <Plus size={14} strokeWidth={3} />
                  Use &ldquo;{input.trim()}&rdquo;
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterableProductSelect({
  products,
  value,
  onChange,
}: Readonly<{
  products: Product[];
  value: number;
  onChange: (id: number) => void;
}>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [prevValue, setPrevValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.id === value);

  if (value !== prevValue) {
    setPrevValue(value);
    setSearch(selected ? `${selected.product_name} (${selected.barcode})` : "");
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch(selected ? `${selected.product_name} (${selected.barcode})` : "");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const selectedLabel = selected ? `${selected.product_name} (${selected.barcode})`.toLowerCase() : "";
    if (!q || q === selectedLabel) return products.slice(0, 50);
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [products, search, selected]);

  return (
    <div className={`space-y-1.5 ${open ? "relative z-60" : "relative z-0"}`} ref={ref}>
      <div className="flex items-center justify-between">
        <label htmlFor="product" className="text-[13px] font-medium text-gray-800">
          Product
        </label>
        <span className="text-[13px] font-medium px-2 py-0.5 rounded-full text-orange-500 bg-orange-50">
          Required
        </span>
      </div>
      <div className="relative">
        <input
          id="product"
          type="text"
          autoComplete="off"
          placeholder="Search/Scan by name or barcode…"
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className={`${inputCls} pr-10`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <LayoutGrid size={16} strokeWidth={2} />
        </div>
        {open && (
          <ul className="absolute z-100 top-full mt-1.5 w-full bg-white border border-gray-400 shadow-xl rounded-lg overflow-hidden max-h-52 overflow-y-auto no-scrollbar divide-y divide-gray-100">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-gray-400 text-center">No products found</li>
            )}
            {filtered.map((p) => {
              const active = value === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p.id);
                      setSearch(`${p.product_name} (${p.barcode})`);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-all duration-150 ${
                      active ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"
                    }`}
                  >
                    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${active ? "bg-white/20" : "bg-gray-50 border border-gray-100"}`}>
                      {p.product_picture ? (
                        <Image
                          src={`${BASE_URL}${p.product_picture}`}
                          alt={p.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package size={14} className={active ? "text-white/60" : "text-gray-300"} />
                      )}
                    </div>
                    <span className={`truncate text-[13px] font-medium ${active ? "text-white" : "text-gray-800"}`}>
                      {p.product_name}
                    </span>
                    <span className={`ml-auto font-mono text-[13px] text-left text-gray-800 shrink-0 ${active ? "text-white/70" : "text-gray-400"}`}>
                      {p.barcode}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export type InventoryModalProps = {
  open: boolean;
  onClose: () => void;
  editing: InventoryRecord | null;
  form: InventoryPayload;
  setForm: React.Dispatch<React.SetStateAction<InventoryPayload>>;
  saving: boolean;
  formError: string;
  onSave: (e: React.SyntheticEvent) => void;
  products: Product[];
};

export function InventoryModal({
  open,
  onClose,
  editing,
  form,
  setForm,
  saving,
  formError,
  onSave,
  products,
}: Readonly<InventoryModalProps>) {
  if (!open) return null;

  let saveLabel = "Create Record";
  if (saving) saveLabel = "Saving…";
  else if (editing) saveLabel = "Save Changes";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <button className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Close modal" />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-400 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <Package size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{editing ? "Edit Record" : "New Record"}</h2>
              <p className="text-[13px] text-gray-400">{editing ? "Update inventory details below" : "Fill in the inventory details below"}</p>
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

        {/* Form */}
        <form onSubmit={onSave} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/40 min-h-0 pb-32">

          <FilterableProductSelect
            products={products}
            value={form.product}
            onChange={(id) => setForm((f) => ({ ...f, product: id }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SiteCombobox
              value={form.site}
              onChange={(v) => setForm((f) => ({ ...f, site: v }))}
            />
            <Field
              label="Location"
              id="location"
              value={form.location}
              placeholder="A1-Shelf-5"
              optional
              onChange={(v) => setForm((f) => ({ ...f, location: v }))}
            />
          </div>

          <Field
            label="Quantity on Hand"
            id="quantity_on_hand"
            type="number"
            value={form.quantity_on_hand}
            onChange={(v) => setForm((f) => ({ ...f, quantity_on_hand: Number.parseInt(v) || 0 }))}
          />

          {(() => {
            const selectedProduct = products.find((p) => p.id === form.product);
            if (!selectedProduct) return null;
            const needsReorder = form.quantity_on_hand <= selectedProduct.reorder_level;
            return (
              <div className="grid grid-cols-[80px_1fr] gap-4 px-4 py-3.5 bg-orange-50/50 border border-orange-100 rounded-xl">
                <div className="relative w-20 h-20 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                  {selectedProduct.product_picture ? (
                    <Image
                      src={`${BASE_URL}${selectedProduct.product_picture}`}
                      alt={selectedProduct.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package size={24} className="text-gray-200" />
                  )}
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <p className="text-[11px] font-medium text-gray-400 mb-1 leading-none">Status Assessment</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                      needsReorder ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${needsReorder ? "bg-red-500" : "bg-green-500"}`} />
                      {needsReorder ? "Needs Reorder" : "Optimal Stock"}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">
                      Threshold: {selectedProduct.reorder_level} units
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {formError && (
            <p className="text-[13px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
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
