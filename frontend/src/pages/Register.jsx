import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { User, Recycle, Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { auth, db } from "../firebase";

const roles = [
  {
    value: "user",
    label: "User",
    description: "Sell devices and track submissions.",
    icon: User,
  },
  {
    value: "recycler",
    label: "Recycler",
    description: "Manage recycling-related activity.",
    icon: Recycle,
  },
];

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      await signOut(auth);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      navigate("/login");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-3">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <Shield size={12} />
            ReVastra
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            Create Account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Register to continue with your dashboard.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Full Name
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-500 focus-within:bg-white">
              <User size={16} className="text-slate-400" />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Email Address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-500 focus-within:bg-white">
              <Mail size={16} className="text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-500 focus-within:bg-white">
              <Lock size={16} className="text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Choose Role
            </label>

            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = formData.role === role.value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={`rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <div
                      className={`inline-flex rounded-lg p-1.5 ${
                        isActive
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    <h3 className="mt-2 text-xs font-semibold text-slate-900">
                      {role.label}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Registering..." : "Create Account"}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        {message && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {message}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}