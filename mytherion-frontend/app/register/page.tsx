import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-background-dark text-slate-100 font-sans min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-[#02020a]"></div>
            <div className="absolute inset-0 nebula"></div>
            <div className="absolute inset-0 starfield"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute top-20 left-[15%] floating-element transform -rotate-12">
            <span className="material-symbols-outlined text-[120px] text-secondary">history_edu</span>
        </div>
        <div className="absolute bottom-20 right-[15%] floating-element transform rotate-12">
            <span className="material-symbols-outlined text-[140px] text-secondary">explore</span>
        </div>

        {/* Main Content */}
        <main className="relative z-10 w-full max-w-md px-6 py-12">
            <div className="glass-card rounded-3xl p-8 md:p-10 border-t border-l border-white/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-400 rounded-2xl flex items-center justify-center shadow-2xl mb-4 border border-white/20">
                        <span className="material-symbols-outlined text-white text-4xl">auto_awesome</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold gold-text tracking-widest uppercase">Mytherion</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium tracking-tight">Join the Great Library</p>
                </div>
                
                <RegisterForm />
                
                <div className="mt-8 flex justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Archives Online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Portal Stable</span>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

