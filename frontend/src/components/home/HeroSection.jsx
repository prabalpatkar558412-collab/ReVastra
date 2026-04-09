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
      className="relative overflow-hidden pt-4 md:pt-6 pb-8 md:pb-10"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_25%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_20%)]" />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs md:text-sm font-medium text-emerald-700 shadow-sm">
              <Recycle size={15} />
              Smart E-Waste Circular Economy Platform
            </div>

            <h1
              id="hero-heading"
              className="text-3xl font-bold leading-snug tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
            >
              E-waste is not just trash.
              <span className="block text-emerald-600">
                It is a serious environmental challenge.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-base md:text-lg leading-7 text-slate-600">
              ReVastra helps users convert unused electronics into value through
              smart evaluation, trusted recycling, easy pickups, and transparent
              impact tracking.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700"
              >
                Sell Your Device
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                View Dashboard
              </Link>
            </div>

            {impactStats.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {renderedStats}
              </div>
            )}
          </div>

          <div className="relative">
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