import { Link } from "react-router-dom";

const categories = [
  {
    name: "Mobile Display",
    slug: "display",
    color: "bg-blue-50 text-blue-600",
    icon: "D",
  },
  {
    name: "Battery",
    slug: "battery",
    color: "bg-green-50 text-green-600",
    icon: "B",
  },
  {
    name: "Charging Port",
    slug: "charging-port",
    color: "bg-yellow-50 text-yellow-600",
    icon: "C",
  },
  {
    name: "Speaker",
    slug: "speaker",
    color: "bg-purple-50 text-purple-600",
    icon: "S",
  },
  {
    name: "Camera Module",
    slug: "camera",
    color: "bg-pink-50 text-pink-600",
    icon: "C",
  },
  {
    name: "Back Panel",
    slug: "back-panel",
    color: "bg-orange-50 text-orange-600",
    icon: "B",
  },
  {
    name: "Motherboard",
    slug: "motherboard",
    color: "bg-red-50 text-red-600",
    icon: "M",
  },
  {
    name: "Laptop Parts",
    slug: "laptop-parts",
    color: "bg-indigo-50 text-indigo-600",
    icon: "L",
  },
];

export default function Categories() {
  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Electronics Categories
        </h1>
        <p className="text-slate-600">No categories available right now.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">
        Electronics Categories
      </h1>

      <p className="mb-8 text-slate-600">
        Browse mobile and electronics spare parts by category.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            to="/sell"
            state={{ category: category.name, slug: category.slug }}
            aria-label={`Go to sell page for ${category.name}`}
            title={`Sell ${category.name}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
          >
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${category.color}`}
            >
              {category.icon}
            </div>

            <h2 className="text-lg font-semibold text-slate-800 transition group-hover:text-blue-600">
              {category.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sell your {category.name.toLowerCase()} parts
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}