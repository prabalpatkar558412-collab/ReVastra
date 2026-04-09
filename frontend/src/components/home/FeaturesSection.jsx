import { motion } from "framer-motion";

export default function FeaturesSection({ features = [] }) {
  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-emerald-600 font-semibold uppercase tracking-wide">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            Why people choose our platform
          </h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Designed to make e-waste management simple, transparent, and useful
            for both individuals and organizations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-xl transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-7">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}