"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faBook, 
  faDatabase, 
  faCircleCheck 
} from "@fortawesome/free-solid-svg-icons";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "1,248", icon: faUsers, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active Chronicles", value: "8,542", icon: faBook, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Storage Used", value: "42.5 GB", icon: faDatabase, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "System Health", value: "99.9%", icon: faCircleCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-h1 text-3xl">Overview</h1>
          <p className="text-body-muted mt-1">Real-time status of the Mytherion multiverse.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-micro-badge text-emerald-400">All Portals Stable</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:translate-y-[-2px]">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center border border-white/5`}>
                <FontAwesomeIcon icon={stat.icon} className={`${stat.color} text-xl`} />
              </div>
            </div>
            <p className="text-card-title">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* System Logs Placeholder */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-h2 text-lg">Recent Security Logs</h2>
          <button className="text-micro-badge text-primary hover:text-white transition-colors">View All Logs</button>
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Session initialized for Chronicler #8821</p>
                  <p className="text-timestamp mt-0.5">2 minutes ago • IP: 192.168.1.{item}</p>
                </div>
              </div>
              <span className="text-micro-badge text-slate-500 px-2 py-1 bg-white/5 rounded">Info</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
