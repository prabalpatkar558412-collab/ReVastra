import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-14 overflow-hidden bg-slate-950 text-slate-300">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 pb-6 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
          {/* Logo + About */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-900/30">
                ♻
              </div>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  E-Waste Platform
                </h2>
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
                  Smart Recycling
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-300/90">
              Responsible e-waste recycling made simple. Sell, recycle, and
              track your electronic waste in a transparent way.
            </p>
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="cursor-pointer text-slate-300 transition hover:translate-x-1 hover:text-emerald-300">
                Home
              </li>
              <li className="cursor-pointer text-slate-300 transition hover:translate-x-1 hover:text-emerald-300">
                Categories
              </li>
              <li className="cursor-pointer text-slate-300 transition hover:translate-x-1 hover:text-emerald-300">
                Sell
              </li>
              <li className="cursor-pointer text-slate-300 transition hover:translate-x-1 hover:text-emerald-300">
                Dashboard
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="min-w-0">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
              Categories
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="transition hover:text-emerald-300">
                Mobiles & Tablets
              </li>
              <li className="transition hover:text-emerald-300">
                Laptops & PCs
              </li>
              <li className="transition hover:text-emerald-300">
                Accessories
              </li>
              <li className="transition hover:text-emerald-300">
                Home Electronics
              </li>
            </ul>
          </div>

          {/* Social + Contact */}
          <div className="min-w-0">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
              Connect
            </h3>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              >
                <Facebook size={18} />
              </button>

              <button
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              >
                <Twitter size={18} />
              </button>

              <button
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              >
                <Instagram size={18} />
              </button>

              <button
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              >
                <Linkedin size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Support Email
              </p>
              <p className="mt-1 break-words text-sm font-medium text-white">
                support@ewaste.com
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center text-sm text-slate-400 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} E-Waste Platform. All rights reserved.</p>
          <p className="text-slate-500">
            Built for a cleaner, smarter circular economy.
          </p>
        </div>
      </div>
    </footer>
  );
}