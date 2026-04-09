import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Recycle } from "lucide-react";
import StatsCard from "./StatsCard";
import HeroSlider from "./HeroSlider";

function HeroSection({
  impactStats = [],
  sliderImages = [],
  activeIndex = 0,
  brokenImages = {},
  goPrev,
  goNext,
  setActiveIndex,
  handleImageError,
  supportedDevices = [],
}) {
  const renderedStats = useMemo(
    () =>
      impactStats.map((stat) => (
        <StatsCard key={stat.id ?? stat.label} stat={stat} />
      )),
    [impactStats]
  );

  return (
    <section
      className="relative overflow-hidden pt-6 md:pt-8 pb-14"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_25%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_20%)]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
              <Recycle size={16} />
              Smart E-Waste Circular Economy Platform
            </div>

            <h1
              id="hero-heading"
              className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              E-waste is not just trash.
              <span className="mt-2 block text-emerald-600">
                It is a serious environmental challenge.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              ReVastra helps users convert unused electronics into value through
              smart evaluation, trusted recycling, easy pickups, and transparent
              impact tracking.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-emerald-700"
              >
                Sell Your Device
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                View Dashboard
              </Link>
            </div>

            {impactStats.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {renderedStats}
              </div>
            )}
          </div>

          <div className="relative -mt-1 md:-mt-2">
            <HeroSlider
              sliderImages={sliderImages}
              activeIndex={activeIndex}
              brokenImages={brokenImages}
              goPrev={goPrev}
              goNext={goNext}
              setActiveIndex={setActiveIndex}
              handleImageError={handleImageError}
              supportedDevices={supportedDevices}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);