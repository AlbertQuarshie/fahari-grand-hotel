import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { usePageTitle } from "../../hooks/usePageTitle";
import { display, body, input, btnPrimary } from "../../constants/theme";

const Register = () => {
  usePageTitle("Register");
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const { register: registerGuest } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await registerGuest({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4 py-10 ${body}`}>
      <div className="w-full max-w-2xl bg-white rounded border border-[#0B1F3A]/10 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className={`${display} text-3xl font-bold text-[#0B1F3A]`}>Fahari Grand</h1>
          <p className="text-[#C9A24B] text-sm italic font-semibold">Create your guest account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">First Name</label>
              <input {...register("firstName", { required: true })} className={input} />
            </div>
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Last Name</label>
              <input {...register("lastName", { required: true })} className={input} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Username</label>
              <input
                type="text"
                {...register("username", { required: "Username is required" })}
                className={input}
              />
              {errors.username && (
                <p className="text-red-700 text-xs mt-1 font-semibold">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Email</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className={input}
              />
              {errors.email && (
                <p className="text-red-700 text-xs mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Phone</label>
              <input
                type="tel"
                placeholder="2547XXXXXXXX"
                {...register("phone", { required: "Phone number is required" })}
                className={input}
              />
              {errors.phone && (
                <p className="text-red-700 text-xs mt-1 font-semibold">{errors.phone.message}</p>
              )}
            </div>
            <div />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Password</label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
                className={input}
              />
              {errors.password && (
                <p className="text-red-700 text-xs mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#0B1F3A] font-bold mb-1">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword", {
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
                className={input}
              />
              {errors.confirmPassword && (
                <p className="text-red-700 text-xs mt-1 font-semibold">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 rounded text-sm ${btnPrimary}`}
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-[#0B1F3A] font-semibold">
          Already have an account?{" "}
          <Link to="/login" className="text-[#C9A24B] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;