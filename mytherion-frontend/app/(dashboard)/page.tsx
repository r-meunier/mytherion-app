"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { checkAuth } from "../store/authSlice";
import { fetchDashboardStats } from "../store/dashboardSlice";
import { fetchProjects, clearCurrentProject } from "../store/projectSlice";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import ProjectList from "../components/projects/ProjectList";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectModal from "../components/projects/ProjectModal";
import PageHeader from "../components/ui/PageHeader";
import routes from "../config/routes";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const { stats, loading: statsLoading } = useAppSelector((state) => state.dashboard);
  const { projects, loading: projectsLoading } = useAppSelector((state) => state.projects);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("none");
  const [sortBy, setSortBy] = useState("date");

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
        router.push(routes.login());
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0710]">
      {/* Ambient Background with Floating Shards & Glows */}
      <div className="ambient-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-shard w-32 h-32 top-20 left-10 opacity-20" />
        <div className="floating-shard w-48 h-48 bottom-40 right-20 opacity-10" style={{ animationDelay: "-5s", animationDuration: "25s" }} />
        <div className="floating-shard w-16 h-16 top-1/2 left-1/4 opacity-30" style={{ animationDelay: "-12s", animationDuration: "15s", borderRadius: "50%" }} />
      </div>

      {/* Header (Docked 2026 Bar) */}
      <AppHeader />

      {/* Main Content Area - 2026 Bento Portal */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-10 space-y-10 scroll-smooth custom-scrollbar">
          
          {/* Header & Glass Command Bar Section */}
          <PageHeader
            title="Your Worlds"
            subtitle="Pick up where you left off, or bring a new universe to life."
            className="max-w-7xl mx-auto"
          >
            <ProjectFilters 
              onSearchChange={(q) => setSearchQuery(q)}
              onSortChange={(s) => setSortBy(s)}
              onGenreChange={(g) => setGenreFilter(g)}
              onCreateClick={() => setShowCreateModal(true)}
            />
          </PageHeader>

          {/* Bento Library Grid */}
          <section className="max-w-7xl mx-auto pb-16">
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
