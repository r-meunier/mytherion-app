import "../styles/projects.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Shared Dashboard Background elements if any, otherwise just children */}
      {children}
    </div>
  );
}
