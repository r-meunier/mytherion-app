'use client';

import { ProjectStats } from '@/app/services/projectService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faMapMarkerAlt,
  faUsers,
  faDna,
  faLandmark,
  faGem,
} from '@fortawesome/free-solid-svg-icons';

interface ProjectStatsProps {
  stats: ProjectStats;
}

const entityTypeIcons: Record<string, any> = {
  CHARACTER: faUser,
  LOCATION: faMapMarkerAlt,
  ORGANIZATION: faUsers,
  SPECIES: faDna,
  CULTURE: faLandmark,
  ITEM: faGem,
};

const entityTypeColors: Record<string, string> = {
  CHARACTER: 'from-purple-600 to-purple-400',
  LOCATION: 'from-blue-600 to-blue-400',
  ORGANIZATION: 'from-green-600 to-green-400',
  SPECIES: 'from-yellow-600 to-yellow-400',
  CULTURE: 'from-pink-600 to-pink-400',
  ITEM: 'from-orange-600 to-orange-400',
};

export default function ProjectStats({ stats }: ProjectStatsProps) {
  const totalEntities = stats.entityCount;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold text-purple-100 mb-6">Project Statistics</h2>

      {/* Total Count */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {totalEntities}
          </div>
          <div className="text-gray-300 text-lg">Total Entities</div>
        </div>
      </div>

      {/* Entity Type Breakdown */}
      {totalEntities > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats.entityCountByType).map(([type, count]) => {
            const icon = entityTypeIcons[type] || faGem;
            const colorClass = entityTypeColors[type] || 'from-gray-600 to-gray-400';
            const percentage = ((count / totalEntities) * 100).toFixed(1);

            return (
              <div
                key={type}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={icon} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-purple-100">{count}</div>
                    <div className="text-xs text-gray-400">{percentage}%</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300 capitalize">
                  {type.toLowerCase()}
                  {count !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No entities yet. Start adding entities to see statistics.</p>
        </div>
      )}
    </div>
  );
}
