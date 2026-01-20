'use client';

import type { ProjectStats } from '@/app/services/projectService';

interface ProjectStatsProps {
  stats: ProjectStats;
}

const entityTypeIcons: Record<string, string> = {
  CHARACTER: 'person',
  LOCATION: 'location_on',
  ORGANIZATION: 'groups',
  SPECIES: 'pets',
  CULTURE: 'account_balance',
  ITEM: 'diamond',
};

const entityTypeColors: Record<string, string> = {
  CHARACTER: 'from-primary to-purple-400',
  LOCATION: 'from-blue-600 to-blue-400',
  ORGANIZATION: 'from-green-600 to-green-400',
  SPECIES: 'from-yellow-600 to-yellow-400',
  CULTURE: 'from-pink-600 to-pink-400',
  ITEM: 'from-secondary to-orange-400',
};

export default function ProjectStats({ stats }: ProjectStatsProps) {
  const totalEntities = stats.entityCount;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-2xl font-display font-semibold text-white mb-6">Project Statistics</h2>

      {/* Total Count */}
      <div className="mb-8 p-6 bg-primary/10 rounded-xl border border-primary/20">
        <div className="text-center">
          <div className="text-5xl font-display font-bold text-white mb-2">
            {totalEntities}
          </div>
          <div className="text-slate-300 text-lg">Total Entities</div>
        </div>
      </div>

      {/* Entity Type Breakdown */}
      {totalEntities > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats.entityCountByType).map(([type, count]) => {
            const icon = entityTypeIcons[type] || 'diamond';
            const colorClass = entityTypeColors[type] || 'from-slate-600 to-slate-400';
            const percentage = ((count / totalEntities) * 100).toFixed(1);

            return (
              <div
                key={type}
                className="glass rounded-xl p-4 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-display font-bold text-white">{count}</div>
                    <div className="text-xs text-slate-400">{percentage}%</div>
                  </div>
                </div>
                <div className="text-sm text-slate-300 capitalize">
                  {type.toLowerCase()}
                  {count !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <span className="material-symbols-outlined text-[48px] mb-4 block text-slate-500">inbox</span>
          <p>No entities yet. Start adding entities to see statistics.</p>
        </div>
      )}
    </div>
  );
}

