import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  if (isHome) {
    return (
      <footer className="bg-gray-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-black text-white mb-3">ReVastra <span className="text-green-400">{"\u267B\uFE0F"}</span></h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                India&apos;s smart circular economy platform for responsible e-waste recycling with AI-powered valuation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Platform</h3>
              <div className="flex flex-col gap-2">
                <Link to="/sell" className="text-gray-500 hover:text-green-400 text-sm transition">Sell Device</Link>
                <Link to="/login" className="text-gray-500 hover:text-green-400 text-sm transition">Login</Link>
                <Link to="/dashboard" className="text-gray-500 hover:text-green-400 text-sm transition">Dashboard</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Features</h3>
              <div className="flex flex-col gap-2 text-gray-500 text-sm">
                <span>{"\uD83E\uDD16"} AI Device Validation</span>
                <span>{"\uD83D\uDCB8"} Material Valuation</span>
                <span>{"\uD83D\uDE9A"} Doorstep Pickup</span>
                <span>{"\uD83C\uDF0D"} Impact Tracking</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {["React", "Vite", "Express", "Firebase", "Gemini AI"].map(t => (
                  <span key={t} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-500">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-600 text-sm">{"\u00A9"} 2026 ReVastra. All rights reserved.</p>
            <p className="text-gray-700 text-xs">Built for sustainable tech {"\u267B\uFE0F"}</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">ReVastra {"\u267B\uFE0F"}</span>
            <span className="text-gray-400 text-sm">&mdash; E-Waste Circular Economy</span>
          </div>
          <p className="text-gray-500 text-sm">{"\u00A9"} 2026 ReVastra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}