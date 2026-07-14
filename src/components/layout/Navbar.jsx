import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { display, cardDark, btnGhost, btnPrimary } from "../../constants/theme";

// Roles that land on /profile — admin goes to their dashboard instead
const PROFILE_ROLES = ["guest", "receptionist", "housekeeper"];

const navLinks = [
  { label: "About", id: "why-us" },
  { label: "Rooms", id: "rooms" },
  { label: "Reviews", id: "testimonials" },
  { label: "Contact", id: "contact" },
];

/**
 * Site-wide navbar — same look and nav links on every page except Login/Register.
 * On the homepage, nav links smooth-scroll to their section. On any other page,
 * they navigate to the homepage with a #hash, which Landing.jsx picks up on
 * mount to scroll to that section.
 * Pass `onMenuClick` on pages that also render a Sidebar (dashboard pages) to
 * show a small toggle for it on mobile; omit it on Landing.
 */
const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const initial =
    user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase();
  const displayName = user?.first_name || user?.username;
  const profileLabel = PROFILE_ROLES.includes(role) ? "My Profile" : "Dashboard";

  const handleProfileClick = () => {
    navigate(PROFILE_ROLES.includes(role) ? "/profile" : "/admin/dashboard");
    setAccountMenuOpen(false);
  };

  const handleLogout = () => {
    // Navigate home first, then clear auth state. React 18 batches both
    // updates into a single re-render, so the protected page unmounts and
    // Landing mounts together — it never gets a chance to render its own
    // "unauthenticated" branch (redirect-to-login) in between. That's what
    // used to cause a flash before this went home. No full reload needed,
    // which is what was causing the blank white screen: a browser reload
    // always shows a blank page while it reboots the whole app from
    // scratch. justLoggedOutRef (see ProtectedRoute) is a second safety
    // net in case these two updates ever end up in separate renders.
    navigate("/", { replace: true });
    logout();
  };

  const goToSection = (id) => {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
    setMenuOpen(false);
  };

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1F3A]/95 backdrop-blur-sm border-b border-[#C9A24B]/20">
      <div className="h-16 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle — only on pages that render a Sidebar */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              aria-label="Open sidebar"
              className="lg:hidden p-1 text-white hover:text-[#C9A24B] transition"
            >
              <Menu size={20} />
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            className="flex items-baseline gap-2 group"
            title="Back to Home"
          >
            <span className={`${display} text-white font-bold text-lg tracking-wide group-hover:text-[#C9A24B] transition`}>
              Fahari Grand
            </span>
            <span className="text-[#C9A24B] text-xs italic hidden sm:inline">Hotel &amp; Suites</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => goToSection(id)}
              className={`${btnGhost} text-sm px-3 py-1.5 !text-white/80`}
            >
              {label}
            </button>
          ))}

          {isAuthenticated ? (
            <div className="relative ml-1" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 group pl-2"
                title="Account menu"
              >
                <span className="hidden md:block text-white text-sm font-semibold group-hover:text-[#C9A24B] transition">
                  {displayName}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#C9A24B] flex items-center justify-center text-[#0B1F3A] font-bold text-sm group-hover:ring-2 group-hover:ring-[#C9A24B] group-hover:ring-offset-2 group-hover:ring-offset-[#0B1F3A] transition-all">
                  {initial}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-white/70 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountMenuOpen && (
                <div className={`absolute right-0 top-12 w-56 ${cardDark} shadow-lg py-2 z-50`}>
                  <div className="px-4 py-2.5 border-b border-[#C9A24B]/20">
                    <p className="text-white text-sm font-bold truncate">{displayName}</p>
                    <p className="text-[#C9A24B] text-xs capitalize font-semibold mt-0.5">{role}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2.5 text-sm text-white/90 hover:text-[#C9A24B] hover:bg-white/5 transition"
                  >
                    {profileLabel}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-white/90 hover:text-[#C9A24B] hover:bg-white/5 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className={`${btnGhost} text-sm px-3 py-1.5 !text-white/80`}>
                Sign In
              </button>
              <button onClick={() => navigate("/register")} className={`${btnPrimary} text-sm px-5 py-2 rounded`}>
                Book Now
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-white hover:text-[#C9A24B] transition"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-[#0B1F3A] border-t border-[#C9A24B]/20 px-4 lg:px-6 py-4 space-y-1">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => goToSection(id)}
              className="block text-white text-sm font-semibold w-full text-left py-2.5"
            >
              {label}
            </button>
          ))}

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 py-2.5 border-t border-[#C9A24B]/20 mt-1 pt-3">
                <div className="w-8 h-8 rounded-full bg-[#C9A24B] flex items-center justify-center text-[#0B1F3A] font-bold text-sm shrink-0">
                  {initial}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{displayName}</p>
                  <p className="text-[#C9A24B] text-xs capitalize font-semibold">{role}</p>
                </div>
              </div>
              <button
                onClick={() => { handleProfileClick(); setMenuOpen(false); }}
                className="block text-white text-sm font-semibold w-full text-left py-2.5"
              >
                {profileLabel}
              </button>
              <button
                onClick={handleLogout}
                className="block text-white text-sm font-semibold w-full text-left py-2.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                className="block text-white text-sm font-semibold w-full text-left py-2.5"
              >
                Sign In
              </button>
              <button
                onClick={() => { navigate("/register"); setMenuOpen(false); }}
                className={`block w-full ${btnPrimary} py-3 rounded text-sm mt-2`}
              >
                Book Now
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
