import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { display } from "../../constants/theme";

const API = import.meta.env.VITE_API_BASE_URL;
const CLOUDINARY = "https://res.cloudinary.com/dmtfy0fnm/";

function getInitials(firstName, lastName, username) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (username) return username[0].toUpperCase();
  return "?";
}

function getAvatarUrl(path, size = 64) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${CLOUDINARY}image/upload/w_${size},h_${size},c_fill,g_face,q_auto,f_auto/${path}`;
}

/**
 * ProfileButton
 *
 * Drop this anywhere inside a role dashboard to give that user a link to
 * their profile page. It fetches the current user on mount, shows their
 * avatar / initials + name, and navigates to /profile on click.
 *
 * Usage:
 *   import ProfileButton from "../../components/shared/ProfileButton";
 *   <ProfileButton />
 */
const ProfileButton = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    axios
      .get(`${API}/auth/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (!cancelled) setUser(res.data); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  if (!user) {
    // Skeleton placeholder while loading
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded border border-[#0B1F3A]/10 bg-white animate-pulse w-44 h-12" />
    );
  }

  const avatarUrl = getAvatarUrl(user.profile_picture);
  const initials = getInitials(user.first_name, user.last_name, user.username);
  const displayName =
    user.first_name
      ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
      : user.username;

  return (
    <button
      onClick={() => navigate("/profile")}
      className="flex items-center gap-3 px-4 py-2.5 rounded border border-[#0B1F3A]/10 bg-white hover:border-[#C9A24B] hover:bg-[#FAF8F3] transition-all group"
      title="View my profile"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#0B1F3A]/10 group-hover:border-[#C9A24B] transition shrink-0 flex items-center justify-center bg-[#0B1F3A]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#C9A24B] text-xs font-bold">{initials}</span>
        )}
      </div>

      {/* Name */}
      <div className="text-left min-w-0">
        <p className={`${display} text-[#0B1F3A] font-bold text-sm truncate leading-tight group-hover:text-[#C9A24B] transition`}>
          {displayName}
        </p>
        <p className="text-[#0B1F3A]/50 text-xs font-semibold leading-tight">My Profile</p>
      </div>

      {/* Arrow */}
      <svg
        className="w-3.5 h-3.5 text-[#0B1F3A]/30 group-hover:text-[#C9A24B] transition shrink-0 ml-auto"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
};

export default ProfileButton;