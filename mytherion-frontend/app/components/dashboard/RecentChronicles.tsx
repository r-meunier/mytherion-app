"use client";
import Link from 'next/link';
import { useAppSelector } from '../../store/hooks';
import { EntityType } from '../../types/entity';

const badgeColors: Record<string, string> = {
  CHARACTER: "bg-primary/10 text-primary border-primary/20",
  LOCATION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SPECIES: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ITEM: "bg-secondary/10 text-secondary border-secondary/20",
  ORGANIZATION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CULTURE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CUSTOM: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function RecentChronicles() {
  const { stats, loading } = useAppSelector((state) => state.dashboard);
  const recentEntities = stats?.recentEntities || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-h3 flex items-center">
          <span className="material-symbols-outlined mr-2 text-primary">history</span>
          Recent Chronicles
        </h4>
        <Link href="/archive" className="text-sm text-primary hover:underline font-medium">
          View Archive
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          [1, 2, 3].map((i) => (
            <div key={i} className="glass p-5 rounded-2xl animate-pulse flex items-start space-x-5 border border-white/10">
              <div className="w-20 h-20 bg-white/10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-white/10 rounded w-1/3" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : recentEntities.length === 0 ? (
          <div className="glass p-8 rounded-2xl text-center text-slate-400 italic">
            No chronicles found. Start by creating your first entity!
          </div>
        ) : (
          recentEntities.map((entity) => (
            <div
              key={entity.id}
              className="glass p-5 rounded-2xl hover:bg-white/5! transition-all group flex items-start space-x-5 border border-white/10 cursor-pointer"
            >
              {/* Thumbnail */}
              {/* TODO: Implement real entity images once storage is fully integrated */}
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-inner">
                <img
                  alt={entity.name}
                  className="w-full h-full object-cover grayscale-10 sepia-5"
                  src={entity.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAX6Yev4jBDV6wwAa44dwhhVR-vRF8-35TNH-znLY0p_AjF8AhGQluQvhDSQhECusFq4zrD8kLy854JjxgPkAK0qIQw7CGv_Lx15kP9lqTAbuOCZSTvZMv_IppMPsw9sbS6YqTesiBKZpSukdKi0QGS0hyrEwpGBd-OYAxNwJkImosw8xieOmq2wH2L7k3jjKuNI6QY_xP3zHnSBC_XgXVoC17PFel6QoMJVgAoB3a3fOmu03_IEKiWfxxTNzCU5TewCuK4sGZtDhhg"}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-white group-hover:text-primary transition-colors">
                    {entity.name}
                  </h5>
                  <span className="text-timestamp">
                    {/* TODO: Add 'time ago' formatting for updatedAt */}
                    {new Date(entity.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {/* TODO: Replace with real dynamic summary once narrative engine is ready */}
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  Updated {entity.type.toLowerCase()} details and expanded lore connections. Adjusted political standing and historical context...
                </p>
                <div className="mt-3 flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-micro-badge border ${
                      badgeColors[entity.type] || badgeColors.CUSTOM
                    }`}
                  >
                    {entity.type.charAt(0) + entity.type.slice(1).toLowerCase()}
                  </span>
                  {/* TODO: Implement dynamic sub-tags (e.g. 'Major NPC') based on entity metadata */}
                  <span className="px-2 py-0.5 rounded-full text-micro-badge border bg-blue-500/10 text-blue-400 border-blue-500/20">
                    Major NPC
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
