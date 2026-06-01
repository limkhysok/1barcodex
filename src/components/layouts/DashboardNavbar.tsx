"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/context/AuthContext";
import { User, LogOut, Menu } from "lucide-react";

interface Props {
  onMenuClick: () => void;
}

export default function DashboardNavbar({ onMenuClick }: Readonly<Props>) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  const displayName = user?.name || user?.username || "User";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl ">
      <div className="h-12.5 px-2 md:px-6 flex items-center justify-between gap-4 border-b  border-gray-400">

        {/* Left Section */}
        <div className="flex items-center gap-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-90"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>

          <Link href="/dashboard" className="md:hidden flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center shrink-0 w-6">
              <Image src="/ctk.svg" alt="CTK" width={16} height={22} priority style={{ height: "auto" }} />
            </div>
            <div className="flex flex-col leading-none">
              <p className="text-[17px] font-black tracking-tight  text-gray-900">CTK</p>
              <p className="text-[7px] font-bold tracking-[0.4em]  text-orange-600 mt-0.1 opacity-90">Spare Parts</p>
            </div>
          </Link>
        </div>

        <div className="flex-1" />

        {/* Right Section */}
        <div className="flex items-center gap-4" ref={dropdownRef}>
          <div className="hidden sm:flex flex-col items-end gap-0 shrink-0">
            <p className="text-xs font-medium text-gray-500">Hello!</p>
            <p className="text-sm font-bold text-gray-900 truncate max-w-40">
              {displayName}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="group flex items-center gap-1 p-0.5 rounded-full hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-gray-200">
                <Image src="/albert-einstein.png" alt="User Avatar" width={32} height={32} className="object-cover" />
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-400 shadow-sm overflow-hidden z-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">


                <div className="p-2">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all group"
                  >
                    <User size={16} strokeWidth={2} className="text-gray-500 group-hover:text-gray-700" />
                    Account
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 text-sm font-medium text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer group"
                  >
                    <LogOut size={16} strokeWidth={2} className="text-gray-700 group-hover:text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
