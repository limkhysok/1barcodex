"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import type { User } from "@/src/types/auth.types";
import { useAuth } from "@/src/context/AuthContext";
import {
  ShieldCheck,
  LogOut,
  AtSign,
  User as UserIcon,
} from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Super Admin",
  boss: "Boss",
  staff: "Staff",
};

export default function ProfileClient({ initialUser }: Readonly<{ initialUser: User | null }>) {
  const { role, logout } = useAuth();
  const router = useRouter();

  if (!initialUser) return null;

  function handleLogout() {
    toast.info("Logging out…");
    logout();
    setTimeout(() => router.replace("/login"), 400);
  }

  const roleLabel = ROLE_LABEL[role] ?? "Staff";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">

      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Avatar + identity */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-6 border-b border-gray-100">
          <div className="w-36 h-36 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            <Image src="/albert-einstein.png" alt="User Avatar" width={94} height={94} className="object-cover" />
          </div>

        </div>

        {/* Info rows */}
        <div className="divide-y divide-gray-200">
          <InfoRow
            icon={<AtSign size={16} className="text-gray-700" strokeWidth={2} />}
            label="Username"
            value={initialUser.username}
          />
          <InfoRow
            icon={<UserIcon size={16} className="text-gray-700" strokeWidth={2} />}
            label="Full Name"
            value={initialUser.name || "—"}
          />
          <InfoRow
            icon={<ShieldCheck size={16} className="text-gray-700" strokeWidth={2} />}
            label="Role"
            value={roleLabel}
          />
        </div>

        {/* Sign out */}
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-900 hover:text-red-500 hover:bg-red-50 border border-gray-300 hover:border-red-200 rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={14} strokeWidth={2} />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700 shrink-0">{label}</span>
        <span className="text-sm font-semibold text-gray-900 truncate text-right">{value}</span>
      </div>
    </div>
  );
}
