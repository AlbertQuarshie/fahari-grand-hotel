import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { display } from "../../constants/theme";

const Navbar = ({ onMenuClick }) => {
  const { user, role } = useAuth();

  const roleLabels = {
    guest: "Guest Portal",
    receptionist: "Receptionist Portal",
    housekeeper: "Housekeeper Portal",
    admin: "Admin Portal",
  };

  return (
    <header className="h-16 bg-[#0B1F3A] border-b border-[#C9A24B]/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 text-white hover:text-[#C9A24B] transition"
        >
          <Menu size={20} />
        </button>
        <h1 className={`${display} text-white font-bold text-sm sm:text-base`}>
          {roleLabels[role] || "Fahari Grand"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#C9A24B] flex items-center justify-center text-[#0B1F3A] font-bold text-sm">
          {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="hidden sm:block text-white text-sm font-semibold">
          {user?.first_name || user?.username}
        </span>
      </div>
    </header>
  );
};

export default Navbar;
