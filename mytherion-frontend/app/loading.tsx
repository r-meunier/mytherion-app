export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-dark">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-starfield opacity-30"></div>
      </div>

      {/* Loading Content */}
      <div className="relative flex flex-col items-center">
        {/* Pulsing Logo Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/40 rounded-2xl blur-2xl animate-ping opacity-20"></div>
          <div className="relative w-20 h-20 bg-gradient-to-tr from-primary to-purple-400 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-bounce-subtle">
            <span className="material-symbols-outlined text-white text-[40px]">
              auto_awesome
            </span>
          </div>
        </div>

        {/* Text and Progress */}
        <div className="text-center space-y-4">
          <h2 className="text-logo text-2xl !text-white">
            Mytherion
          </h2>
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full animate-loading-bar"></div>
            </div>
            <p className="text-micro-badge text-slate-500 animate-pulse !tracking-[0.4em]">
              Channeling the Multiverse...
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
