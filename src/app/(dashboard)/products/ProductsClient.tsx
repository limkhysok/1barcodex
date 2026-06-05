"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { useAuth } from "@/src/context/AuthContext";
import type { Product, ProductPayload } from "@/src/types/product.types";
import { getProducts, getProductStats, createProduct, updateProduct, deleteProduct } from "@/src/services/product.service";
import type { ProductFilters } from "@/src/services/product.service";
import { type ApiError, getFieldError } from "@/src/types/error.types";

// Components
import { StatsOverview } from "./_components/StatsOverview";
import { ProductHeader } from "./_components/ProductHeader";
import { ProductsTable, type SortDir } from "./_components/ProductsTable";
import { ProductModal } from "./_components/ProductModal";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";
import { ProductToolbar } from "./_components/ProductToolbar";
import { ProductViewModal } from "./_components/ProductViewModal";

const REORDER_PRESETS = new Set([5, 10, 15, 20]);

function getSortParam(field: string, dir: SortDir): string | undefined {
  if (!field || !dir) return undefined;
  return dir === "desc" ? `-${field}` : field;
}

function validateProductForm(form: ProductPayload): string {
  if (!form.product_name.trim()) return "Product name is required.";
  if (!form.barcode.trim()) return "Barcode is required.";
  if (!form.category) return "Category is required.";
  if (!form.supplier.trim()) return "Supplier is required.";
  if (form.cost_per_unit <= 0) return "Cost per unit must be greater than 0.";
  if (form.reorder_level < 1) return "Reorder level must be at least 1.";
  return "";
}


const emptyForm: ProductPayload = {
  barcode: "",
  product_name: "",
  category: "",
  cost_per_unit: 1,
  reorder_level: 1,
  supplier: "",
};

