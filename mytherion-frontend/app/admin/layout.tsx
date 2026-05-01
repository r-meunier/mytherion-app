"use client";

import { useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartLine, 
  faUsers, 
  faShieldHalved, 
  faArrowLeft 
} from "@fortawesome/free-solid-svg-icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isInitialized, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02020a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex flex-col md:flex-row overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-radial-[at_50%_0%] from-purple-900/20 via-transparent to-transparent opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Admin Sidebar */}
      <aside className="relative z-10 w-full md:w-64 glass-card border-r border-white/5 flex flex-col backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <FontAwesomeIcon icon={faShieldHalved} className="text-amber-400 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Admin Portal</h2>
              <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Arbiter Oversight</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <FontAwesomeIcon icon={faChartLine} className="group-hover:text-primary" />
              <span className="font-medium">Overview</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <FontAwesomeIcon icon={faUsers} className="group-hover:text-primary" />
              <span className="font-medium">User Management</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 transition-all"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="text-sm font-medium">Exit to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
