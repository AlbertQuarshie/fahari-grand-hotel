import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { usePageTitle } from "../../hooks/usePageTitle";
import { display, body, input, btnPrimary } from "../../constants/theme";

const roleRedirects = {
  guest: "/guest/rooms",
  receptionist: "/receptionist/roster",
  housekeeper: "/housekeeper/tasks",
  admin: "/admin/dashboard",
};

const Login = () => {
  usePageTitle("Sign In");
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const user = await login(formData.username, formData.password);
      navigate(roleRedirects[user.role] || "/");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Invalid username or password. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4 ${body}`}>
      <div className="w-full max-w-md bg-white rounded border border-[#0B1F3A]/10 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className={`${display} text-3xl font-bold text-[#0B1F3A]`}>Fahari Grand</h1>
          <p className="text-[#C9A24B] text-sm italic font-semibold">Where magnificence lives.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Username</label>
            <input
              type="text"
              {...register("username", { required: "Username is required" })}
              className={input}
              placeholder="yourusername"
            />
            {errors.username && (
              <p className="text-red-700 text-xs mt-1 font-semibold">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className={input}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-700 text-xs mt-1 font-semibold">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[#0B1F3A] font-semibold">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-[#C9A24B] font-bold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
