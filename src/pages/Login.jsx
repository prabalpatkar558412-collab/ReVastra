import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isFirebaseClientConfigured } from "../lib/firebaseClient";

const roleConfigs = [
  {
    key: "user",
    shortLabel: "User",
    heading: "Consumer Access",
    description:
      "Submit devices, compare offers, book pickups, and track your e-waste impact.",
    accent: "green",
    icon: "User",
    registerHeading: "Create Consumer Account",
    registerDescription:
      "Start with a personal account to add devices, get AI-powered valuation, and schedule pickups.",
  },
  {
    key: "collector",
    shortLabel: "Collector",
    heading: "Collector Operations Access",
    description:
      "Manage assigned pickups, route planning, handoff updates, and earnings visibility.",
    accent: "amber",
    icon: "Truck",
    registerHeading: "Register Collector Partner",
    registerDescription:
      "Create a local scrap collection account with your service area and partner details.",
  },
  {
    key: "recycler",
    shortLabel: "Recycler",
    heading: "Recycler Partner Access",
    description:
      "Review incoming devices, verify recovery value, and update processing stages.",
    accent: "sky",
    icon: "Factory",
    registerHeading: "Register Recycler Partner",
    registerDescription:
      "Create a recycler account for your organization and onboarding region.",
  },
  {
    key: "admin",
    shortLabel: "Admin",
    heading: "Platform Admin Access",
    description:
      "Monitor the marketplace, manage partner operations, and oversee system-level performance.",
    accent: "rose",
    icon: "Shield",
    registerHeading: "Platform Admin Access",
    registerDescription:
      "Admin accounts remain controlled by the platform and cannot be self-registered.",
  },
];

const accentClasses = {
  green: {
    badge: "border-green-400/25 bg-green-400/10 text-green-300",
    activeTab:
      "border-green-400/40 bg-green-400 text-gray-950 shadow-lg shadow-green-400/25",
    button:
      "from-green-400 via-emerald-400 to-green-500 text-gray-950 shadow-green-400/25",
    buttonHover:
      "hover:from-green-300 hover:via-emerald-300 hover:to-green-400",
    focus: "focus:ring-green-400/30 focus:border-green-400/40",
    hint: "border-green-400/20 bg-green-400/10 text-green-200",
    subtle: "border-green-400/20 bg-green-400/10 text-green-100",
  },
  amber: {
    badge: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    activeTab:
      "border-amber-300/40 bg-amber-300 text-gray-950 shadow-lg shadow-amber-300/25",
    button:
      "from-amber-300 via-yellow-300 to-amber-400 text-gray-950 shadow-amber-300/25",
    buttonHover:
      "hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300",
    focus: "focus:ring-amber-300/30 focus:border-amber-300/40",
    hint: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    subtle: "border-amber-300/20 bg-amber-300/10 text-amber-50",
  },
  sky: {
    badge: "border-sky-300/25 bg-sky-300/10 text-sky-200",
    activeTab:
      "border-sky-300/40 bg-sky-300 text-gray-950 shadow-lg shadow-sky-300/25",
    button:
      "from-sky-300 via-cyan-300 to-sky-400 text-gray-950 shadow-sky-300/25",
    buttonHover:
      "hover:from-sky-200 hover:via-cyan-200 hover:to-sky-300",
    focus: "focus:ring-sky-300/30 focus:border-sky-300/40",
    hint: "border-sky-300/20 bg-sky-300/10 text-sky-100",
    subtle: "border-sky-300/20 bg-sky-300/10 text-sky-50",
  },
  rose: {
    badge: "border-rose-300/25 bg-rose-300/10 text-rose-200",
    activeTab:
      "border-rose-300/40 bg-rose-300 text-gray-950 shadow-lg shadow-rose-300/25",
    button:
      "from-rose-300 via-pink-300 to-rose-400 text-gray-950 shadow-rose-300/25",
    buttonHover:
      "hover:from-rose-200 hover:via-pink-200 hover:to-rose-300",
    focus: "focus:ring-rose-300/30 focus:border-rose-300/40",
    hint: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    subtle: "border-rose-300/20 bg-rose-300/10 text-rose-50",
  },
};

const demoCredentials = {
  collector: {
    email: "collector@revastra.com",
    password: "Collector@123",
  },
  recycler: {
    email: "greencycle@revastra.com",
    password: "Recycler@123",
  },
  admin: {
    email: "admin@revastra.com",
    password: "Admin@12345",
  },
};

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h11v8H3Z" />
      <path d="M14 10h4l3 3v2h-7Z" />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}

function FactoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21V9l6 3V9l6 3V4l6 3v14Z" />
      <path d="M3 21h18" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 5 6v6c0 5 3.2 7.8 7 9 3.8-1.2 7-4 7-9V6Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.3" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" />
      <path d="m19 14 .8 1.9L22 16.7l-2.2.8L19 19.5l-.8-2-2.2-.8 2.2-.8Z" />
      <path d="m5 14 .8 1.9L8 16.7l-2.2.8L5 19.5l-.8-2-2.2-.8 2.2-.8Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12.24 10.285v3.821h5.445c-.24 1.542-1.798 4.523-5.445 4.523-3.278 0-5.949-2.713-5.949-6.059s2.671-6.06 5.949-6.06c1.867 0 3.114.796 3.828 1.483l2.611-2.52C17.01 3.92 14.867 3 12.24 3 7.444 3 3.555 6.89 3.555 11.685s3.889 8.685 8.685 8.685c5.01 0 8.33-3.52 8.33-8.484 0-.57-.062-1.005-.138-1.601Z" />
      <path fill="#34A853" d="M3.555 7.153 6.7 9.46c.85-1.682 2.596-2.95 5.54-2.95 1.867 0 3.114.796 3.828 1.483l2.611-2.52C17.01 3.92 14.867 3 12.24 3 8.905 3 6.01 4.91 4.613 7.684Z" />
      <path fill="#FBBC05" d="M3.555 16.217 6.7 13.91c.79 2.37 2.981 4.086 5.54 4.086 3.647 0 5.205-2.98 5.445-4.523h-5.445v-3.821h8.191c.076.596.138 1.03.138 1.601 0 4.964-3.32 8.484-8.33 8.484-4.796 0-8.685-3.89-8.685-8.685 0-1.44.35-2.799 1.059-3.835Z" />
      <path fill="#4285F4" d="M20.57 11.252c0-.57-.062-1.005-.138-1.601h-8.192v3.821h5.445a4.66 4.66 0 0 1-1.998 3.058l3.072 2.385c1.792-1.653 2.811-4.088 2.811-7.663Z" />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 15 15" />
      <path d="M9.9 5.1A11.4 11.4 0 0 1 12 5c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.1 3.9" />
      <path d="M6.5 6.5A17.4 17.4 0 0 0 2 12s3.5 7 10 7a11.8 11.8 0 0 0 4.2-.7" />
    </svg>
  );
}

function renderIcon(icon) {
  if (icon === "Truck") return <TruckIcon />;
  if (icon === "Factory") return <FactoryIcon />;
  if (icon === "Shield") return <ShieldIcon />;
  if (icon === "Sparkles") return <SparklesIcon />;
  return <UserIcon />;
}