export default function ProductsClient() {
  const { role } = useAuth();
  const canEdit = role === "boss" || role === "superadmin";
  const canDelete = role === "superadmin";

  const { data: productStats } = useSWR("product-stats", () => getProductStats());

  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [reorderCustom, setReorderCustom] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [viewTarget, setViewTarget] = useState<Product | null>(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [sortField, setSortField] = useState<string>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  // Accumulate all ever-seen categories/suppliers so the dropdown never collapses when filters are active
  const allCategoriesRef = useRef<Set<string>>(new Set<string>());
  const allSuppliersRef = useRef<Set<string>>(new Set<string>());
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const buildFilters = useCallback((nextPage = 1): ProductFilters => {
    const ordering = getSortParam(sortField, sortDir);
    return {
      search: search.trim() || undefined,
      category: categoryFilter || undefined,
      supplier: supplierFilter || undefined,
      ordering,
      page: nextPage,
    };
  }, [search, categoryFilter, supplierFilter, sortField, sortDir]);

  const mergeProducts = useCallback((prev: Product[], next: Product[], append: boolean): Product[] => {
    if (!append) return next;
    const seen = new Set(prev.map((p) => p.id));
    return [...prev, ...next.filter((p) => !seen.has(p.id))];
  }, []);

  const fetchProducts = useCallback((nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    getProducts(undefined, buildFilters(nextPage))
      .then((data) => {
        setProducts((prev) => mergeProducts(prev, data.results, append));
        setHasMore(data.next !== null);
        setPage(nextPage);
        let catChanged = false;
        let supChanged = false;
        data.results.forEach(p => {
          if (!allCategoriesRef.current.has(p.category)) { allCategoriesRef.current.add(p.category); catChanged = true; }
          if (!allSuppliersRef.current.has(p.supplier)) { allSuppliersRef.current.add(p.supplier); supChanged = true; }
        });
        if (catChanged) setCategories(Array.from(allCategoriesRef.current).sort((a, b) => a.localeCompare(b)));
        if (supChanged) setSuppliers(Array.from(allSuppliersRef.current).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, [buildFilters, mergeProducts]);

  // Initial load is immediate; subsequent filter changes are debounced
  const initialFetchDone = useRef(false);
  useEffect(() => {
    const delay = initialFetchDone.current ? 300 : 0;
    initialFetchDone.current = true;
    const t = setTimeout(() => fetchProducts(1, false), delay);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchProducts(page + 1, true);
        }
      },
      { rootMargin: "200px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) setFiltersOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayed = products; // filters applied server-side; products is the accumulated list

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setReorderCustom(false);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    const isCustom = !REORDER_PRESETS.has(product.reorder_level);
    setReorderCustom(isCustom);
    setForm({
      barcode: product.barcode,
      product_name: product.product_name,
      category: product.category,
      cost_per_unit: Number.parseFloat(product.cost_per_unit),
      reorder_level: product.reorder_level,
      supplier: product.supplier,
      product_picture: product.product_picture,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    const validationError = validateProductForm(form);
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        if (editing.id === undefined || editing.id === null) {
          setFormError("Cannot update: Product ID is missing or invalid.");
          setSaving(false);
          return;
        }
        await updateProduct(editing.id, form);
        toast.success("Product Updated", {
          description: `${form.product_name} has been saved successfully.`,
        });
      } else {
        await createProduct(form);
        toast.success("Product Created", {
          description: `${form.product_name} has been added to your catalog.`,
        });
      }
      setSaving(false);
      setModalOpen(false);
      fetchProducts(1, false);
      mutate("product-stats");
    } catch (err: unknown) {
      setSaving(false);
      const apiErr = err as ApiError;
      const data = apiErr?.response?.data;
      const status = apiErr?.response?.status;
      if (status === 409) {
        const msg = (data?.detail as string | undefined) ?? "A product with this barcode already exists.";
        setFormError(msg);
        toast.error("Duplicate Barcode", { description: msg });
      } else if (status === 404) {
        const msg = (data?.detail as string | undefined) ?? "This product no longer exists. Please refresh the page.";
        setFormError(msg);
        toast.error("Product Not Found", { description: msg });
      } else if (status === 400 && data) {
        const msg = getFieldError(data);
        setFormError(msg);
        toast.error("Validation Error", { description: msg });
      } else if (apiErr?.code === "ECONNABORTED" || !apiErr?.response) {
        setFormError("Request timed out. Please try again.");
        toast.error("Connection Error", { description: "The server took too long to respond. Please try again." });
      } else {
        setFormError("Failed to save. Please check your inputs.");
        toast.error("Save Failed", { description: "Please check your inputs and try again." });
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product Deleted", {
        description: `${deleteTarget.product_name} has been permanently removed.`,
      });
      setDeleteTarget(null);
      setDeleting(false);
      fetchProducts(1, false);
      mutate("product-stats");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const data = apiErr?.response?.data;
      const status = apiErr?.response?.status;
      if (status === 404) {
        setDeleteTarget(null);
        fetchProducts(1, false);
        mutate("product-stats");
      } else if (status === 409) {
        toast.error("Cannot Delete Product", {
          description: (data?.detail as string | undefined) ?? "This product has linked transactions and cannot be removed.",
        });
      } else {
        toast.error("Delete Failed", { description: "Something went wrong. Please try again." });
      }
      setDeleting(false);
    }
  }

  return (
    <div className="px-4 py-5 sm:px-5 sm:py-5 space-y-3">

      <ProductHeader onNew={openCreate} />

      {/* ── Stats: Category Overview ── */}
      <StatsOverview stats={productStats ?? null} products={products} />

      {/* ── Toolbar: Advanced Filters ── */}
      <ProductToolbar
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        sortField={sortField}
        setSortField={setSortField}
        sortDir={sortDir}
        setSortDir={setSortDir}
        search={search}
        setSearch={setSearch}
        categories={categories}
        suppliers={suppliers}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filtersRef={filtersRef}
      />

      {/* Table */}
      <div className="overflow-hidden ">
        <ProductsTable
          loading={loading}
          error={error}
          displayed={displayed}
          products={products}
          sortField={sortField}
          setSortField={setSortField}
          sortDir={sortDir}
          setSortDir={setSortDir}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onView={setViewTarget}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <span className="text-xs text-gray-400 animate-pulse">Loading more products...</span>
        </div>
      )}
      {!hasMore && products.length > 0 && !loading && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-gray-300">All {products.length} products loaded</span>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        form={form}
        setForm={setForm}
        reorderCustom={reorderCustom}
        setReorderCustom={setReorderCustom}
        saving={saving}
        formError={formError}
        onSave={handleSave}
      />

      {/* View Modal */}
      <ProductViewModal
        product={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
