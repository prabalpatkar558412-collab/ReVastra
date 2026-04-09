import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider({
  sliderImages,
  activeIndex,
  brokenImages,
  goPrev,
  goNext,
  setActiveIndex,
  handleImageError,
  supportedDevices,
}) {
  return (
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
          {supportedDevices.map((Icon, index) => (
            <div key={index} className="rounded-xl bg-slate-100 p-3">
              <Icon size={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}