"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuth } from "../store/authSlice";
import { fetchDashboardStats } from "../store/dashboardSlice";
import { fetchProjects, clearCurrentProject } from "../store/projectSlice";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import ProjectList from "../components/projects/ProjectList";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectModal from "../components/projects/ProjectModal";

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("none");

  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  // Check authentication on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Initial load effect
  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        dispatch(fetchDashboardStats());
        dispatch(clearCurrentProject());
      } else {
        router.push("/login");
      }
    }
  }, [dispatch, isInitialized, isAuthenticated, router]);

  // Project fetching effect (with debounce for search)
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const timeoutId = setTimeout(() => {
        dispatch(fetchProjects({ 
          page: 0, 
          size: 8, 
          search: searchQuery, 
          genre: genreFilter === "none" ? undefined : genreFilter 
        }));
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, isInitialized, isAuthenticated, searchQuery, genreFilter]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#16111B]">
      {/* Background Ley Lines - Exact Design Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0F0F23]">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[100%] bg-[#a855f7]/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] bg-[#fbbf24]/5 rounded-full blur-[160px]" />
      </div>

      {/* Header (Now Global Parent) */}
      <DashboardHeader onCreateProject={() => setShowCreateModal(true)} />

      {/* Main Content Area - Now Full Width Portal */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Dashboard Content - Matching Design p-stack-lg (48px) */}
        <div className="flex-1 overflow-y-auto p-[48px] space-y-[48px] scroll-smooth relative z-10 custom-scrollbar">
          
          {/* 1. Header Section */}
          <div className="mb-10">
            <h1 className="text-display-lg text-white">Your Worlds</h1>
            <p className="text-subtitle-muted mt-1 max-w-md">
              Access and manage your multi-verse projects.
            </p>
          </div>
          
          {/* 2. Controls Section (Filters & Views) */}
          <div className="flex justify-end items-end gap-6 mb-12">
            <ProjectFilters 
              onSearchChange={(q) => setSearchQuery(q)}
              onSortChange={(s) => console.log("Sort:", s)}
              onGenreChange={(g) => setGenreFilter(g)}
              onViewChange={(v) => console.log("View:", v)}
            />
          </div>

          {/* Library Grid */}
          <section>
            <ProjectList 
              onCreateClick={() => setShowCreateModal(true)}
              onEditClick={(id) => { /* Selection handles navigation */ }}
            />
          </section>
        </div>
      </main>

      {/* Creation Modal */}
      <ProjectModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
