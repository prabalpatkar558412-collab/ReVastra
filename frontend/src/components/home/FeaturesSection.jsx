export default function FeaturesSection({ features }) {
  return (
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
              <h3 className="text-xl font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}