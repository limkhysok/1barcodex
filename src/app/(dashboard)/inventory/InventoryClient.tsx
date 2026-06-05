"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import type { InventoryRecord, InventoryPayload, InventoryStats } from "@/src/types/inventory.types";
import { getInventory, createInventory, updateInventory, deleteInventory, getInventoryStats } from "@/src/services/inventory.service";
import { getProducts } from "@/src/services/product.service";
import type { PaginatedProducts } from "@/src/types/api.types";

import { StatsOverview } from "./_components/StatsOverview";
import { InventoryTable } from "./_components/InventoryTable";
import { InventoryToolbar } from "./_components/InventoryToolbar";
import { InventoryModal } from "./_components/InventoryModal";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";
import { InventoryHeader } from "./_components/InventoryHeader";
import { InventoryDetailModal } from "./_components/InventoryDetailModal";
import * as XLSX from "xlsx";
import { toast } from "sonner";


const emptyForm: InventoryPayload = {
  product: 0,
  site: "",
  location: "",
  quantity_on_hand: 0,
};

function validateInventoryForm(form: InventoryPayload): string {
  if (!form.product || form.product <= 0) return "Please select a product.";
  if (!form.site.trim()) return "Site is required.";
  if (form.quantity_on_hand < 0) return "Quantity on hand cannot be negative.";
  return "";
}

