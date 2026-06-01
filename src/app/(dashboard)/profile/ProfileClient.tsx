"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@/src/types/auth.types";
import { useAuth } from "@/src/context/AuthContext";
import {
  Mail,
  ShieldCheck,
  LogOut,
  BadgeCheck,
  AtSign,
} from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Super Admin",
  boss: "Boss",
  staff: "Staff",
};

const ROLE_COLOR: Record<string, string> = {
  superadmin: "bg-orange-100 text-orange-700",
  boss: "bg-slate-100 text-slate-700",
  staff: "bg-gray-100 text-gray-600",
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
  const roleColor = ROLE_COLOR[role] ?? ROLE_COLOR.staff;

  const initials = (initialUser.name || initialUser.username || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">

      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Avatar + identity */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center ring-4 ring-orange-100 shadow-sm">
            <span className="text-xl font-bold text-white leading-none">{initials}</span>
          </div>
          <div className="text-center space-y-2">
            <p className="text-base font-bold text-gray-900">
              {initialUser.name || initialUser.username}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${roleColor}`}>
                {roleLabel}
              </span>
              {initialUser.is_staff && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <BadgeCheck size={13} strokeWidth={2} />
                  Staff
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="divide-y divide-gray-100">
          <InfoRow
            icon={<AtSign size={14} className="text-gray-400" strokeWidth={2} />}
            label="Username"
            value={initialUser.username}
          />
          <InfoRow
            icon={<Mail size={14} className="text-gray-400" strokeWidth={2} />}
            label="Email"
            value={initialUser.email || "—"}
          />
          <InfoRow
            icon={<ShieldCheck size={14} className="text-gray-400" strokeWidth={2} />}
            label="Access Level"
            value={roleLabel}
          />
        </div>

        {/* Sign out */}
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all cursor-pointer"
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
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400 shrink-0">{label}</span>
        <span className="text-sm font-medium text-gray-700 truncate text-right">{value}</span>
      </div>
    </div>
  );
}
