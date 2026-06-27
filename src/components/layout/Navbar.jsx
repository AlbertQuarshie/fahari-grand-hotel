import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { display } from "../../constants/theme";

// Roles that can access their profile page (admin excluded)
const PROFILE_ROLES = ["guest", "receptionist", "housekeeper"];

const Navbar = ({ onMenuClick }) => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const roleLabels = {
    guest: "Guest Portal",
    receptionist: "Receptionist Portal",
    housekeeper: "Housekeeper Portal",
    admin: "Admin Portal",
  };

  const canViewProfile = PROFILE_ROLES.includes(role);
  const initial =
    user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase();
  const displayName = user?.first_name || user?.username;

  return (
    <header className="h-16 bg-[#0B1F3A] border-b border-[#C9A24B]/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Show menu button only for authenticated users (who have sidebar) */}
        {isAuthenticated && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden p-2 text-white hover:text-[#C9A24B] transition"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className={`${display} text-white font-bold text-sm sm:text-base`}>
          {roleLabels[role] || "Fahari Grand"}
        </h1>
      </div>

      {/* Right side — profile for authenticated users, sign in button for guests */}
      {isAuthenticated ? (
        canViewProfile ? (
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 group"
            title="My Profile"
          >
            <span className="hidden sm:block text-white text-sm font-semibold group-hover:text-[#C9A24B] transition">
              {displayName}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#C9A24B] flex items-center justify-center text-[#0B1F3A] font-bold text-sm group-hover:ring-2 group-hover:ring-[#C9A24B] group-hover:ring-offset-2 group-hover:ring-offset-[#0B1F3A] transition-all">
              {initial}
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C9A24B] flex items-center justify-center text-[#0B1F3A] font-bold text-sm">
              {initial}
            </div>
            <span className="hidden sm:block text-white text-sm font-semibold">
              {displayName}
            </span>
          </div>
        )
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded text-sm font-bold bg-[#C9A24B] text-[#0B1F3A] hover:bg-[#B8941F] transition"
        >
          Sign In
        </button>
      )}
    </header>
  );
};

export default Navbar;