export default function InventoryClient() {
  const { role } = useAuth();
  const canEdit = role === "boss" || role === "superadmin";
  const canDelete = role === "superadmin";

  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [paginatedProducts, setPaginatedProducts] = useState<PaginatedProducts>({ count: 0, next: null, previous: null, results: [] });
  const products = paginatedProducts.results;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  // -- Filter / sort state --
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "No" | "LOW" | "no_stock"
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string>("-updated_at");



  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) setFiltersOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -- Create / edit modal state --
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryRecord | null>(null);
  const [form, setForm] = useState<InventoryPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<InventoryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // -- View detail state --
  const [detailTarget, setDetailTarget] = useState<InventoryRecord | null>(null);

  // -- Export dropdown state --
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -- Fetch logic --
  const fetchInventory = useCallback((nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");

    getInventory({ ordering: ordering || undefined, site: siteFilter || undefined, reorder_status: statusFilter || undefined, page: nextPage })
      .then((data) => {
        setRecords((prev) => append ? [...prev, ...data.results] : data.results);
        setHasMore(data.next !== null);
        setPage(nextPage);
      })
      .catch(() => setError("Failed to load inventory."))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }, [ordering, siteFilter, statusFilter]);

  // Fetch products for the create/edit modal on mount
  useEffect(() => {
    getProducts().then(setPaginatedProducts).catch(() => {});
  }, []);

  // Initial load is immediate; subsequent filter changes are debounced
  const initialFetchDone = useRef(false);
  useEffect(() => {
    const delay = initialFetchDone.current ? 300 : 0;
    initialFetchDone.current = true;
    const t = setTimeout(() => fetchInventory(1, false), delay);
    return () => clearTimeout(t);
  }, [fetchInventory]);

  // Infinite scroll: load next page when sentinel enters viewport
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchInventory(page + 1, true);
        }
      },
      { rootMargin: "200px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchInventory]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(record: InventoryRecord) {
    setEditing(record);
    setForm({
      product: record.product,
      site: record.site,
      location: record.location,
      quantity_on_hand: record.quantity_on_hand,
    });
    setFormError("");
    setModalOpen(true);
  }

  function openView(r: InventoryRecord) {
    setDetailTarget(r);
  }

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    const validationError = validateInventoryForm(form);
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateInventory(editing.id, form);
        toast.success("Record Updated", { description: "Inventory record has been saved." });
      } else {
        await createInventory(form);
        toast.success("Record Created", { description: "New inventory record has been added." });
      }
      setModalOpen(false);
      fetchInventory(1, false);
      fetchStats();
      getProducts().then(setPaginatedProducts).catch(() => { });
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 409) {
        setFormError("AN INVENTORY RECORD FOR THIS PRODUCT, SITE, AND LOCATION ALREADY EXISTS.");
      } else {
        setFormError("FAILED TO SAVE. PLEASE VERIFY INPUTS");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInventory(deleteTarget.id);
      setDeleteTarget(null);
      fetchInventory(1, false);
      fetchStats();
      toast.success("Record Deleted", { description: "Inventory record has been removed." });
    } catch {
      toast.error("Delete Failed", { description: "Failed to delete record. Please try again." });
    } finally {
      setDeleting(false);
    }
  }

  function handleExport(mode: "no_stock" | "low" | "good" | "all") {
    setExportOpen(false);

    let list = records;
    if (mode === "no_stock") list = records.filter(r => r.quantity_on_hand === 0);
    else if (mode === "low") list = records.filter(r => r.quantity_on_hand > 0 && r.reorder_status === "LOW");
    else if (mode === "good") list = records.filter(r => r.quantity_on_hand > 0 && r.reorder_status === "No");

    if (list.length === 0) {
      setError("NO RECORDS FOUND TO EXPORT");
      return;
    }

    function getStatus(r: typeof records[number]) {
      if (r.quantity_on_hand === 0) return "NO STOCK";
      if (r.reorder_status === "LOW") return "LOW";
      return "GOOD";
    }

    const data = list.map(r => ({
      "Product ID": r.id || 0,
      "Product Name": r.product_details?.product_name || "N/A",
      "Barcode": r.product_details?.barcode || "N/A",
      "Site": r.site || "N/A",
      "Location": r.location || "N/A",
      "Reorder Level": r.product_details?.reorder_level ?? 0,
      "Quantity": r.quantity_on_hand ?? 0,
      "Status": getStatus(r),
      "Report Date": new Date().toLocaleDateString()
    }));

    const sheetNames = { no_stock: "No Stock Report", low: "Low Stock Report", good: "Good Stock Report", all: "Inventory Snapshot" };
    const fileNames = { no_stock: "NoStock", low: "LowStock", good: "GoodStock", all: "Inventory_Full" };
    const today = new Date().toISOString().split('T')[0];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetNames[mode]);

    type ExportRow = (typeof data)[number];
    const keys = Object.keys(data[0]) as (keyof ExportRow)[];
    const maxWidths = keys.map((key) =>
      Math.max(key.length, ...data.map((row) => String(row[key]).length))
    );
    ws['!cols'] = maxWidths.map((w) => ({ wch: w + 5 }));

    XLSX.writeFile(wb, `${fileNames[mode]}_Report_${today}.xlsx`);
  }

  const siteOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.site))).sort((a, b) => a.localeCompare(b)),
    [records]
  );

  // -- Client-side Filtering & Sorting Logic --
  const displayed = useMemo(() => {
    let list = [...records];

    // 1. Search (Name/Barcode)
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(r =>
        (r.product_details?.product_name || "").toLowerCase().includes(s) ||
        (r.product_details?.barcode || "").toLowerCase().includes(s)
      );
    }

    // Sorting
    if (ordering) {
      const isDesc = ordering.startsWith("-");
      const field = isDesc ? ordering.substring(1) : ordering;

      list.sort((a: InventoryRecord, b: InventoryRecord) => {
        let valA: string | number, valB: string | number;

        if (field === "product_name") {
          valA = (a.product_details?.product_name || "").toLowerCase();
          valB = (b.product_details?.product_name || "").toLowerCase();
        } else if (field === "updated_at") {
          valA = new Date(a.updated_at).getTime();
          valB = new Date(b.updated_at).getTime();
        } else {
          valA = a[field as keyof InventoryRecord] as string | number;
          valB = b[field as keyof InventoryRecord] as string | number;
        }

        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return list;
  }, [records, search, ordering]);

  // Stats fetched directly from the database
  const [dbStats, setDbStats] = useState<InventoryStats | null>(null);

  const fetchStats = useCallback(() => {
    getInventoryStats().then((data) => { if (data) setDbStats(data); }).catch(() => {});
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const stats = useMemo(() => ({
    total: dbStats?.total_records ?? 0,
    totalQty: dbStats?.total_quantity_on_hand ?? 0,
    needsReorder: dbStats?.needs_reorder ?? 0,
  }), [dbStats]);

  function handleSort(colLabel: string, dir?: string) {
    const orderingFields: Record<string, string> = {
      'No': 'id',
      'Product': 'product_name',
      'Barcode': 'barcode',
      'Site': 'site',
      'Location': 'location',
      'Quantity': 'quantity_on_hand',
      'Status': 'reorder_status',
      'Created': 'created_at',
    };
    const field = orderingFields[colLabel];
    if (!field) return;

    if (dir !== undefined) {
      if (dir === "") setOrdering("");
      else setOrdering((dir === "desc" ? "-" : "") + field);
      return;
    }

    // Toggle logic for table headers (direct click)
    let newOrdering = field;
    if (ordering === field) newOrdering = '-' + field;
    else if (ordering === '-' + field) newOrdering = "";
    setOrdering(newOrdering);
  }

  return (
    <div className="px-4 py-5 sm:px-5 sm:py-5 space-y-3">
      <InventoryHeader
        onNew={openCreate}
        canEdit={canEdit}
        exportOpen={exportOpen}
        setExportOpen={setExportOpen}
        exportRef={exportRef}
        onExport={handleExport}
      />

      {/* Stats Section */}
      <StatsOverview stats={stats} />

      {/* Toolbar Section */}
      <InventoryToolbar
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
        siteOptions={siteOptions}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
search={search}
        setSearch={setSearch}
        setOrdering={setOrdering}
        totalResults={stats.total}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filtersRef={filtersRef}
      />

      {/* Table Section */}
      <div className="overflow-hidden bg-white">
        <InventoryTable
          loading={loading}
          error={error}
          displayed={displayed}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onView={openView}
          canEdit={canEdit}
          canDelete={canDelete}
          ordering={ordering}
          onSort={handleSort}
        />
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <span className="text-xs text-gray-400 animate-pulse">Loading more records...</span>
        </div>
      )}
      {!hasMore && records.length > 0 && !loading && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-gray-300">All {records.length} records loaded</span>
        </div>
      )}

      {/* Modals */}
      <InventoryDetailModal
        open={!!detailTarget}
        record={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <InventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        form={form}
        setForm={setForm}
        saving={saving}
        formError={formError}
        onSave={handleSave}
        products={products}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}

