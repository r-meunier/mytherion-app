"use client";

interface Chronicle {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  imageUrl: string;
  badges: { label: string; color: string }[];
}

const mockChronicles: Chronicle[] = [
  {
    id: "1",
    title: "The High Priestess of Eldora",
    description:
      'Updated character background and added the "Sacred Omen" artifact connection. Adjusted political standing in the Eldorian Council...',
    timestamp: "2 hours ago",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAX6Yev4jBDV6wwAa44dwhhVR-vRF8-35TNH-znLY0p_AjF8AhGQluQvhDSQhECusFq4zrD8kLy854JjxgPkAK0qIQw7CGv_Lx15kP9lqTAbuOCZSTvZMv_IppMPsw9sbS6YqTesiBKZpSukdKi0QGS0hyrEwpGBd-OYAxNwJkImosw8xieOmq2wH2L7k3jjKuNI6QY_xP3zHnSBC_XgXVoC17PFel6QoMJVgAoB3a3fOmu03_IEKiWfxxTNzCU5TewCuK4sGZtDhhg",
    badges: [
      { label: "Character", color: "primary" },
      { label: "Major NPC", color: "blue" },
    ],
  },
  {
    id: "2",
    title: "Obsidian Peaks (Range)",
    description:
      "Modified climatic effects to include the 'Shadow Gale' phenomenon. Added lore regarding the Great Wyrm's resting place...",
    timestamp: "5 hours ago",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIbUVclgpmsPW2jmgpdKnFHXZz_FRFaOOliz5M_3pQ2hH-d6LF7G9x09XorVYrATNRx9TXdM_CgGhVgWSXUsHbCtJAWPoXLDb6DL0LP59BH1Fdde-2LDZcmgK8Lu1Bj9gCph_3VZ9GB4OZPD5fJqpK1TqR3jyjH_RM9HHjiVsYanPaOPq5iKyJQI7bMiBcHAclWwdezG0egD7VaFoLhV-QAu5mgnFRTrG4ZrM-kLFsQSJjDyFak7Oe09NsKi50tDhvEfMRnXKP4hAJ",
    badges: [
      { label: "Location", color: "blue" },
      { label: "Environment", color: "emerald" },
    ],
  },
  {
    id: "3",
    title: "Blade of the Sun King",
    description:
      "New artifact entry. Legendary sword belonging to King Solari. Includes unique 'Light-bringer' trait and quest hook...",
    timestamp: "Yesterday",
    imageUrl:
      "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=200&h=200&fit=crop",
    badges: [
      { label: "Artifact", color: "secondary" },
      { label: "Legendary", color: "purple" },
    ],
  },
];

const badgeColors: Record<string, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  secondary: "bg-secondary/10 text-secondary border-secondary/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function RecentChronicles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-display font-bold text-white flex items-center">
          <span className="material-symbols-outlined mr-2 text-primary">history</span>
          Recent Chronicles
        </h4>
        <a href="#archive" className="text-sm text-primary hover:underline font-medium">
          View Archive
        </a>
      </div>

      <div className="space-y-4">
        {mockChronicles.map((chronicle) => (
          <div
            key={chronicle.id}
            className="glass p-5 rounded-2xl hover:!bg-white/5 transition-all group flex items-start space-x-5 border border-white/10 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 shadow-inner">
              <img
                alt={chronicle.title}
                className="w-full h-full object-cover grayscale-[10%] sepia-[5%]"
                src={chronicle.imageUrl}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-bold text-white group-hover:text-primary transition-colors">
                  {chronicle.title}
                </h5>
                <span className="text-[11px] text-slate-500">{chronicle.timestamp}</span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {chronicle.description}
              </p>
              <div className="mt-3 flex items-center space-x-3">
                {chronicle.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      badgeColors[badge.color]
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
