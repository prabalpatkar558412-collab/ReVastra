import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-gray-950 to-emerald-900/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-semibold tracking-wide">India&apos;s Smart E-Waste Circular Economy Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
              Turn Your <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">E-Waste</span>
              <br />Into Real Value
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              AI-powered device valuation, doorstep pickup, certified recycling, and transparent material recovery — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/sell"
                className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5">
                Recycle Now {"\u2192"}
              </Link>
              <Link to={isAuthenticated ? "/dashboard" : "/login"}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all backdrop-blur-sm hover:-translate-y-0.5">
                {isAuthenticated ? "Go to Dashboard" : "Login"}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { num: "50M+", label: "Tons E-Waste/Year in India", icon: "\u26A0\uFE0F" },
                { num: "95%", label: "Materials Recoverable", icon: "\u267B\uFE0F" },
                { num: "4+", label: "Role-Based Dashboards", icon: "\uD83D\uDCCA" },
                { num: "AI", label: "Powered Validation", icon: "\uD83E\uDD16" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-black text-white">{s.num}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-green-400 font-semibold text-sm tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-black">Four Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Submit Device", desc: "Upload photos & details. Our AI validates the device and checks authenticity in seconds.", color: "green", icon: "\uD83D\uDCF1" },
              { step: "02", title: "Get Valuation", desc: "Real-time pricing with gold, copper, lithium breakdown. Know exactly what your device is worth.", color: "blue", icon: "\uD83D\uDCB0" },
              { step: "03", title: "Doorstep Pickup", desc: "Choose a certified recycler, schedule a pickup. Our collector picks it up from your door.", color: "yellow", icon: "\uD83D\uDE9A" },
              { step: "04", title: "Get Paid", desc: "Track recycling progress. Receive payment via UPI + earn reward points + see your environmental impact.", color: "purple", icon: "\u2705" },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className={`bg-gradient-to-br from-${item.color}-500/10 to-transparent border border-${item.color}-500/20 rounded-3xl p-6 h-full transition-all hover:border-${item.color}-500/40 hover:-translate-y-1`}>
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                  <span className={`text-${item.color}-400 text-xs font-bold tracking-widest`}>STEP {item.step}</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gray-900/50" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-green-400 font-semibold text-sm tracking-widest uppercase mb-3">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-black">Everything You Need</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "\uD83E\uDD16", title: "AI Device Validation", desc: "Gemini 2.5 Flash verifies uploaded device photos for authenticity before processing." },
              { icon: "\uD83D\uDCB8", title: "Real-Time Valuation", desc: "Component-wise breakdown: gold, copper, lithium, plastic with live market rates." },
              { icon: "\uD83D\uDDFA\uFE0F", title: "Recycler Matching", desc: "Smart recommendation engine ranks recyclers by distance, rating, and pickup availability." },
              { icon: "\uD83D\uDE9A", title: "Live Pickup Tracking", desc: "Track your collector agent in real-time with distance, ETA, and route visualization." },
              { icon: "\uD83C\uDF0D", title: "Environmental Impact", desc: "See CO2 saved, energy conserved, trees saved, and your personal sustainability score." },
              { icon: "\uD83D\uDD12", title: "Secure & Transparent", desc: "JWT authentication, role-based dashboards, audit trails, and invoice downloads." },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all hover:-translate-y-1">
                <span className="text-4xl mb-4 block">{f.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-green-400 font-semibold text-sm tracking-widest uppercase mb-3">Multi-Role Platform</p>
            <h2 className="text-4xl md:text-5xl font-black">Dashboards For Everyone</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { role: "Consumer", path: "/sell", icon: "\uD83D\uDC64", color: "green", features: ["Submit devices with AI validation", "Real-time value estimation", "Schedule doorstep pickup", "Track pickup & recycling status", "Download invoices & receipts", "Environmental impact dashboard"] },
              { role: "Collector", path: "/login", icon: "\uD83D\uDE9A", color: "blue", features: ["View assigned pickups for today", "Google Maps navigation & routing", "Photo proof capture on pickup", "Status updates (Reached → Picked → Delivered)", "Earnings tracking & withdrawal", "Online/Offline availability toggle"] },
              { role: "Recycler", path: "/login", icon: "\uD83C\uDFED", color: "purple", features: ["Accept/Reject incoming requests", "Inventory management by category", "Material recovery report (Gold, Cu, Li)", "Payment management with commission", "Performance rating & leaderboard", "Compliance certificates & reports"] },
              { role: "Admin", path: "/login", icon: "\uD83D\uDC51", color: "yellow", features: ["Overview with all key metrics", "User & Recycler management", "Transaction & dispute handling", "Pricing controls for materials", "Analytics charts & reports", "Commission & notification settings"] },
            ].map((r) => (
              <div key={r.role} className={`bg-gradient-to-br from-${r.color}-500/5 to-transparent border border-${r.color}-500/20 rounded-3xl p-8 hover:border-${r.color}-500/40 transition-all`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{r.icon}</span>
                  <h3 className="text-2xl font-bold">{r.role} Dashboard</h3>
                </div>
                <ul className="space-y-2 mb-6">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className={`text-${r.color}-400`}>{"\u2713"}</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={r.path} className={`inline-block bg-${r.color}-500/10 hover:bg-${r.color}-500/20 border border-${r.color}-500/30 text-${r.color}-400 px-5 py-2 rounded-xl text-sm font-semibold transition-all`}>
                  {r.role === "Consumer" ? "Start Now" : "Login"} {"\u2192"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gray-900/30" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <p className="text-green-400 font-semibold text-sm tracking-widest uppercase mb-3">Built With</p>
          <h2 className="text-3xl font-black mb-10">Modern Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["React 19", "Vite 8", "Tailwind CSS", "Express 5", "Firebase", "Gemini AI", "JWT Auth", "Google Maps"].map((t) => (
              <span key={t} className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm text-gray-400 font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 to-emerald-900/30" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Recycle <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Responsibly</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join the circular economy. Submit your old devices, get fair value, and make a real environmental impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sell" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5">
              Get Started Free {"\u2192"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
