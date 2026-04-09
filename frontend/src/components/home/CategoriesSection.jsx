import { motion } from "framer-motion";

export default function CategoriesSection({ categories = [] }) {
  return (
    <section className="py-16 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-emerald-600 font-semibold uppercase tracking-wide">
            Categories
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            What we help you recycle
          </h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Explore the most common e-waste categories we support for resale,
            refurbishment, and responsible recycling.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow-lg transition"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {index + 1}
              </div>
              <h3 className="text-sm md:text-base font-semibold text-slate-800">
                {category}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}