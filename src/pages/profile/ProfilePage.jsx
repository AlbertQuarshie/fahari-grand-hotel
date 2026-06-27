import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import {
  display, body, pageTitle, pageSubtitle, card,
  input, btnPrimary, btnNavy, skeleton, badge,
} from "../../constants/theme";

const CLOUDINARY = "https://res.cloudinary.com/dmtfy0fnm/";

function getAvatarUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return CLOUDINARY + path;
}

function getInitials(firstName, lastName, username) {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (username) return username[0].toUpperCase();
  return "?";
}

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const roleHome = {
  guest:        "/guest/rooms",
  receptionist: "/receptionist/roster",
  housekeeper:  "/housekeeper/tasks",
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, role } = useAuth();
  const fileInputRef = useRef(null);

  // Local copy of user so edits reflect immediately without touching AuthContext
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", email: "", phone_number: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "", new_password: "", confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── Load profile (uses the shared axios instance — token handled by interceptor) ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/auth/me/");
        if (cancelled) return;
        setUser(data);
        setProfileForm({
          first_name:   data.first_name   || "",
          last_name:    data.last_name    || "",
          email:        data.email        || "",
          phone_number: data.phone_number || "",
        });
      } catch {
        if (!cancelled) toast.error("Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Save personal info ─────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const { data } = await api.patch("/auth/me/", profileForm);
      setUser((prev) => ({ ...prev, ...data }));
      toast.success("Profile updated.");
    } catch (err) {
      const detail = err.response?.data;
      const msg =
        typeof detail === "string"
          ? detail
          : Object.values(detail || {}).flat()[0] || "Update failed.";
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords don't match."); return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters."); return;
    }
    setPasswordSaving(true);
    try {
      await api.post("/auth/change-password/", {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password changed.");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const detail = err.response?.data;
      const msg =
        typeof detail === "string"
          ? detail
          : Object.values(detail || {}).flat()[0] || "Could not change password.";
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }

    const formData = new FormData();
    formData.append("profile_picture", file);
    setAvatarUploading(true);
    try {
      const { data } = await api.patch("/auth/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, profile_picture: data.profile_picture }));
      toast.success("Photo updated.");
    } catch {
      toast.error("Photo upload failed.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen bg-[#FAF8F3] ${body}`}>
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-32 ${skeleton}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl  = getAvatarUrl(user.profile_picture);
  const initials   = getInitials(user.first_name, user.last_name, user.username);
  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

  return (
    <div className={`min-h-screen bg-[#FAF8F3] ${body}`}>
      {/* Mini-navbar so the page doesn't feel naked */}
      <header className="h-16 bg-[#0B1F3A] border-b border-[#C9A24B]/20 flex items-center px-4 lg:px-8 sticky top-0 z-10">
        <button
          onClick={() => navigate(roleHome[role] || "/")}
          className="flex items-center gap-2 text-white hover:text-[#C9A24B] transition text-sm font-bold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back to Dashboard
        </button>
        <span className={`${display} text-[#C9A24B] font-bold ml-auto`}>Fahari Grand</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Page heading */}
        <div>
          <h2 className={pageTitle}>My Profile</h2>
          <p className={pageSubtitle}>Manage your personal details and password.</p>
        </div>

        {/* ── Identity card ── */}
        <div className="bg-[#0B1F3A] rounded p-6 flex items-center gap-5">
          <div
            className="relative shrink-0 cursor-pointer group"
            onClick={() => !avatarUploading && fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A24B]/40 flex items-center justify-center bg-[#13294B]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className={`${display} text-[#C9A24B] font-bold text-xl`}>{initials}</span>
              )}
            </div>
            {!avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white"><CameraIcon /></span>
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`${display} text-white font-bold text-xl truncate`}>{displayName}</p>
            <p className="text-white/50 text-sm font-semibold">@{user.username}</p>
            <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded ${badge(role)}`}>
              {role}
            </span>
          </div>

          <p className="text-white/30 text-xs font-semibold hidden sm:block shrink-0">
            Click photo to change
          </p>
        </div>

        {/* ── Personal Information ── */}
        <div className={`${card} p-6 space-y-5`}>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Personal Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#0B1F3A] text-sm font-bold mb-1">First Name</label>
                <input
                  className={input}
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-[#0B1F3A] text-sm font-bold mb-1">Last Name</label>
                <input
                  className={input}
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#0B1F3A] text-sm font-bold mb-1">Email Address</label>
              <input
                className={input}
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[#0B1F3A] text-sm font-bold mb-1">Phone Number</label>
              <input
                className={input}
                type="tel"
                value={profileForm.phone_number}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone_number: e.target.value }))}
                placeholder="+254 700 000 000"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={profileSaving}
                className={`px-6 py-2.5 rounded text-sm ${btnPrimary} disabled:opacity-50`}
              >
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className={`${card} p-6 space-y-5`}>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Change Password</h3>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-[#0B1F3A] text-sm font-bold mb-1">Current Password</label>
              <div className="relative">
                <input
                  className={input}
                  type={showPw.old ? "text" : "password"}
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, old_password: e.target.value }))}
                  placeholder="Enter current password"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1F3A]/40 hover:text-[#0B1F3A] transition"
                  onClick={() => setShowPw((p) => ({ ...p, old: !p.old }))}>
                  {showPw.old ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#0B1F3A] text-sm font-bold mb-1">New Password</label>
                <div className="relative">
                  <input
                    className={input}
                    type={showPw.new ? "text" : "password"}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1F3A]/40 hover:text-[#0B1F3A] transition"
                    onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}>
                    {showPw.new ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[#0B1F3A] text-sm font-bold mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    className={input}
                    type={showPw.confirm ? "text" : "password"}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                    placeholder="Repeat new password"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1F3A]/40 hover:text-[#0B1F3A] transition"
                    onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}>
                    {showPw.confirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={passwordSaving}
                className={`px-6 py-2.5 rounded text-sm ${btnNavy} disabled:opacity-50`}
              >
                {passwordSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Account Details (read-only) ── */}
        <div className={`${card} p-6 space-y-4`}>
          <h3 className={`${display} text-[#0B1F3A] font-bold text-lg`}>Account Details</h3>
          <div className="divide-y divide-[#0B1F3A]/10">
            <div className="flex items-center justify-between py-3">
              <span className="text-[#0B1F3A]/60 text-sm font-semibold">Username</span>
              <span className="text-[#0B1F3A] font-bold font-mono text-sm">@{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#0B1F3A]/60 text-sm font-semibold">Role</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${badge(role)}`}>
                {role}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#0B1F3A]/60 text-sm font-semibold">Member since</span>
              <span className="text-[#0B1F3A] font-bold text-sm">
                {user.date_joined
                  ? new Date(user.date_joined).toLocaleDateString("en-KE", {
                      year: "numeric", month: "long", day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;