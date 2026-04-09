import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Recycle,
  ShieldCheck,
  Truck,
  Leaf,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Smartphone,
  Laptop,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sliderImages = [
  {
    src: "/images/image 1.jpg",
    title: "Mountains of discarded electronics",
    subtitle: "E-waste is one of the fastest-growing waste streams in the world.",
  },
  {
    src: "/images/image 2.jpg",
    title: "Toxic disposal harms communities",
    subtitle: "Improper recycling can release hazardous materials into soil, water, and air.",
  },
  {
    src: "/images/image 3.jpg",
    title: "Circular reuse creates real value",
    subtitle: "Devices can be repaired, resold, recycled, and tracked transparently.",
  },
];

const impactStats = [
  {
    value: "62M+",
    label: "tons of e-waste generated globally",
    icon: Cpu,
  },
  {
    value: "< 25%",
    label: "properly collected and recycled",
    icon: Recycle,
  },
  {
    value: "1000s",
    label: "of recoverable components and materials",
    icon: BarChart3,
  },
];

const features = [
  {
    title: "Smart Device Evaluation",
    desc: "Assess old, broken, or unused electronics with transparent value estimation.",
    icon: Smartphone,
  },
  {
    title: "Verified Recycler Network",
    desc: "Compare pickup options and connect only with trusted recyclers and refurbishers.",
    icon: ShieldCheck,
  },
  {
    title: "Doorstep Pickup Flow",
    desc: "Schedule convenient collection for your devices without friction or uncertainty.",
    icon: Truck,
  },
  {
    title: "Impact Tracking Dashboard",
    desc: "See carbon savings, material recovery, and earnings in one clean dashboard.",
    icon: Leaf,
  },
];

const categories = [
  "Mobiles & Tablets",
  "Laptops & PCs",
  "Accessories",
  "Home Electronics",
  "Broken Devices",
  "Office E-Waste",
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % sliderImages.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_25%),radial-gradient(circle_at_left,rgba(59,130,246,0.14),transparent_20%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.7),rgba(2,6,23,0.96))]" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 mb-6"
              >
                <Recycle size={16} />
                Smart E-Waste Circular Economy Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              >
                E-waste is not just trash.
                <span className="block text-emerald-400">It is an urgent environmental problem.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl"
              >
                ReVastra helps people turn unused electronics into measurable value through
                smarter evaluation, trusted recycling, scheduled pickups, and transparent impact tracking.
                The experience should feel modern, credible, and mission-driven from the first glance.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/sell"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                >
                  Sell Your Device
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  View Dashboard
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {impactStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-xl bg-emerald-400/15 p-2 text-emerald-300">
                          <Icon size={18} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{stat.label}</p>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
                <div className="relative h-[430px] md:h-[520px] overflow-hidden rounded-[1.6rem]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={sliderImages[activeIndex].src}
                      src={sliderImages[activeIndex].src}
                      alt={sliderImages[activeIndex].title}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  <div className="absolute left-0 right-0 bottom-0 p-6 md:p-8">
                    <div className="max-w-lg rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-3">
                        Why this matters
                      </p>
                      <h2 className="text-2xl font-bold leading-tight">
                        {sliderImages[activeIndex].title}
                      </h2>
                      <p className="mt-3 text-slate-200 leading-relaxed">
                        {sliderImages[activeIndex].subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-3 text-white backdrop-blur-md transition hover:bg-black/50"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-3 text-white backdrop-blur-md transition hover:bg-black/50"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {sliderImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          activeIndex === index ? "w-8 bg-emerald-400" : "w-2.5 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 hidden md:block rounded-3xl border border-emerald-400/20 bg-slate-900/90 p-5 shadow-xl">
                <p className="text-sm text-slate-400">Devices supported</p>
                <div className="mt-3 flex items-center gap-3 text-slate-200">
                  <div className="rounded-xl bg-slate-800 p-3"><Smartphone size={18} /></div>
                  <div className="rounded-xl bg-slate-800 p-3"><Laptop size={18} /></div>
                  <div className="rounded-xl bg-slate-800 p-3"><Cpu size={18} /></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Accepted categories
              </p>
              <h3 className="mt-2 text-2xl md:text-3xl font-bold text-white">
                Built for consumers, offices, and responsible recycling partners
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              The ReVastra process
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              A premium experience for a serious sustainability challenge
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed max-w-2xl">
              Instead of treating disposal like an afterthought, ReVastra turns e-waste management into a
              guided, data-backed journey. Users should instantly understand both the urgency of the problem and
              the simplicity of taking action.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-6 shadow-xl"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-slate-300 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-[2rem] border border-emerald-400/15 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-blue-500/10 p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Take action now
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                Every unused device is a missed opportunity for recovery and impact.
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed max-w-2xl">
                Start with one device. Create value for yourself while reducing landfill pressure and supporting a more circular electronics economy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:justify-end gap-4">
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Start Selling
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Explore Impact Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
