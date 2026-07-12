import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { body } from "../../constants/theme";

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

// Guest paths a public (unauthenticated) visitor can actually open
const PUBLIC_GUEST_PATHS = ["/guest/rooms"];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, isAuthenticated } = useAuth();
  // Public visitors browsing the site see the guest nav items too, so they
  // know those sections exist — but only "Browse Rooms" is actually public.
  const navItems = roleNavItems[role] || (!isAuthenticated ? roleNavItems.guest : []);

  const handleRestrictedClick = () => {
    toast.error("Please sign in to access that page.");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-[#0B1F3A]/60 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-[#0B1F3A] border-r border-[#C9A24B]/20
        flex flex-col z-30 transform transition-transform duration-300 ease-in-out
        ${body}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:h-full lg:z-auto
      `}>
        {/* User info section — show only if authenticated */}
        {isAuthenticated && user && (
          <div className="px-6 py-4 border-b border-[#C9A24B]/20">
            <p className="text-white font-bold text-sm">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[#C9A24B] text-xs mt-0.5 capitalize font-semibold">{role}</p>
          </div>
        )}

        {/* Navigation items — shown to authenticated users and public visitors alike.
            For public visitors, items outside PUBLIC_GUEST_PATHS are shown dimmed
            and don't navigate — clicking them just surfaces a sign-in toast. */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, path }) => {
            const isRestricted = !isAuthenticated && !PUBLIC_GUEST_PATHS.includes(path);

            if (isRestricted) {
              return (
                <button
                  key={path}
                  onClick={handleRestrictedClick}
                  className="block w-full text-left px-3 py-2.5 rounded text-sm font-bold text-white/40 hover:text-white/60 transition-colors"
                >
                  {label}
                </button>
              );
            }

            return (
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
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
