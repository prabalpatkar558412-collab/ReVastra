export default function StatsCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
          <Icon size={18} />
        </div>
        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{stat.label}</p>
    </div>
  );
}