import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
const MKT_DEFAULT = { goldPerG: 6450, copperPerKg: 785, lithiumPerKg: 6100, plasticPerKg: 42 };
const DEV_WT = { Phone: 0.17, Laptop: 2.4, Tablet: 0.5, Headphones: 0.25 };
const MAT_YIELD = {
  Phone: { goldG: 0.03, copperKg: 0.015, lithiumKg: 0.005, plasticKg: 0.03 },
  Laptop: { goldG: 0.08, copperKg: 0.05, lithiumKg: 0.02, plasticKg: 0.5 },
  Tablet: { goldG: 0.04, copperKg: 0.02, lithiumKg: 0.01, plasticKg: 0.1 },
  Headphones: { goldG: 0.01, copperKg: 0.01, lithiumKg: 0.003, plasticKg: 0.1 },
};

function fmt$(v) { return `\u20B9${Number(v || 0).toLocaleString("en-IN")}`; }
function fmtD(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"; }
function fmtS(s) { return String(s || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function sClr(s) {
  const m = { completed: "bg-green-100 text-green-700", assigned: "bg-blue-100 text-blue-700", pending: "bg-yellow-100 text-yellow-700", processed: "bg-green-100 text-green-700" };
  return m[s] || "bg-gray-100 text-gray-700";
}

const TABS = [
  { key: "overview", label: "Overview", icon: "\uD83D\uDCCA" },
  { key: "users", label: "Users", icon: "\uD83D\uDC65" },
  { key: "recyclers", label: "Recyclers", icon: "\uD83C\uDFED" },
  { key: "transactions", label: "Transactions", icon: "\uD83D\uDCB0" },
  { key: "disputes", label: "Disputes", icon: "\uD83D\uDDE3\uFE0F" },
  { key: "pricing", label: "Pricing", icon: "\uD83D\uDC8E" },
  { key: "reports", label: "Reports", icon: "\uD83D\uDCC8" },
  { key: "settings", label: "Settings", icon: "\u2699\uFE0F" },
];

const SAMPLE_TICKETS = [
  { id: "TK-001", user: "Rahul Sharma", type: "Payment Delay", status: "open", date: "2026-04-07", desc: "Payment not received after 3 days of pickup completion" },
  { id: "TK-002", user: "Priya Patel", type: "Wrong Valuation", status: "open", date: "2026-04-06", desc: "Device was valued much lower than expected market rate" },
  { id: "TK-003", user: "GreenCycle Ops", type: "Device Mismatch", status: "resolved", date: "2026-04-03", desc: "Received device does not match the submitted description" },
];

export default function AdminDashboard() {
  const { authFetch, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [blockedIds, setBlockedIds] = useState([]);
  const [suspendedIds, setSuspendedIds] = useState([]);
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [prices, setPrices] = useState(MKT_DEFAULT);
  const [priceHistory, setPriceHistory] = useState([
    { date: "2026-04-01", goldPerG: 6380, copperPerKg: 770, lithiumPerKg: 5950, plasticPerKg: 40 },
    { date: "2026-04-05", goldPerG: 6420, copperPerKg: 780, lithiumPerKg: 6050, plasticPerKg: 41 },
    { date: "2026-04-09", ...MKT_DEFAULT },
  ]);
  const [commission, setCommission] = useState(5);
  const [notifTemplates, setNotifTemplates] = useState({ sms: "Your ReVastra pickup is {status}.", email: "Dear {name}, your device has been {status}." });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${apiBaseUrl}/admin/requests`);
      if (!res.ok) throw new Error("Failed to load admin dashboard");
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const requests = data?.requests || [];
  const submissions = data?.submissions || [];
  const users = data?.users || [];
  const stats = data?.stats || {};

  /* Computed */
  const allUsers = useMemo(() => users.filter(u => u.role === "user"), [users]);
  const allRecyclers = useMemo(() => users.filter(u => u.role === "recycler"), [users]);
  const allCollectors = useMemo(() => users.filter(u => u.role === "collector"), [users]);

  const overview = useMemo(() => {
    const totalEwaste = users.reduce((s, u) => s + (u.ewasteSavedKg || 0), 0);
    const totalValue = requests.reduce((s, r) => s + Number(r.finalOffer || 0), 0);
    const processed = requests.filter(r => r.status === "completed");
    let goldG = 0, co2Kg = 0;
    for (const r of processed) {
      goldG += (MAT_YIELD[r.deviceType] || MAT_YIELD.Phone).goldG;
      co2Kg += r.deviceType === "Laptop" ? 0.95 : r.deviceType === "Tablet" ? 0.36 : r.deviceType === "Headphones" ? 0.11 : 0.22;
    }
    return { totalUsers: allUsers.length, totalRecyclers: allRecyclers.length, totalCollectors: allCollectors.length, totalEwaste: +totalEwaste.toFixed(2), totalValue, co2Kg: +co2Kg.toFixed(2), goldG: +goldG.toFixed(3), processedCount: processed.length };
  }, [users, requests, allUsers, allRecyclers, allCollectors]);

  const filteredUsers = useMemo(() => {
    const q = searchQ.toLowerCase();
    return allUsers.filter(u => !q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q));
  }, [allUsers, searchQ]);

  const filteredRecyclers = useMemo(() => {
    const q = searchQ.toLowerCase();
    return allRecyclers.filter(u => !q || `${u.name} ${u.email} ${u.organizationName}`.toLowerCase().includes(q));
  }, [allRecyclers, searchQ]);

  const txns = useMemo(() => {
    const q = searchQ.toLowerCase();
    let filtered = requests;
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);
    if (q) filtered = filtered.filter(r => `${r.name} ${r.recyclerName} ${r.brand} ${r.model} ${r.pickupId}`.toLowerCase().includes(q));
    const platformRev = filtered.reduce((s, r) => s + Math.round(Number(r.finalOffer || 0) * commission / 100), 0);
    return { list: filtered, platformRev };
  }, [requests, searchQ, statusFilter, commission]);

  const chartData = useMemo(() => {
    const weeks = {};
    const months = {};
    for (const r of requests) {
      const d = new Date(r.createdAt || Date.now());
      const wk = `W${Math.ceil(d.getDate() / 7)}-${d.toLocaleString("en", { month: "short" })}`;
      const mn = d.toLocaleString("en", { month: "short", year: "2-digit" });
      weeks[wk] = (weeks[wk] || 0) + (DEV_WT[r.deviceType] || 0.3);
      months[mn] = (months[mn] || 0) + 1;
    }
    const userGrowth = {};
    for (const u of allUsers) {
      const mn = new Date(u.createdAt || Date.now()).toLocaleString("en", { month: "short", year: "2-digit" });
      userGrowth[mn] = (userGrowth[mn] || 0) + 1;
    }
    return { weeks, months, userGrowth };
  }, [requests, allUsers]);

  function flash(m) { setSuccessMsg(m); setTimeout(() => setSuccessMsg(""), 3000); }

  async function updateStatus(pickupId, nextStatus) {
    setUpdatingId(pickupId);
    try {
      const res = await authFetch(`${apiBaseUrl}/admin/requests/${pickupId}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Update failed"); }
      await fetchData();
      flash(`Status updated to ${fmtS(nextStatus)}`);
    } catch (e) { setError(e.message); }
    finally { setUpdatingId(""); }
  }

  function updatePrice(field, val) { setPrices(p => ({ ...p, [field]: Number(val) || 0 })); }
  function savePrice() {
    setPriceHistory(h => [...h, { date: new Date().toISOString().slice(0, 10), ...prices }]);
    flash("Market prices updated successfully");
  }

  function resolveTicket(id) { setTickets(t => t.map(tk => tk.id === id ? { ...tk, status: "resolved" } : tk)); flash("Ticket resolved"); }

  function downloadReport() {
    const lines = [
      "REVASTRA ADMIN REPORT", `Generated: ${new Date().toLocaleDateString("en-IN")}`, "",
      "OVERVIEW", `Users: ${overview.totalUsers}`, `Recyclers: ${overview.totalRecyclers}`, `E-Waste: ${overview.totalEwaste} kg`,
      `Value Distributed: ${fmt$(overview.totalValue)}`, `CO2 Saved: ${overview.co2Kg} kg`, `Gold Recovered: ${overview.goldG} g`, "",
      "REQUESTS", `Total: ${stats.totalRequests || 0}`, `Pending: ${stats.pendingPickups || 0}`, `Completed: ${stats.completedPickups || 0}`, "",
      "TRANSACTIONS", `Platform Revenue: ${fmt$(txns.platformRev)}`, `Commission Rate: ${commission}%`,
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    a.download = `admin-report-${Date.now()}.txt`;
    a.click();
  }

  const Card = ({ title, value, sub, color = "green" }) => (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  const BarChart = ({ data: d, color = "green", label = "" }) => {
    const entries = Object.entries(d);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return (
      <div>
        {label && <p className="text-sm font-semibold text-gray-600 mb-3">{label}</p>}
        <div className="flex items-end gap-2 h-40">
          {entries.map(([k, v]) => (
            <div key={k} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs font-bold text-gray-700 mb-1">{typeof v === "number" ? (v % 1 ? v.toFixed(1) : v) : v}</span>
              <div className={`w-full bg-${color}-500 rounded-t-lg transition-all duration-500`} style={{ height: `${(v / max) * 100}%`, minHeight: "4px" }} />
              <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{k}</span>
            </div>
          ))}
          {entries.length === 0 && <p className="text-gray-400 text-sm w-full text-center self-center">No data yet</p>}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{"\uD83D\uDC51"} Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform management &middot; {user?.name}</p>
        </div>

        {successMsg && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 font-medium">{"\u2705"} {successMsg}</div>}
        {error && data && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 bg-white rounded-2xl shadow p-1.5 min-w-max">
            {TABS.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSearchQ(""); setStatusFilter(""); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== A. OVERVIEW ===== */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card title="Total Users" value={overview.totalUsers} color="blue" />
              <Card title="Recyclers" value={overview.totalRecyclers} color="green" />
              <Card title="E-Waste Collected" value={`${overview.totalEwaste} kg`} color="yellow" />
              <Card title="Value Distributed" value={fmt$(overview.totalValue)} color="green" />
              <Card title="CO2 Saved" value={`${overview.co2Kg} kg`} color="blue" />
              <Card title="Gold Recovered" value={`${overview.goldG} g`} color="yellow" />
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <Card title="Total Requests" value={stats.totalRequests || 0} />
              <Card title="Pending" value={stats.pendingPickups || 0} color="yellow" />
              <Card title="Assigned" value={stats.assignedPickups || 0} color="blue" />
              <Card title="Completed" value={stats.completedPickups || 0} color="green" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">Recent Requests</h3>
                {requests.slice(0, 5).map(r => (
                  <div key={r.pickupId} className="flex items-center justify-between py-2.5 border-b last:border-0">
                    <div><p className="font-semibold text-sm text-gray-800">{r.brand} {r.model}</p><p className="text-xs text-gray-500">{r.name} &middot; {fmtD(r.createdAt)}</p></div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sClr(r.status)}`}>{fmtS(r.status)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">Recent Users</h3>
                {allUsers.slice(0, 5).map(u => (
                  <div key={u.userId} className="flex items-center justify-between py-2.5 border-b last:border-0">
                    <div><p className="font-semibold text-sm text-gray-800">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
                    <span className="text-xs text-gray-400">{fmtD(u.createdAt)}</span>
                  </div>
                ))}
                {allUsers.length === 0 && <p className="text-gray-400 text-sm">No users yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* ===== B. USER MANAGEMENT ===== */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search users..." className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={() => { const csv = ["Name,Email,Phone,Devices,Earnings"].concat(filteredUsers.map(u => `${u.name},${u.email},${u.phone},${u.devicesRecycled},${u.totalEarnings}`)).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv])); a.download = "users.csv"; a.click(); }}
                className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700">{"\uD83D\uDCE5"} Export CSV</button>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 bg-gray-50 border-b">
                    <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Devices</th><th className="px-4 py-3">Earnings</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.userId} className={`border-b last:border-0 ${blockedIds.includes(u.userId) ? "bg-red-50 opacity-60" : ""}`}>
                        <td className="px-4 py-3 font-semibold">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.phone || "\u2014"}</td>
                        <td className="px-4 py-3">{u.devicesRecycled}</td>
                        <td className="px-4 py-3 font-semibold text-green-700">{fmt$(u.totalEarnings)}</td>
                        <td className="px-4 py-3 text-gray-400">{fmtD(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { blockedIds.includes(u.userId) ? setBlockedIds(p => p.filter(i => i !== u.userId)) : setBlockedIds(p => [...p, u.userId]); flash(blockedIds.includes(u.userId) ? "User unblocked" : "User blocked"); }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold ${blockedIds.includes(u.userId) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {blockedIds.includes(u.userId) ? "Unblock" : "Block"}
                            </button>
                            {u.phone && <a href={`tel:${u.phone}`} className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">{"\uD83D\uDCDE"}</a>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && <p className="text-gray-400 text-center py-6">No users found</p>}
            </div>
          </div>
        )}

        {/* ===== C. RECYCLER MANAGEMENT ===== */}
        {tab === "recyclers" && (
          <div className="space-y-4">
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search recyclers..." className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
            {filteredRecyclers.map(r => (
              <div key={r.userId} className={`bg-white rounded-2xl shadow p-5 ${suspendedIds.includes(r.userId) ? "opacity-50 border-2 border-red-300" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-800">{r.organizationName || r.name}</p>
                    <p className="text-sm text-gray-500">{r.email} &middot; {r.serviceArea || "N/A"}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>Devices: <b>{r.devicesRecycled}</b></span>
                      <span>E-Waste: <b>{r.ewasteSavedKg} kg</b></span>
                      <span>Joined: <b>{fmtD(r.createdAt)}</b></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${suspendedIds.includes(r.userId) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {suspendedIds.includes(r.userId) ? "Suspended" : "\u2705 Active"}
                    </span>
                    <button onClick={() => { suspendedIds.includes(r.userId) ? setSuspendedIds(p => p.filter(i => i !== r.userId)) : setSuspendedIds(p => [...p, r.userId]); flash(suspendedIds.includes(r.userId) ? "Recycler reinstated" : "Recycler suspended"); }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${suspendedIds.includes(r.userId) ? "border-green-300 text-green-700 hover:bg-green-50" : "border-red-300 text-red-700 hover:bg-red-50"}`}>
                      {suspendedIds.includes(r.userId) ? "Reinstate" : "Suspend"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredRecyclers.length === 0 && <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">No recyclers found</div>}
          </div>
        )}

        {/* ===== D. TRANSACTIONS ===== */}
        {tab === "transactions" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search transactions..." className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500">
                <option value="">All Status</option><option value="pending">Pending</option><option value="assigned">Assigned</option><option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card title="Total Transactions" value={txns.list.length} color="blue" />
              <Card title="Platform Revenue" value={fmt$(txns.platformRev)} sub={`${commission}% commission`} color="green" />
              <Card title="Total Value" value={fmt$(txns.list.reduce((s, r) => s + Number(r.finalOffer || 0), 0))} color="gray" />
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 bg-gray-50 border-b">
                    <th className="px-4 py-3">ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Recycler</th><th className="px-4 py-3">Device</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Commission</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {txns.list.slice(0, 20).map(r => (
                      <tr key={r.pickupId} className="border-b last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{r.pickupId?.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-semibold">{r.name}</td>
                        <td className="px-4 py-3">{r.recyclerName}</td>
                        <td className="px-4 py-3">{r.brand} {r.model}</td>
                        <td className="px-4 py-3 font-bold text-green-700">{fmt$(r.finalOffer)}</td>
                        <td className="px-4 py-3 text-gray-500">{fmt$(Math.round(Number(r.finalOffer || 0) * commission / 100))}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sClr(r.status)}`}>{fmtS(r.status)}</span></td>
                        <td className="px-4 py-3">
                          {r.status === "pending" && <button onClick={() => updateStatus(r.pickupId, "assigned")} disabled={!!updatingId} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50">Assign</button>}
                          {r.status === "assigned" && <button onClick={() => updateStatus(r.pickupId, "completed")} disabled={!!updatingId} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50">Complete</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {txns.list.length === 0 && <p className="text-gray-400 text-center py-6">No transactions found</p>}
            </div>
          </div>
        )}

        {/* ===== E. DISPUTES ===== */}
        {tab === "disputes" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card title="Open Tickets" value={tickets.filter(t => t.status === "open").length} color="yellow" />
              <Card title="Resolved" value={tickets.filter(t => t.status === "resolved").length} color="green" />
              <Card title="Total" value={tickets.length} color="gray" />
            </div>
            {tickets.map(tk => (
              <div key={tk.id} className={`bg-white rounded-2xl shadow p-5 ${tk.status === "resolved" ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-400">{tk.id}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tk.status === "open" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{fmtS(tk.status)}</span>
                    </div>
                    <p className="font-bold text-gray-800">{tk.type}</p>
                    <p className="text-sm text-gray-500">{tk.user} &middot; {fmtD(tk.date)}</p>
                    <p className="text-sm text-gray-600 mt-1">{tk.desc}</p>
                  </div>
                  {tk.status === "open" && (
                    <button onClick={() => resolveTicket(tk.id)} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-green-700">{"\u2705"} Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== F. PRICING ===== */}
        {tab === "pricing" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCB8"} Current Market Prices</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Gold (per gram)", field: "goldPerG", icon: "\uD83D\uDC8E", color: "yellow" },
                  { label: "Copper (per kg)", field: "copperPerKg", icon: "\uD83D\uDD34", color: "orange" },
                  { label: "Lithium (per kg)", field: "lithiumPerKg", icon: "\uD83D\uDD0B", color: "blue" },
                  { label: "Plastic/Glass (per kg)", field: "plasticPerKg", icon: "\u267B\uFE0F", color: "green" },
                ].map(p => (
                  <div key={p.field} className={`rounded-xl border p-4`}>
                    <p className="text-sm text-gray-500 mb-1">{p.icon} {p.label}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">{"\u20B9"}</span>
                      <input type="number" value={prices[p.field]} onChange={e => updatePrice(p.field, e.target.value)}
                        className="w-full text-xl font-bold outline-none border-b-2 border-gray-200 focus:border-green-500 py-1" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={savePrice} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition">Save Prices</button>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCC5"} Price History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Gold/g</th><th className="pb-3 pr-4">Copper/kg</th><th className="pb-3 pr-4">Lithium/kg</th><th className="pb-3">Plastic/kg</th>
                  </tr></thead>
                  <tbody>
                    {[...priceHistory].reverse().map((p, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-semibold">{fmtD(p.date)}</td>
                        <td className="py-2.5 pr-4">{fmt$(p.goldPerG)}</td>
                        <td className="py-2.5 pr-4">{fmt$(p.copperPerKg)}</td>
                        <td className="py-2.5 pr-4">{fmt$(p.lithiumPerKg)}</td>
                        <td className="py-2.5">{fmt$(p.plasticPerKg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== G. REPORTS ===== */}
        {tab === "reports" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6"><BarChart data={chartData.weeks} color="green" label={"\uD83D\uDCE6 E-Waste Collected (kg) by Week"} /></div>
              <div className="bg-white rounded-2xl shadow p-6"><BarChart data={chartData.months} color="blue" label={"\uD83D\uDCCA Requests by Month"} /></div>
              <div className="bg-white rounded-2xl shadow p-6"><BarChart data={chartData.userGrowth} color="purple" label={"\uD83D\uDC65 User Growth by Month"} /></div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm font-semibold text-gray-600 mb-3">{"\uD83D\uDCB0"} Revenue Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Total Value Distributed</span><span className="font-bold">{fmt$(overview.totalValue)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Platform Commission ({commission}%)</span><span className="font-bold text-green-700">{fmt$(Math.round(overview.totalValue * commission / 100))}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-gray-600">Material Recovery Revenue</span><span className="font-bold text-blue-700">{fmt$(Math.round(overview.goldG * MKT_DEFAULT.goldPerG))}</span></div>
                  <div className="flex justify-between py-2"><span className="text-gray-600">Devices Processed</span><span className="font-bold">{overview.processedCount}</span></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-gray-800 mb-3">{"\uD83D\uDCCD"} Location-wise Collection</h3>
              <div className="grid grid-cols-3 gap-4">
                {[{ loc: "Gwalior", pct: 45 }, { loc: "Bhopal", pct: 35 }, { loc: "Indore", pct: 20 }].map(l => (
                  <div key={l.loc} className="rounded-xl border p-4">
                    <p className="font-semibold text-gray-800">{l.loc}</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${l.pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{l.pct}% of total</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={downloadReport} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">{"\uD83D\uDCE5"} Download Full Report</button>
          </div>
        )}

        {/* ===== H. SETTINGS ===== */}
        {tab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\u2699\uFE0F"} Commission Settings</h2>
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Platform Commission (%)</label>
                <input type="number" min={0} max={50} value={commission} onChange={e => setCommission(Number(e.target.value) || 0)}
                  className="w-24 border rounded-xl px-4 py-2 text-center font-bold outline-none focus:ring-2 focus:ring-green-500" />
                <button onClick={() => flash("Commission rate saved")} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold">Save</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDD14"} Notification Templates</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">SMS Template</label>
                  <input value={notifTemplates.sms} onChange={e => setNotifTemplates(p => ({ ...p, sms: e.target.value }))} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Email Template</label>
                  <textarea value={notifTemplates.email} onChange={e => setNotifTemplates(p => ({ ...p, email: e.target.value }))} rows={3} className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button onClick={() => flash("Templates saved")} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold">Save Templates</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDC64"} Sub-Admin Management</h2>
              <div className="space-y-3 mb-4">
                {users.filter(u => u.role === "admin").map(u => (
                  <div key={u.userId} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div><p className="font-semibold">{u.name}</p><p className="text-sm text-gray-500">{u.email}</p></div>
                    <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold">Admin</span>
                  </div>
                ))}
              </div>
              <button onClick={() => flash("Invite sent (demo)")} className="border border-green-600 text-green-700 px-5 py-2 rounded-xl font-semibold hover:bg-green-50">+ Add Sub-Admin</button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCDC"} Terms & Conditions</h2>
              <textarea rows={5} defaultValue="ReVastra platform terms and conditions. Users agree to responsibly dispose of e-waste through certified recyclers. Platform commission applies to all transactions. Recyclers must maintain valid CPCB certifications."
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-700" />
              <button onClick={() => flash("Terms updated")} className="mt-3 bg-green-600 text-white px-5 py-2 rounded-xl font-semibold">Save</button>
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
