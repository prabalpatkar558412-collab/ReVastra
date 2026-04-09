import { motion } from "framer-motion";

export default function CategoriesSection({ categories = [] }) {
  return (
    <section className="bg-slate-50 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="font-semibold uppercase tracking-wide text-emerald-600">
            Categories
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            What we help you recycle
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Explore the most common e-waste categories we support for resale,
            refurbishment, and responsible recycling.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
            >
              <div className="relative h-28 w-full overflow-hidden sm:h-32">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
              </div>

              <div className="p-4 text-center">
                <h3 className="text-sm font-semibold text-slate-800 md:text-base">
                  {category.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}