function getRedirectPath(role, fallbackPath) {
  if (role === "admin") return "/admin";
  if (role === "collector") return "/collector";
  if (role === "recycler") return "/recycler";
  return fallbackPath || "/dashboard";
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, login, loginWithGoogle, register } = useAuth();

  const [selectedRole, setSelectedRole] = useState("user");
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    serviceArea: "",
  });

  const activeRole = useMemo(
    () => roleConfigs.find((role) => role.key === selectedRole) || roleConfigs[0],
    [selectedRole]
  );
  const accent = accentClasses[activeRole.accent] || accentClasses.green;
  const googleConfigured = isFirebaseClientConfigured();
  const isRegisterMode = authMode === "register" && selectedRole !== "admin";
  const showPartnerFields =
    isRegisterMode &&
    (selectedRole === "collector" || selectedRole === "recycler");

  const pageHeading = isRegisterMode
    ? activeRole.registerHeading
    : activeRole.heading;
  const pageDescription = isRegisterMode
    ? activeRole.registerDescription
    : activeRole.description;

  const quickStats = [
    { label: "Users", value: "AI valuation, pickups, payments, and impact tracking" },
    { label: "Collectors", value: "Local sourcing, route management, and handoff visibility" },
    { label: "Recyclers", value: "Final verification and circular recovery operations" },
  ];

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage("");
    setShowPassword(false);

    if (roleKey === "admin") {
      setAuthMode("login");
    }
  };

  const handleModeChange = (nextMode) => {
    if (selectedRole === "admin" && nextMode === "register") {
      return;
    }

    setAuthMode(nextMode);
    setErrorMessage("");
    setShowPassword(false);
  };

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const applyDemoCredentials = () => {
    const demo = demoCredentials[selectedRole];

    if (!demo) return;

    setFormData((previous) => ({
      ...previous,
      email: demo.email,
      password: demo.password,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      if (isRegisterMode) {
        const user = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          organizationName: formData.organizationName,
          serviceArea: formData.serviceArea,
        });

        navigate(getRedirectPath(user.role, location.state?.from?.pathname), {
          replace: true,
          state: location.state?.from?.state,
        });
        return;
      }

      const user = await login({
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });

      navigate(getRedirectPath(user.role, location.state?.from?.pathname), {
        replace: true,
        state: location.state?.from?.state,
      });
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed");
    }
  };

  const handleGoogleContinue = async () => {
    setErrorMessage("");

    try {
      const user = await loginWithGoogle();

      navigate(getRedirectPath(user.role, location.state?.from?.pathname), {
        replace: true,
        state: location.state?.from?.state,
      });
    } catch (error) {
      setErrorMessage(error.message || "Google sign-in failed");
    }
  };

  const currentModeLabel = isRegisterMode
    ? `Register as ${selectedRole}`
    : `Login as ${selectedRole}`;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.10),_transparent_28%),linear-gradient(180deg,_#060b16_0%,_#08101c_45%,_#040811_100%)] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[16%] h-72 w-72 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute bottom-[10%] right-[12%] h-80 w-80 rounded-full bg-sky-400/8 blur-3xl" />
        <div className="absolute left-1/2 top-24 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${accent.badge}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              Secure Access Layer
            </div>

            <div className="mt-10 max-w-xl">
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                Connect the full
                <span className="bg-gradient-to-r from-white via-emerald-200 to-green-300 bg-clip-text text-transparent">
                  {" "}ReVastra chain
                </span>
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
                Consumers, collectors, recyclers, and platform operators all
                enter through one clean access surface, each with the right
                workflow and permissions.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {quickStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Role-first onboarding
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Register new collector and recycler accounts directly from this
                page while keeping admin access controlled.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Faster demo access
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Seeded partner credentials stay available for testing, and user
                accounts can also continue with Google.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Authentication
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {pageHeading}
                </h2>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${accent.badge}`}>
                {renderIcon(activeRole.icon)}
              </div>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-400">
              {pageDescription}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {roleConfigs.map((role) => {
                const roleAccent = accentClasses[role.accent];

                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleRoleChange(role.key)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${
                      selectedRole === role.key
                        ? roleAccent.activeTab
                        : "border-white/8 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {renderIcon(role.icon)}
                    <span>{role.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              {["login", "register"].map((mode) => {
                const disabled = selectedRole === "admin" && mode === "register";
                const isActive = authMode === mode && !disabled;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeChange(mode)}
                    disabled={disabled}
                    className={`flex-1 rounded-[1rem] px-4 py-3 text-sm font-semibold capitalize transition ${
                      isActive
                        ? accent.activeTab
                        : disabled
                        ? "cursor-not-allowed text-slate-600"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {!isRegisterMode && demoCredentials[selectedRole] ? (
              <div className={`mb-5 rounded-2xl border px-4 py-4 ${accent.hint}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      Demo {selectedRole} credentials
                    </p>
                    <p className="mt-1 text-xs opacity-80">
                      {demoCredentials[selectedRole].email} /{" "}
                      {demoCredentials[selectedRole].password}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyDemoCredentials}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Autofill
                  </button>
                </div>
              </div>
            ) : null}

            {selectedRole === "user" ? (
              <div className="mb-5 space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleContinue}
                  disabled={isLoading || !googleConfigured}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                {!googleConfigured ? (
                  <p className="text-xs leading-5 text-slate-500">
                    Add frontend Firebase keys in `.env` and enable Google sign-in
                    in Firebase Authentication to activate this option.
                  </p>
                ) : null}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegisterMode ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {selectedRole === "user" ? "Full Name" : "Contact Person"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={
                      selectedRole === "user"
                        ? "Enter your full name"
                        : "Enter partner contact name"
                    }
                    className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${accent.focus}`}
                    required
                  />
                </div>
              ) : null}

              {showPartnerFields ? (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {selectedRole === "collector"
                        ? "Collection Network Name"
                        : "Recycler Organization Name"}
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder={
                        selectedRole === "collector"
                          ? "Example: City Scrap Connect"
                          : "Example: GreenLoop Recycling Pvt Ltd"
                      }
                      className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${accent.focus}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Service Area
                    </label>
                    <input
                      type="text"
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleChange}
                      placeholder="Example: Gwalior, Bhopal, Indore region"
                      className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${accent.focus}`}
                      required
                    />
                  </div>
                </>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${accent.focus}`}
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
                  >
                    <EyeIcon open={showPassword} />
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    isRegisterMode
                      ? "Create a secure password"
                      : "Enter your password"
                  }
                  className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 ${accent.focus}`}
                  required
                />
              </div>

              <div className={`rounded-2xl border p-4 ${accent.subtle}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Access mode
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {currentModeLabel}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {isRegisterMode
                    ? selectedRole === "user"
                      ? "You will be taken directly to the consumer dashboard after registration."
                      : "Your partner account will be created and then signed in to the matching operations dashboard."
                    : "You will be redirected to the correct dashboard for this role after login."}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-2xl bg-gradient-to-r px-6 py-4 text-sm font-black tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-60 ${accent.button} ${accent.buttonHover}`}
              >
                {isLoading
                  ? "Please wait..."
                  : isRegisterMode
                  ? `Create ${selectedRole.charAt(0).toUpperCase()}${selectedRole.slice(1)} Account`
                  : `Continue as ${selectedRole.charAt(0).toUpperCase()}${selectedRole.slice(1)}`}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
              {selectedRole === "admin" ? (
                <p className="text-slate-500">
                  Admin access stays controlled by the platform owner.
                </p>
              ) : (
                <p className="text-slate-500">
                  {isRegisterMode ? "Already onboarded?" : "New here?"}{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange(isRegisterMode ? "login" : "register")}
                    className="font-semibold text-white transition hover:text-emerald-300"
                  >
                    {isRegisterMode ? "Login instead" : `Register as ${selectedRole}`}
                  </button>
                </p>
              )}

              <p className="text-slate-500">
                Switch roles above any time without leaving this screen.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
