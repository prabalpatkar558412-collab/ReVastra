export default function CategoriesSection({ categories }) {
  return (
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
  );
}