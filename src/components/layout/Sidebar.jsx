import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { display, body } from "../../constants/theme";

const roleNavItems = {
  guest: [
    { label: "Browse Rooms", path: "/guest/rooms" },
    { label: "My Bookings", path: "/guest/bookings" },
    { label: "Leave a Review", path: "/guest/review" },
    { label: "Report an Issue", path: "/guest/report" },
  ],
  receptionist: [
    { label: "Roster", path: "/receptionist/roster" },
    { label: "Walk-in Booking", path: "/receptionist/walkin" },
    { label: "Check In / Out", path: "/receptionist/checkinout" },
  ],
  housekeeper: [
    { label: "My Tasks", path: "/housekeeper/tasks" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Rooms", path: "/admin/rooms" },
    { label: "Staff", path: "/admin/staff" },
    { label: "Reviews", path: "/admin/reviews" },
    { label: "Maintenance", path: "/admin/maintenance" },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const navItems = roleNavItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLoginClick = () => {
    navigate("/login");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0B1F3A] border-r border-[#C9A24B]/20
        flex flex-col z-30 transform transition-transform duration-300 ease-in-out
        ${body}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="px-6 py-5 border-b border-[#C9A24B]/20">
          <p className={`${display} text-[#C9A24B] font-bold text-lg`}>Fahari Grand</p>
          <p className="text-white text-xs italic mt-0.5">Where magnificence lives.</p>
        </div>

        {/* User info section — show only if authenticated */}
        {isAuthenticated && user && (
          <div className="px-6 py-4 border-b border-[#C9A24B]/20">
            <p className="text-white font-bold text-sm">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[#C9A24B] text-xs mt-0.5 capitalize font-semibold">{role}</p>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {isAuthenticated && navItems.length > 0 ? (
            navItems.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded text-sm font-bold transition-colors
                  ${isActive
                    ? "bg-[#C9A24B] text-[#0B1F3A]"
                    : "text-white hover:text-[#C9A24B]"}`
                }
              >
                {label}
              </NavLink>
            ))
          ) : !isAuthenticated ? (
            <div className="px-3 py-4 text-center space-y-3">
              <p className="text-white text-sm font-semibold">Browse our rooms</p>
              <button
                onClick={handleLoginClick}
                className="w-full px-3 py-2 rounded text-sm font-bold bg-[#C9A24B] text-[#0B1F3A] hover:bg-[#B8941F] transition"
              >
                Sign In to Book
              </button>
            </div>
          ) : null}
        </nav>

        {/* Logout button — show only if authenticated */}
        {isAuthenticated && (
          <div className="px-3 py-4 border-t border-[#C9A24B]/20">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2.5 rounded text-sm font-bold text-white hover:text-[#C9A24B] transition-colors text-left"
            >
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;