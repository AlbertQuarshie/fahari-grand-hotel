import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  ClipboardList,
  Users,
  Star,
  Wrench,
  LogOut,
  Hotel,
  CheckSquare,
} from "lucide-react";

const roleNavItems = {
  guest: [
    { label: "Browse Rooms", path: "/guest/rooms", icon: BedDouble },
    { label: "My Bookings", path: "/guest/bookings", icon: CalendarCheck },
    { label: "Report an Issue", path: "/guest/report", icon: Wrench },
  ],
  receptionist: [
    { label: "Roster", path: "/receptionist/roster", icon: ClipboardList },
    { label: "Walk-in Booking", path: "/receptionist/walkin", icon: BedDouble },
    { label: "Check In / Out", path: "/receptionist/checkinout", icon: CheckSquare },
  ],
  housekeeper: [
    { label: "My Tasks", path: "/housekeeper/tasks", icon: CheckSquare },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Rooms", path: "/admin/rooms", icon: BedDouble },
    { label: "Staff", path: "/admin/staff", icon: Users },
    { label: "Reviews", path: "/admin/reviews", icon: Star },
    { label: "Maintenance", path: "/admin/maintenance", icon: Wrench },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = roleNavItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700
          flex flex-col z-30 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Hotel className="text-amber-400" size={22} />
            <div>
              <p className="text-amber-400 font-bold text-base leading-tight">Fahari Grand</p>
              <p className="text-slate-500 text-xs italic">Where magnificence lives.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-700">
          <p className="text-white font-semibold text-sm">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-slate-400 text-xs mt-0.5 capitalize">{role}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-amber-400 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;