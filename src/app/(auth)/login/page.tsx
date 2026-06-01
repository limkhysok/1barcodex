"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router          = useRouter();

  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast]               = useState(false);
  const [redirecting, setRedirecting]   = useState(false);

  // Only auto-redirect if the user is already logged in on page load (not mid-login flow)
  useEffect(() => {
    if (user && !redirecting) router.push("/transactions");
  }, [user, router, redirecting]);

  function validate(): string {
    if (!username.trim()) return "Username is required.";
    if (username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!password) return "Password is required.";
    if (password.length < 4) return "Password must be at least 4 characters.";
    return "";
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setLoading(true);
    try {
      setRedirecting(true);
      await login({ username: username.trim(), password });
      setToast(true);
      setTimeout(() => router.push("/transactions"), 1800);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 401
          ? "Invalid username or password."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-xs sm:max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-300">

          {/* Form */}
          <div className="px-5 py-6 space-y-4 sm:px-8 sm:py-7 sm:space-y-5">

            <div>
              <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Welcome back</h1>
              <p className="text-xs text-gray-500 mt-0.5 sm:text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-regular text-gray-800">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    type="text"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-regular text-gray-800">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    className="w-full pl-10 pr-11 py-2 rounded-xl border border-gray-200  text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 pt-1">
                Need help?{" "}
                <a
                  href="https://t.me/soklimkhy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 font-medium hover:underline transition-colors"
                >
                  Telegram
                </a>
              </p>

            </form>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">CTK Spare Parts v1.0.0</p>
      </div>

      {/* Success toast */}
      <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Login successful</p>
          <p className="text-xs text-gray-500">Redirecting you now…</p>
        </div>
      </div>

    </main>
  );
}
