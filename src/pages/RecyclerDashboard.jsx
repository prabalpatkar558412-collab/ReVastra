import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

const DEVICE_WEIGHT_KG = { Phone: 0.17, Laptop: 2.4, Tablet: 0.5, Headphones: 0.25 };
const MATERIAL_YIELD = {
  Phone: { goldG: 0.03, copperKg: 0.015, lithiumKg: 0.005, plasticKg: 0.03 },
  Laptop: { goldG: 0.08, copperKg: 0.05, lithiumKg: 0.02, plasticKg: 0.5 },
  Tablet: { goldG: 0.04, copperKg: 0.02, lithiumKg: 0.01, plasticKg: 0.1 },
  Headphones: { goldG: 0.01, copperKg: 0.01, lithiumKg: 0.003, plasticKg: 0.1 },
};
const MARKET = { goldPerG: 6450, copperPerKg: 785, lithiumPerKg: 6100, plasticPerKg: 42 };
const COMMISSION = 0.05;

function fmt$(v) { return `\u20B9${Number(v || 0).toLocaleString("en-IN")}`; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"; }
function fmtStatus(s) { return String(s || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function daysSince(d) { return d ? Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) : 0; }
function statusClr(s) {
  if (s === "processed") return "bg-green-100 text-green-700";
  if (s === "verified") return "bg-blue-100 text-blue-700";
  if (s === "awaiting_device") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

const TABS = [
  { key: "overview", label: "Overview", icon: "\uD83D\uDCCA" },
  { key: "requests", label: "Requests", icon: "\uD83D\uDCCB" },
  { key: "pickups", label: "Active Pickups", icon: "\uD83D\uDE9A" },
  { key: "inventory", label: "Inventory", icon: "\uD83D\uDCE6" },
  { key: "materials", label: "Material Recovery", icon: "\uD83D\uDD2C" },
  { key: "payments", label: "Payments", icon: "\uD83D\uDCB0" },
  { key: "performance", label: "Performance", icon: "\uD83D\uDCC8" },
  { key: "compliance", label: "Compliance", icon: "\uD83D\uDCC4" },
];

const CERTS = [
  { id: "c1", name: "CPCB Authorization Certificate", issuer: "Central Pollution Control Board", issued: "2025-06-15", expiry: "2026-06-14", status: "active" },
  { id: "c2", name: "State Pollution Board NOC", issuer: "State Pollution Control Board", issued: "2025-01-10", expiry: "2026-01-09", status: "expiring_soon" },
  { id: "c3", name: "ISO 14001 Environmental Management", issuer: "Bureau of Indian Standards", issued: "2024-03-01", expiry: "2027-02-28", status: "active" },
];

export default function RecyclerDashboard() {
  const { authFetch, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [updatingId, setUpdatingId] = useState("");
  const [form, setForm] = useState({ finalVerifiedValue: "", processingMethod: "", recyclerNotes: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [rejectedIds, setRejectedIds] = useState([]);
  const [proofImages, setProofImages] = useState({});
  const [expandedId, setExpandedId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authFetch(`${apiBaseUrl}/recycler-ops/dashboard`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const requests = data?.requests || [];
  const stats = data?.stats || {};

  const pendingReqs = useMemo(() => requests.filter(r => r.recyclerStatus === "awaiting_device" && !rejectedIds.includes(r.pickupId)), [requests, rejectedIds]);
  const activePickups = useMemo(() => requests.filter(r => r.recyclerStatus === "verified"), [requests]);
  const processedReqs = useMemo(() => requests.filter(r => r.recyclerStatus === "processed"), [requests]);

  const inventory = useMemo(() => {
    const received = requests.filter(r => r.recyclerStatus !== "awaiting_device");
    const byCategory = {};
    let totalKg = 0;
    for (const r of received) {
      const t = r.deviceType || "Other";
      const w = DEVICE_WEIGHT_KG[t] || 0.3;
      totalKg += w;
      if (!byCategory[t]) byCategory[t] = { count: 0, kg: 0 };
      byCategory[t].count += 1;
      byCategory[t].kg += w;
    }
    const aging = received.map(r => ({ id: r.pickupId, type: r.deviceType, brand: r.brand, model: r.model, days: daysSince(r.updatedAt || r.createdAt), status: r.recyclerStatus }));
    return { totalKg: +totalKg.toFixed(2), byCategory, aging, count: received.length };
  }, [requests]);

  const materials = useMemo(() => {
    let g = 0, cu = 0, li = 0, pl = 0;
    for (const r of processedReqs) {
      const y = MATERIAL_YIELD[r.deviceType] || MATERIAL_YIELD.Phone;
      g += y.goldG; cu += y.copperKg; li += y.lithiumKg; pl += y.plasticKg;
    }
    const rev = g * MARKET.goldPerG + cu * MARKET.copperPerKg + li * MARKET.lithiumPerKg + pl * MARKET.plasticPerKg;
    return { goldG: +g.toFixed(3), copperKg: +cu.toFixed(3), lithiumKg: +li.toFixed(3), plasticKg: +pl.toFixed(2), revenue: Math.round(rev), count: processedReqs.length };
  }, [processedReqs]);

  const paymentData = useMemo(() => {
    const pending = requests.filter(r => r.paymentStatus !== "processed" && r.recyclerStatus !== "awaiting_device");
    const done = requests.filter(r => r.paymentStatus === "processed");
    const pendingAmt = pending.reduce((s, r) => s + Number(r.finalVerifiedValue || r.finalOffer || 0), 0);
    const doneAmt = done.reduce((s, r) => s + Number(r.finalVerifiedValue || r.finalOffer || 0), 0);
    return { pending, done, pendingAmt, doneAmt, commission: Math.round(doneAmt * COMMISSION) };
  }, [requests]);

  const perf = useMemo(() => {
    const now = new Date();
    const thisMonth = processedReqs.filter(r => { const d = new Date(r.updatedAt || r.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    const target = 15;
    return { rating: 4.5, total: processedReqs.length, monthTarget: target, monthDone: thisMonth, monthPct: Math.min(100, Math.round((thisMonth / target) * 100)), rank: 2, totalRecyclers: 8 };
  }, [processedReqs]);

  async function updateStatus(pickupId, nextStatus) {
    setUpdatingId(pickupId);
    try {
      const res = await authFetch(`${apiBaseUrl}/recycler-ops/requests/${pickupId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, finalVerifiedValue: form.finalVerifiedValue || undefined, processingMethod: form.processingMethod || undefined, recyclerNotes: form.recyclerNotes || undefined }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Update failed"); }
      await fetchData();
      flash(`Status updated to ${fmtStatus(nextStatus)}`);
      setUpdatingId("");
      setExpandedId("");
      setForm({ finalVerifiedValue: "", processingMethod: "", recyclerNotes: "" });
    } catch (e) { setError(e.message); setUpdatingId(""); }
  }

  function flash(msg) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); }
  function handleReject(id) { setRejectedIds(p => [...p, id]); flash("Request rejected"); }

  function downloadReport() {
    const lines = [
      "RECYCLING COMPLIANCE REPORT", `Organization: ${user?.organizationName || user?.name}`, `Date: ${new Date().toLocaleDateString("en-IN")}`, "",
      "INVENTORY", `Total E-Waste: ${inventory.totalKg} kg`, `Devices: ${inventory.count}`, "",
      "MATERIAL RECOVERY", `Gold: ${materials.goldG} g`, `Copper: ${materials.copperKg} kg`, `Lithium: ${materials.lithiumKg} kg`, `Plastic: ${materials.plasticKg} kg`, `Revenue: ${fmt$(materials.revenue)}`, "",
      "CERTIFICATIONS", ...CERTS.map(c => `${c.name} - ${c.status} (expires: ${fmtDate(c.expiry)})`),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    a.download = `recycling-report-${Date.now()}.txt`;
    a.click();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading Recycler Dashboard...</p>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="rounded-2xl bg-white p-8 shadow text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button onClick={fetchData} className="bg-green-600 text-white px-6 py-2 rounded-xl">Retry</button>
      </div>
    </div>
  );

  const Card = ({ title, value, sub, color = "green" }) => (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{user?.organizationName || "Recycler"} Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage pickups, inventory, materials, payments & compliance</p>
        </div>

        {successMsg && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 font-medium">{"\u2705"} {successMsg}</div>}
        {error && data && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 bg-white rounded-2xl shadow p-1.5 min-w-max">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== OVERVIEW ===== */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card title="Total Devices" value={stats.totalDevices || 0} color="gray" />
              <Card title="Awaiting Device" value={stats.awaitingDevice || 0} color="yellow" />
              <Card title="Verified" value={stats.verified || 0} color="blue" />
              <Card title="Processed" value={stats.processed || 0} color="green" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="E-Waste Received" value={`${inventory.totalKg} kg`} sub={`${inventory.count} devices`} />
              <Card title="Material Revenue" value={fmt$(materials.revenue)} sub={`${materials.count} processed`} />
              <Card title="Pending Payments" value={fmt$(paymentData.pendingAmt)} sub={`${paymentData.pending.length} pending`} color="yellow" />
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Requests</h2>
              {requests.slice(0, 5).map(r => (
                <div key={r.pickupId} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800">{r.brand} {r.model}</p>
                    <p className="text-sm text-gray-500">{r.deviceType} &middot; {fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClr(r.recyclerStatus)}`}>{fmtStatus(r.recyclerStatus)}</span>
                </div>
              ))}
              {requests.length === 0 && <p className="text-gray-500">No requests yet.</p>}
            </div>
          </div>
        )}

        {/* ===== A. PICKUP REQUESTS ===== */}
        {tab === "requests" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Pending Requests ({pendingReqs.length})</h2>
            {pendingReqs.length === 0 && <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">No pending requests</div>}
            {pendingReqs.map(r => (
              <div key={r.pickupId} className="bg-white rounded-2xl shadow p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-800">{r.brand} {r.model} <span className="text-gray-400 font-normal text-sm">({r.deviceType})</span></p>
                    <p className="text-sm text-gray-500 mt-1">{"\uD83D\uDC64"} {r.name} &middot; {"\uD83D\uDCCD"} {r.address}</p>
                    <p className="text-sm text-gray-500">{"\uD83D\uDCDE"} {r.contact} &middot; {"\u23F0"} Preferred: {fmtDate(r.pickupDate)}</p>
                    <p className="text-sm text-gray-600 mt-1">Estimated: <span className="font-semibold">{fmt$(r.finalVerifiedValue || r.finalOffer)}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(r.pickupId, "verified")} disabled={updatingId === r.pickupId}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold text-sm disabled:opacity-60 transition">
                      {updatingId === r.pickupId ? "..." : "\u2705 Accept"}
                    </button>
                    <button onClick={() => handleReject(r.pickupId)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-xl font-semibold text-sm transition">
                      {"\u274C"} Reject
                    </button>
                  </div>
                </div>
                {r.submission && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-500 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <span>Condition: <b>{r.submission.condition}</b></span>
                    <span>Working: <b>{r.submission.working}</b></span>
                    <span>Age: <b>{r.submission.age} yr</b></span>
                    <span>Score: <b>{r.submission.sustainabilityScore || "N/A"}</b></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== B. ACTIVE PICKUPS ===== */}
        {tab === "pickups" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Active Pickups ({activePickups.length})</h2>
            {activePickups.length === 0 && <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">No active pickups</div>}
            {activePickups.map(r => {
              const isExp = expandedId === r.pickupId;
              return (
                <div key={r.pickupId} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-800">{r.brand} {r.model} <span className="text-sm text-gray-400">({r.deviceType})</span></p>
                      <p className="text-sm text-gray-500">{"\uD83D\uDC64"} {r.name} &middot; {fmtDate(r.pickupDate)}</p>
                      <p className="text-sm text-gray-600">Value: <b>{fmt$(r.finalVerifiedValue || r.finalOffer)}</b></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address || "")}`} target="_blank" rel="noreferrer"
                        className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100 transition">
                        {"\uD83D\uDCCD"} Route
                      </a>
                      <button onClick={() => setExpandedId(isExp ? "" : r.pickupId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                        {"\u2705"} Mark as Recycled
                      </button>
                    </div>
                  </div>

                  {/* Proof Upload */}
                  <div className="mt-3 pt-3 border-t">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">{"\uD83D\uDCF8"} Upload Proof (after recycling)</label>
                    <input type="file" accept="image/*" capture="environment" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { const rd = new FileReader(); rd.onload = ev => setProofImages(p => ({ ...p, [r.pickupId]: ev.target.result })); rd.readAsDataURL(f); }
                    }} className="text-sm text-gray-600" />
                    {proofImages[r.pickupId] && <img src={proofImages[r.pickupId]} alt="proof" className="mt-2 rounded-xl h-32 object-cover border" />}
                  </div>

                  {/* Processing Form */}
                  {isExp && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <input type="number" placeholder="Final verified value (\u20B9)" value={form.finalVerifiedValue} onChange={e => setForm(p => ({ ...p, finalVerifiedValue: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
                      <select value={form.processingMethod} onChange={e => setForm(p => ({ ...p, processingMethod: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select processing method</option>
                        <option>Manual Disassembly</option>
                        <option>Mechanical Shredding</option>
                        <option>Chemical Processing</option>
                        <option>Refurbishment</option>
                      </select>
                      <textarea placeholder="Notes..." value={form.recyclerNotes} onChange={e => setForm(p => ({ ...p, recyclerNotes: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" rows={2} />
                      <button onClick={() => updateStatus(r.pickupId, "processed")} disabled={!!updatingId}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
                        {updatingId === r.pickupId ? "Processing..." : "Confirm Processed"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== C. INVENTORY ===== */}
        {tab === "inventory" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card title="Total E-Waste Received" value={`${inventory.totalKg} kg`} />
              <Card title="Total Devices" value={inventory.count} color="blue" />
              <Card title="Pending Processing" value={stats.verified || 0} sub="devices awaiting recycling" color="yellow" />
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83C\uDFF7\uFE0F"} Category-wise Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 pr-4">Category</th><th className="pb-3 pr-4">Devices</th><th className="pb-3 pr-4">Weight (kg)</th><th className="pb-3">% of Total</th>
                  </tr></thead>
                  <tbody>
                    {Object.entries(inventory.byCategory).map(([cat, d]) => (
                      <tr key={cat} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-semibold">{cat}</td>
                        <td className="py-3 pr-4">{d.count}</td>
                        <td className="py-3 pr-4">{d.kg.toFixed(2)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${inventory.totalKg ? (d.kg / inventory.totalKg * 100) : 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{inventory.totalKg ? Math.round(d.kg / inventory.totalKg * 100) : 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(inventory.byCategory).length === 0 && <tr><td colSpan={4} className="py-4 text-gray-400 text-center">No inventory data</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCCA"} Stock Aging</h2>
              <div className="space-y-2">
                {inventory.aging.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-semibold text-gray-700">{a.brand} {a.model} <span className="text-gray-400 text-sm">({a.type})</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${a.days > 7 ? "text-red-600" : a.days > 3 ? "text-yellow-600" : "text-green-600"}`}>{a.days} days</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClr(a.status)}`}>{fmtStatus(a.status)}</span>
                    </div>
                  </div>
                ))}
                {inventory.aging.length === 0 && <p className="text-gray-400 text-center py-4">No items in stock</p>}
              </div>
            </div>
          </div>
        )}

        {/* ===== D. MATERIAL RECOVERY ===== */}
        {tab === "materials" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-5">
                <p className="text-sm text-yellow-700">{"\uD83D\uDD2C"} Gold Recovered</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">{materials.goldG} g</p>
                <p className="text-xs text-yellow-600 mt-1">@ {fmt$(MARKET.goldPerG)}/g = {fmt$(Math.round(materials.goldG * MARKET.goldPerG))}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5">
                <p className="text-sm text-orange-700">{"\uD83D\uDD34"} Copper Recovered</p>
                <p className="text-2xl font-bold text-orange-800 mt-1">{materials.copperKg} kg</p>
                <p className="text-xs text-orange-600 mt-1">@ {fmt$(MARKET.copperPerKg)}/kg = {fmt$(Math.round(materials.copperKg * MARKET.copperPerKg))}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
                <p className="text-sm text-blue-700">{"\uD83D\uDD0B"} Lithium Recovered</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">{materials.lithiumKg} kg</p>
                <p className="text-xs text-blue-600 mt-1">@ {fmt$(MARKET.lithiumPerKg)}/kg = {fmt$(Math.round(materials.lithiumKg * MARKET.lithiumPerKg))}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
                <p className="text-sm text-green-700">{"\u267B\uFE0F"} Plastic Recycled</p>
                <p className="text-2xl font-bold text-green-800 mt-1">{materials.plasticKg} kg</p>
                <p className="text-xs text-green-600 mt-1">@ {fmt$(MARKET.plasticPerKg)}/kg = {fmt$(Math.round(materials.plasticKg * MARKET.plasticPerKg))}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">{"\uD83D\uDCB0"} Total Revenue from Recovered Materials</h2>
              <p className="text-4xl font-bold text-green-700">{fmt$(materials.revenue)}</p>
              <p className="text-sm text-gray-500 mt-2">From {materials.count} processed devices &middot; Market rates updated daily</p>
            </div>
          </div>
        )}

        {/* ===== E. PAYMENTS ===== */}
        {tab === "payments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card title="Pending to Users" value={fmt$(paymentData.pendingAmt)} sub={`${paymentData.pending.length} payments`} color="yellow" />
              <Card title="Completed Payments" value={fmt$(paymentData.doneAmt)} sub={`${paymentData.done.length} paid`} color="green" />
              <Card title="Commission Deducted" value={fmt$(paymentData.commission)} sub={`${Math.round(COMMISSION * 100)}% platform fee`} color="gray" />
              <Card title="Net Processed" value={fmt$(paymentData.doneAmt - paymentData.commission)} color="blue" />
            </div>

            {paymentData.pending.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCB5"} Pending Payments</h2>
                {paymentData.pending.map(r => (
                  <div key={r.pickupId} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-semibold text-gray-700">{r.name}</p>
                      <p className="text-sm text-gray-500">{r.brand} {r.model} &middot; {fmtDate(r.pickupDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{fmt$(r.finalVerifiedValue || r.finalOffer)}</span>
                      <button className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition">{"\u2705"} Pay Now</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCDC"} Payment History</h2>
              {paymentData.done.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">Device</th><th className="pb-3 pr-4">Amount</th><th className="pb-3">Method</th>
                    </tr></thead>
                    <tbody>
                      {paymentData.done.map(r => (
                        <tr key={r.pickupId} className="border-b last:border-0">
                          <td className="py-3 pr-4">{fmtDate(r.updatedAt || r.createdAt)}</td>
                          <td className="py-3 pr-4 font-semibold">{r.name}</td>
                          <td className="py-3 pr-4">{r.brand} {r.model}</td>
                          <td className="py-3 pr-4 font-bold text-green-700">{fmt$(r.finalVerifiedValue || r.finalOffer)}</td>
                          <td className="py-3">{r.paymentMethod || "UPI"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-gray-400">No completed payments yet.</p>}
            </div>
          </div>
        )}

        {/* ===== F. PERFORMANCE ===== */}
        {tab === "performance" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-sm text-gray-500 mb-2">{"\u2B50"} Average Rating</p>
                <p className="text-5xl font-bold text-yellow-500">{perf.rating}</p>
                <div className="flex justify-center gap-1 mt-2">{[1,2,3,4,5].map(i => <span key={i} className="text-xl">{i <= Math.round(perf.rating) ? "\u2B50" : "\u2606"}</span>)}</div>
                <p className="text-xs text-gray-400 mt-2">Based on user feedback</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-gray-500 mb-3">{"\uD83D\uDCC8"} Monthly Target</p>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">{perf.monthDone}</p>
                  <p className="text-gray-400 text-lg">/ {perf.monthTarget}</p>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${perf.monthPct >= 100 ? "bg-green-500" : perf.monthPct >= 60 ? "bg-blue-500" : "bg-yellow-500"}`} style={{ width: `${perf.monthPct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{perf.monthPct}% achieved this month</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-sm text-gray-500 mb-2">{"\uD83C\uDFC6"} Leaderboard Rank</p>
                <p className="text-5xl font-bold text-green-600">#{perf.rank}</p>
                <p className="text-xs text-gray-400 mt-2">out of {perf.totalRecyclers} recyclers</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83C\uDFC6"} Leaderboard</h2>
              <div className="space-y-2">
                {[
                  { rank: 1, name: "GreenCycle Recyclers", devices: 23, score: 96 },
                  { rank: 2, name: user?.organizationName || "Your Organization", devices: perf.total, score: 89, isYou: true },
                  { rank: 3, name: "EcoScrap Solutions", devices: 14, score: 82 },
                  { rank: 4, name: "Urban E-Waste Hub", devices: 9, score: 71 },
                ].map(l => (
                  <div key={l.rank} className={`flex items-center justify-between py-3 px-4 rounded-xl ${l.isYou ? "bg-green-50 border-2 border-green-300" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-8">#{l.rank}</span>
                      <div>
                        <p className={`font-semibold ${l.isYou ? "text-green-700" : "text-gray-800"}`}>{l.name} {l.isYou ? "(You)" : ""}</p>
                        <p className="text-xs text-gray-500">{l.devices} devices processed</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700">{l.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== G. COMPLIANCE ===== */}
        {tab === "compliance" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCC4"} Certifications</h2>
              <div className="space-y-3">
                {CERTS.map(c => (
                  <div key={c.id} className={`rounded-xl border p-4 ${c.status === "expiring_soon" ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.issuer}</p>
                        <p className="text-xs text-gray-400 mt-1">Issued: {fmtDate(c.issued)} &middot; Expires: {fmtDate(c.expiry)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {c.status === "active" ? "\u2705 Active" : "\u26A0\uFE0F Expiring Soon"}
                        </span>
                        <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-100">Renew</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {CERTS.some(c => c.status === "expiring_soon") && (
              <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
                <p className="font-semibold text-yellow-800">{"\u26A0\uFE0F"} Compliance Alert</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {CERTS.filter(c => c.status === "expiring_soon").map(c => c.name).join(", ")} {CERTS.filter(c => c.status === "expiring_soon").length === 1 ? "is" : "are"} expiring soon. Please renew to maintain compliance.
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">{"\uD83D\uDCC4"} Upload New Certificate</h2>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="text-sm text-gray-600 mb-3 block" />
              <button className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition">Upload Certificate</button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">{"\uD83D\uDCC1"} Recycling Report</h2>
              <p className="text-sm text-gray-500 mb-4">Download a compliance report for government submissions.</p>
              <button onClick={downloadReport} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">{"\uD83D\uDCE5"} Download Report</button>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link to="/" className="border px-6 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">Home</Link>
        </div>
      </div>
    </div>
  );
}
