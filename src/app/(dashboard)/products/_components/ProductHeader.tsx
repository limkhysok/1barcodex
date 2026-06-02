"use client";

interface ProductHeaderProps {
  onNew: () => void;
}

export function ProductHeader({ onNew }: Readonly<ProductHeaderProps>) {
  return (
    <>
      {/* ── MOBILE (< sm) ── */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-normal text-black-950 ">Product</h1>
          <p className="text-xs text-slate-600">Overview of all listed products.</p>
        </div>
        <button
          onClick={onNew}
          className="px-3 py-1.5 rounded-lg text-[13px] font-regular bg-orange-500 text-white active:scale-[0.98] transition-all cursor-pointer">
          +
        </button>
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:flex lg:hidden items-center justify-between">
        <div className="flex flex-col border-l-2 border-orange-500 pl-3">
          <h1 className="text-xl font-normal text-black-950 ">Product</h1>
            <p className="text-sm text-slate-600">Overview of all listed products, stock categories, and suppliers.</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-regular bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] transition-all cursor-pointer">
          <span>Add</span>
        </button>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex flex-col border-l-4 border-orange-500 pl-4">
          <h1 className="text-2xl font-normal text-black-950 ">Product</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-slate-600">Overview of all listed products, stock categories, and suppliers.</p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm bg-orange-500 font-regular text-white hover:bg-orange-600 active:scale-[0.96] transition-all cursor-pointer"
        >
          <span>Add</span>
        </button>
      </div>
    </>
  );
}
