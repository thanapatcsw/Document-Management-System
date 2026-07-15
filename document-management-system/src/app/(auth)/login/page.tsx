import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <form className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">เข้าสู่ระบบ</h2>
        <p className="text-xs text-slate-400">กรอกข้อมูลบัญชีเพื่อเข้าใช้งานระบบ DMS</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            ชื่อผู้ใช้งาน (Username)
          </label>
          <input
            type="text"
            placeholder="เช่น manager01"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-300">
              รหัสผ่าน (Password)
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
      </div>

      <Link
        href="/dashboard"
        className="mt-2 block w-full rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
      >
        เข้าสู่ระบบ
      </Link>
    </form>
  );
}
