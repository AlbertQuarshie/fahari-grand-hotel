import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ onMenuClick }) => {
  const { user, role } = useAuth();

  const roleLabels = {
    guest: "Guest Portal",
    receptionist: "Receptionist Portal",
    housekeeper: "Housekeeper Portal",
    admin: "Admin Portal",
  };

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Left: hamburger (mobile only) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-white font-semibold text-sm sm:text-base">
          {roleLabels[role] || "Fahari Grand"}
        </h1>
      </div>

      {/* Right: user greeting */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm">
          {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="hidden sm:block text-slate-300 text-sm">
          {user?.first_name || user?.username}
        </span>
      </div>
    </header>
  );
};

export default Navbar;