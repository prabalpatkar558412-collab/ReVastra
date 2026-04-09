import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="rounded-[2rem] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50 p-8 md:p-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Take action now
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-slate-900">
              Every unused device can create value and positive impact.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed max-w-2xl">
              Start with one device and contribute to a more circular electronics ecosystem.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:justify-end gap-4">
            <Link
              to="/sell"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
            >
              Start Selling
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}