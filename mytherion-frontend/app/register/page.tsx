import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#190525] to-slate-900 flex items-center justify-center p-4">
      {/* Animated background overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#190525]/20 via-transparent to-blue-900/20 pointer-events-none"></div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-slate-400">
              Join Mytherion to start tracking your lore
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

