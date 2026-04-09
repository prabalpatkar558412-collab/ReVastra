import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { key: "user-login", label: "User Login" },
  { key: "user-register", label: "User Register" },
  { key: "collector-login", label: "Collector Login" },
  { key: "recycler-login", label: "Recycler Login" },
  { key: "admin-login", label: "Admin Login" },
];

function getRedirectPath(role, fallbackPath) {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "collector") {
    return "/collector";
  }
  if (role === "recycler") {
    return "/recycler";
  }
  return fallbackPath || "/dashboard";
}

function getExpectedRole(activeTab) {
  if (activeTab === "admin-login") {
    return "admin";
  }
  if (activeTab === "collector-login") {
    return "collector";
  }
  if (activeTab === "recycler-login") {
    return "recycler";
  }
  return "user";
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, login, register } = useAuth();

  const [activeTab, setActiveTab] = useState("user-login");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      if (activeTab === "user-register") {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        navigate("/dashboard", { replace: true });
        return;
      }

      const user = await login({
        email: formData.email,
        password: formData.password,
        role: getExpectedRole(activeTab),
      });

      const redirectPath = getRedirectPath(
        user.role,
        location.state?.from?.pathname
      );

      navigate(redirectPath, {
        replace: true,
        state: location.state?.from?.state,
      });
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">Secure Access</p>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Login To ReVastra
          </h1>
          <p className="text-gray-500">
            Consumers, collectors, certified recyclers, and platform admins can
            access their dedicated dashboards from here.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setErrorMessage("");
                }}
                className={`rounded-xl px-4 py-3 font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "admin-login" ? (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Admin login uses the seeded admin account configured in the
              backend `.env`.
            </div>
          ) : null}

          {activeTab === "collector-login" ? (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              Demo collector account: collector@revastra.com / Collector@123
            </div>
          ) : null}

          {activeTab === "recycler-login" ? (
            <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
              Demo recycler accounts are seeded from the recycler directory. For
              example: greencycle@revastra.com / Recycler@123
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === "user-register" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-70"
            >
              {isLoading
                ? "Please wait..."
                : activeTab === "user-register"
                ? "Create User Account"
                : activeTab === "admin-login"
                ? "Login As Admin"
                : activeTab === "collector-login"
                ? "Login As Collector"
                : activeTab === "recycler-login"
                ? "Login As Recycler"
                : "Login As User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
