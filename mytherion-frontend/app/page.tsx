"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { checkAuth } from "./store/authSlice";
import { fetchDashboardStats } from "./store/dashboardSlice";
import DualSidebar from "./components/DualSidebar";
import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/ui/StatCard";
import RecentChronicles from "./components/dashboard/RecentChronicles";
import WorldMapCard from "./components/dashboard/WorldMapCard";
import ArcaneTools from "./components/dashboard/ArcaneTools";
import PromptCard from "./components/dashboard/PromptCard";

export default function Home() {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);

  // Check authentication and fetch stats on mount
  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "...";
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      {/* Dual Sidebar */}
      <DualSidebar activeSection="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-h1 text-3xl">
                Welcome back, Chronicler
              </h2>
              <p className="text-page-subheader mt-1">
                Your worlds are waiting for your next stroke of genius.
              </p>
            </div>
            <button className="bg-primary hover:bg-primary/80 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">add_box</span>
              <span className="font-semibold">Create New Entry</span>
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Entities"
              value={formatNumber(stats?.totalEntities)}
              subtitle={stats && stats.entitiesThisWeek > 0 ? `+${formatNumber(stats.entitiesThisWeek)} this week` : undefined}
              loading={loading}
              icon="auto_stories"
              badges={
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>
                      person
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontSize: '12px' }}>
                      location_on
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '12px' }}>
                      diamond
                    </span>
                  </div>
                </div>
              }
            />

            <StatCard
              title="Recent Edits"
              value={formatNumber(stats?.recentEdits)}
              subtitle="Past 24h"
              loading={loading}
              subtitleColor="text-slate-500"
              icon="history_edu"
              progressBar={{
                value: 65,
                label: "Active Session",
              }}
            />

            <StatCard
              title="Total Projects"
              value={formatNumber(stats?.totalProjects)}
              subtitle="Active Worlds"
              loading={loading}
              subtitleColor="text-primary"
              icon="public"
              badges={
                <div className="text-micro-badge text-slate-500 tracking-tight">
                  Across all dimensions
                </div>
              }
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Chronicles */}
            <div className="lg:col-span-2">
              <RecentChronicles />
            </div>

            {/* Right Column - Map, Tools, Prompt */}
            <div className="space-y-8">
              <WorldMapCard />
              <ArcaneTools />
              <PromptCard />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Menu Button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </div>
  );
}


