import { Link } from "react-router-dom";

const categories = [
  { name: "Mobile Display", slug: "display" },
  { name: "Battery", slug: "battery" },
  { name: "Charging Port", slug: "charging-port" },
  { name: "Speaker", slug: "speaker" },
  { name: "Camera Module", slug: "camera" },
  { name: "Back Panel", slug: "back-panel" },
  { name: "Motherboard", slug: "motherboard" },
  { name: "Laptop Parts", slug: "laptop-parts" },
];

export default function Categories() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
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
            to={`/category/${category.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
              {category.name.charAt(0)}
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              {category.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View all {category.name.toLowerCase()} parts
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}