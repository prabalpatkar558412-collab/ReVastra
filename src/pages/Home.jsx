import { useEffect, useMemo, useState } from "react";
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

import img1 from "../assets/image-1.jpeg";
import img2 from "../assets/image-2.jpeg";
import img3 from "../assets/image-3.jpeg";

export default function Home() {
  const sliderImages = useMemo(
    () => [
      {
        src: img1,
        title: "Mountains of discarded electronics",
        subtitle:
          "E-waste is one of the fastest-growing waste streams in the world.",
      },
      {
        src: img2,
        title: "Toxic disposal harms communities",
        subtitle:
          "Improper recycling can release hazardous materials into soil, water, and air.",
      },
      {
        src: img3,
        title: "Circular reuse creates real value",
        subtitle:
          "Devices can be repaired, resold, recycled, and tracked transparently.",
      },
    ],
    []
  );

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
      label: "recoverable parts and materials",
      icon: BarChart3,
    },
  ];

  const features = [
    {
      title: "Smart Device Evaluation",
      desc: "Get transparent value estimation for old, broken, or unused electronics.",
      icon: Smartphone,
    },
    {
      title: "Verified Recycler Network",
      desc: "Connect only with trusted recyclers and refurbishers.",
      icon: ShieldCheck,
    },
    {
      title: "Doorstep Pickup",
      desc: "Schedule a smooth pickup experience without confusion.",
      icon: Truck,
    },
    {
      title: "Impact Tracking",
      desc: "See your carbon savings, earnings, and material recovery in one place.",
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

  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    if (!sliderImages.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const handleImageError = (index) => {
    setBrokenImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-20 pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_25%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_20%)]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-6">
                <Recycle size={16} />
                Smart E-Waste Circular Economy Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
                E-waste is not just trash.
                <span className="block text-emerald-600 mt-2">
                  It is a serious environmental challenge.
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
                ReVastra helps users convert unused electronics into value through
                smart evaluation, trusted recycling, easy pickups, and transparent
                impact tracking.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
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

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {impactStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                          <Icon size={18} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Slider */}
            <div className="relative -mt-10 md:-mt-16">
              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl">
                <div className="relative h-[380px] md:h-[500px] overflow-hidden rounded-[1.6rem]">
                  {!brokenImages[activeIndex] ? (
                    <img
                      src={sliderImages[activeIndex].src}
                      alt={sliderImages[activeIndex].title}
                      onError={() => handleImageError(activeIndex)}
                      className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500 text-center px-6">
                      Image not found. Please check your image file names.
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute left-0 right-0 bottom-0 p-6 md:p-8">
                    <div className="max-w-lg rounded-3xl bg-white/85 p-5 backdrop-blur-md shadow-lg">
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 mb-3 font-semibold">
                        Why this matters
                      </p>
                      <h2 className="text-2xl font-bold leading-tight text-slate-900">
                        {sliderImages[activeIndex].title}
                      </h2>
                      <p className="mt-3 text-slate-700 leading-relaxed">
                        {sliderImages[activeIndex].subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-3 text-slate-900 shadow transition hover:bg-white"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-3 text-slate-900 shadow transition hover:bg-white"
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
                          activeIndex === index
                            ? "w-8 bg-emerald-500"
                            : "w-2.5 bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-4 hidden md:block rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
                <p className="text-sm text-slate-500">Devices supported</p>
                <div className="mt-3 flex items-center gap-3 text-slate-700">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Smartphone size={18} />
                  </div>
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Laptop size={18} />
                  </div>
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Cpu size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Accepted categories
              </p>
              <h3 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
                Built for individuals, offices, and responsible recycling partners
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            The ReVastra process
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            A clean and simple experience for responsible e-waste management
          </h2>
          <p className="mt-5 text-slate-600 leading-relaxed">
            ReVastra makes e-waste handling structured, easy, transparent, and
            meaningful for every user.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon size={20} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
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
    </div>
  );
}