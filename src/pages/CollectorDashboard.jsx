import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
const PER_PICKUP_EARNING = 150;

function fmt$(v) { return `\u20B9${Number(v || 0).toLocaleString("en-IN")}`; }
function fmtD(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"; }
function fmtS(s) { return String(s || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function isToday(d) { if (!d) return false; const t = new Date(), x = new Date(d); return t.toDateString() === x.toDateString(); }
function isThisWeek(d) { if (!d) return false; const now = Date.now(), x = new Date(d).getTime(); return now - x < 7 * 86400000 && x <= now; }
function sClr(s) {
  const m = { assigned: "bg-yellow-100 text-yellow-700", picked_up: "bg-blue-100 text-blue-700", delivered_to_recycler: "bg-green-100 text-green-700" };
  return m[s] || "bg-gray-100 text-gray-700";
}

const TABS = [
  { key: "tasks", label: "Today's Tasks", icon: "\uD83D\uDCCB" },
  { key: "status", label: "All Pickups", icon: "\uD83D\uDE9A" },
  { key: "route", label: "My Route", icon: "\uD83D\uDDFA\uFE0F" },
  { key: "earnings", label: "Earnings", icon: "\uD83D\uDCB5" },
  { key: "profile", label: "Profile", icon: "\uD83D\uDC64" },
];

export default function CollectorDashboard() {
  const { authFetch, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("tasks");
  const [successMsg, setSuccessMsg] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [proofImages, setProofImages] = useState({});
  const [reachedIds, setReachedIds] = useState([]);
  const [issueReports, setIssueReports] = useState({});
  const [issueText, setIssueText] = useState("");
  const [issuingId, setIssuingId] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [profileForm, setProfileForm] = useState({
    vehicleType: "Bike",
    baseLocation: "Central Hub, Gwalior",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authFetch(`${apiBaseUrl}/collector/dashboard`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const requests = data?.requests || [];
  const stats = data?.stats || {};

  function flash(m) { setSuccessMsg(m); setTimeout(() => setSuccessMsg(""), 3000); }

  async function updateStatus(pickupId, nextStatus) {
    setUpdatingId(pickupId);
    try {
      const res = await authFetch(`${apiBaseUrl}/collector/requests/${pickupId}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Update failed"); }
      await fetchData();
      flash(`Status updated to ${fmtS(nextStatus)}`);
    } catch (e) { setError(e.message); }
    finally { setUpdatingId(""); }
  }

  /* A. Today's Tasks */
  const todayTasks = useMemo(() =>
    requests.filter(r => r.collectorStatus !== "delivered_to_recycler" || isToday(r.updatedAt)),
    [requests]
  );
  const pendingToday = useMemo(() =>
    requests.filter(r => r.collectorStatus === "assigned"),
    [requests]
  );

  /* D. Earnings */
  const earnings = useMemo(() => {
    const completed = requests.filter(r => r.collectorStatus === "delivered_to_recycler");
    const todayE = completed.filter(r => isToday(r.updatedAt || r.createdAt)).length * PER_PICKUP_EARNING;
    const weekE = completed.filter(r => isThisWeek(r.updatedAt || r.createdAt)).length * PER_PICKUP_EARNING;
    const totalE = completed.length * PER_PICKUP_EARNING;
    return { todayCount: completed.filter(r => isToday(r.updatedAt || r.createdAt)).length, today: todayE, week: weekE, total: totalE, completedCount: completed.length };
  }, [requests]);

  const Card = ({ title, value, sub, color = "green" }) => (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  /* Status steps for a request */
  function StatusSteps({ r }) {
    const steps = [
      { key: "assigned", label: "Assigned", done: true },
      { key: "reached", label: "Reached", done: reachedIds.includes(r.pickupId) || ["picked_up", "delivered_to_recycler"].includes(r.collectorStatus) },
      { key: "picked_up", label: "Picked Up", done: ["picked_up", "delivered_to_recycler"].includes(r.collectorStatus) },
      { key: "delivered", label: "Delivered", done: r.collectorStatus === "delivered_to_recycler" },
    ];
    return (
      <div className="flex items-center gap-1 mt-3">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
              {s.done ? "\u2713" : i + 1}
            </div>
            <span className={`text-[10px] ml-1 ${s.done ? "text-green-700 font-semibold" : "text-gray-400"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${s.done ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>
    );
  }

  /* Pickup card (reusable) */
  function PickupCard({ r, showActions = true }) {
    const isAssigned = r.collectorStatus === "assigned";
    const isPickedUp = r.collectorStatus === "picked_up";
    const isDelivered = r.collectorStatus === "delivered_to_recycler";
    const hasReached = reachedIds.includes(r.pickupId);
    const hasIssue = issueReports[r.pickupId];

    return (
      <div className={`bg-white rounded-2xl shadow p-5 ${isDelivered ? "opacity-60" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sClr(r.collectorStatus)}`}>{fmtS(r.collectorStatus)}</span>
              {hasIssue && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-700">{"\u26A0\uFE0F"} Issue</span>}
            </div>
            <p className="font-bold text-gray-800 text-lg">{"\uD83C\uDFE0"} {r.name}</p>
            <p className="text-sm text-gray-600">{"\uD83D\uDCCD"} {r.address}</p>
            <p className="text-sm text-gray-600">{"\uD83D\uDCDE"} <a href={`tel:${r.contact}`} className="text-blue-600 underline">{r.contact}</a></p>
            <p className="text-sm text-gray-500 mt-1">{"\uD83D\uDCF1"} {r.deviceType} &mdash; {r.brand} {r.model}</p>
            <p className="text-sm text-gray-500">{"\u23F0"} Slot: {fmtD(r.pickupDate)} &middot; 10 AM - 6 PM</p>
            <p className="text-sm text-gray-600">{"\uD83D\uDCB0"} Value: <b>{fmt$(r.finalOffer)}</b></p>
            {r.submission?.imageUrl && <img src={r.submission.imageUrl} alt="device" className="mt-2 rounded-xl h-20 object-cover border" />}
          </div>

          {showActions && !isDelivered && (
            <div className="flex flex-col gap-2 min-w-[140px]">
              {/* Navigate */}
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address || "")}`} target="_blank" rel="noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center hover:bg-blue-700 transition">
                {"\uD83D\uDCCD"} Navigate
              </a>

              {/* Reached */}
              {isAssigned && !hasReached && (
                <button onClick={() => { setReachedIds(p => [...p, r.pickupId]); flash("Marked as reached"); }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-600 transition">
                  {"\u2705"} Reached Location
                </button>
              )}

              {/* Photo capture */}
              {(isAssigned && hasReached) || isPickedUp ? (
                <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold text-center cursor-pointer hover:bg-gray-200 transition">
                  {"\uD83D\uDCF8"} {proofImages[r.pickupId] ? "Retake Photo" : "Take Photo"}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { const rd = new FileReader(); rd.onload = ev => setProofImages(p => ({ ...p, [r.pickupId]: ev.target.result })); rd.readAsDataURL(f); }
                  }} />
                </label>
              ) : null}

              {proofImages[r.pickupId] && <img src={proofImages[r.pickupId]} alt="proof" className="rounded-xl h-16 object-cover border" />}

              {/* Pick up */}
              {isAssigned && hasReached && (
                <button onClick={() => updateStatus(r.pickupId, "picked_up")} disabled={!!updatingId}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50">
                  {updatingId === r.pickupId ? "..." : "\u2705 Mark Picked Up"}
                </button>
              )}

              {/* Deliver */}
              {isPickedUp && (
                <button onClick={() => updateStatus(r.pickupId, "delivered_to_recycler")} disabled={!!updatingId}
                  className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50">
                  {updatingId === r.pickupId ? "..." : "\uD83D\uDE9A Delivered to Recycler"}
                </button>
              )}

              {/* Report Issue */}
              {!isDelivered && !hasIssue && (
                <button onClick={() => setIssuingId(issuingId === r.pickupId ? "" : r.pickupId)}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                  {"\u274C"} Report Issue
                </button>
              )}
            </div>
          )}
        </div>

        {/* Issue form */}
        {issuingId === r.pickupId && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <select value={issueText} onChange={e => setIssueText(e.target.value)} className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-400">
              <option value="">Select issue type...</option>
              <option>Customer not available</option>
              <option>Wrong address</option>
              <option>Wrong device / mismatch</option>
              <option>Device not working as described</option>
              <option>Customer refused handover</option>
              <option>Other</option>
            </select>
            <button onClick={() => { if (issueText) { setIssueReports(p => ({ ...p, [r.pickupId]: issueText })); setIssuingId(""); setIssueText(""); flash("Issue reported"); } }}
              className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">Submit Issue</button>
          </div>
        )}

        {hasIssue && <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{"\u26A0\uFE0F"} Issue: {hasIssue}</p>}
        <StatusSteps r={r} />
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading Collector Dashboard...</p>
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{"\uD83D\uDE9A"} Collector Dashboard</h1>
            <p className="text-gray-500 mt-1">{user?.organizationName || user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <span className={`text-sm font-semibold ${isOnline ? "text-green-700" : "text-gray-500"}`}>{isOnline ? "Online" : "Offline"}</span>
          </div>
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

        {/* ===== A. TODAY'S TASKS ===== */}
        {tab === "tasks" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card title="Total Assigned" value={stats.totalAssigned || 0} color="gray" />
              <Card title="Ready for Pickup" value={stats.readyForPickup || 0} color="yellow" />
              <Card title="Picked Up" value={stats.pickedUp || 0} color="blue" />
              <Card title="Delivered" value={stats.delivered || 0} color="green" />
            </div>

            <h2 className="text-xl font-bold text-gray-800">Pending Pickups ({pendingToday.length})</h2>
            {pendingToday.length === 0 && <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">{"\uD83C\uDF89"} No pending pickups! You&apos;re all caught up.</div>}
            {pendingToday.map(r => <PickupCard key={r.pickupId} r={r} />)}

            {requests.filter(r => r.collectorStatus === "picked_up").length > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mt-6">In Transit ({requests.filter(r => r.collectorStatus === "picked_up").length})</h2>
                {requests.filter(r => r.collectorStatus === "picked_up").map(r => <PickupCard key={r.pickupId} r={r} />)}
              </>
            )}
          </div>
        )}

        {/* ===== B. ALL PICKUPS (STATUS) ===== */}
        {tab === "status" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">All Assigned Pickups ({requests.length})</h2>
            {requests.map(r => <PickupCard key={r.pickupId} r={r} />)}
            {requests.length === 0 && <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">No pickups assigned yet</div>}
          </div>
        )}

        {/* ===== C. MY ROUTE ===== */}
        {tab === "route" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">{"\uD83D\uDDFA\uFE0F"} Route Map</h2>
                {pendingToday.length > 0 && (
                  <a href={`https://www.google.com/maps/dir/${pendingToday.map(r => encodeURIComponent(r.address || "")).join("/")}`}
                    target="_blank" rel="noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    {"\uD83D\uDD04"} Open Optimized Route
                  </a>
                )}
              </div>

              {pendingToday.length > 0 ? (
                <div className="rounded-xl overflow-hidden border" style={{ height: "350px" }}>
                  <iframe
                    title="route-map"
                    width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/directions?key=&origin=${encodeURIComponent(profileForm.baseLocation)}&destination=${encodeURIComponent(pendingToday[pendingToday.length - 1]?.address || "")}&waypoints=${pendingToday.slice(0, -1).map(r => encodeURIComponent(r.address || "")).join("|")}&mode=driving`}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border" style={{ height: "350px" }}>
                  <iframe
                    title="base-map"
                    width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(profileForm.baseLocation)}&output=embed`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCCD"} Pickup Points ({pendingToday.length})</h2>
              {pendingToday.map((r, i) => (
                <div key={r.pickupId} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.address}</p>
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address || "")}`} target="_blank" rel="noreferrer"
                    className="text-blue-600 text-sm font-semibold hover:underline">{"\uD83D\uDCCD"} Go</a>
                </div>
              ))}
              {pendingToday.length === 0 && <p className="text-gray-400 text-center py-4">No pending pickup points</p>}
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{"\uD83D\uDCCD"} Share My Location</h3>
                  <p className="text-sm text-gray-500">Admin and users can see your current position</p>
                </div>
                <button onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(pos => flash(`Location shared: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`), () => flash("Location permission denied")); } else { flash("Geolocation not supported"); } }}
                  className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700 transition">
                  {"\uD83D\uDCE1"} Share Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== D. EARNINGS ===== */}
        {tab === "earnings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card title="Per Pickup" value={fmt$(PER_PICKUP_EARNING)} sub="fixed rate" color="gray" />
              <Card title="Today" value={fmt$(earnings.today)} sub={`${earnings.todayCount} pickups`} color="blue" />
              <Card title="This Week" value={fmt$(earnings.week)} color="green" />
              <Card title="All Time" value={fmt$(earnings.total)} sub={`${earnings.completedCount} pickups`} color="green" />
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDCB5"} Earnings History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Customer</th><th className="pb-3 pr-4">Device</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Earning</th>
                  </tr></thead>
                  <tbody>
                    {requests.filter(r => r.collectorStatus === "delivered_to_recycler").map(r => (
                      <tr key={r.pickupId} className="border-b last:border-0">
                        <td className="py-3 pr-4">{fmtD(r.updatedAt || r.createdAt)}</td>
                        <td className="py-3 pr-4 font-semibold">{r.name}</td>
                        <td className="py-3 pr-4">{r.brand} {r.model}</td>
                        <td className="py-3 pr-4"><span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">Delivered</span></td>
                        <td className="py-3 font-bold text-green-700">{fmt$(PER_PICKUP_EARNING)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {requests.filter(r => r.collectorStatus === "delivered_to_recycler").length === 0 && <p className="text-gray-400 text-center py-4">No completed deliveries yet</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{"\uD83D\uDCB3"} Withdraw Earnings</h3>
                  <p className="text-sm text-gray-500">Available balance: <b className="text-green-700">{fmt$(earnings.total)}</b></p>
                </div>
                <button onClick={() => flash("Withdrawal request submitted (demo)")}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition">
                  {"\uD83D\uDCB8"} Request Withdrawal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== E. PROFILE ===== */}
        {tab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{"\uD83D\uDC64"} Profile Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Name</label>
                  <input value={user?.name || ""} readOnly className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                  <input value={user?.email || ""} readOnly className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Organization</label>
                  <input value={user?.organizationName || ""} readOnly className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Vehicle Type</label>
                  <select value={profileForm.vehicleType} onChange={e => setProfileForm(p => ({ ...p, vehicleType: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500">
                    <option>Bike</option><option>Scooter</option><option>Auto</option><option>Mini Van</option><option>Tempo</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Base Location / Hub</label>
                  <input value={profileForm.baseLocation} onChange={e => setProfileForm(p => ({ ...p, baseLocation: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button onClick={() => flash("Profile saved")} className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition w-full">Save Profile</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{"\uD83D\uDD14"} Availability Status</h3>
                  <p className="text-sm text-gray-500">Toggle your availability for new pickup assignments</p>
                </div>
                <button onClick={() => { setIsOnline(p => !p); flash(isOnline ? "You are now offline" : "You are now online"); }}
                  className={`relative w-14 h-7 rounded-full transition-colors ${isOnline ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${isOnline ? "left-7" : "left-0.5"}`} />
                </button>
              </div>
              <p className={`mt-3 text-sm font-semibold ${isOnline ? "text-green-700" : "text-gray-500"}`}>
                {isOnline ? "\u2705 You are ONLINE \u2014 you will receive new pickup assignments" : "\u26D4 You are OFFLINE \u2014 no new assignments"}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-gray-800 mb-3">{"\uD83D\uDCCA"} My Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-700">{earnings.completedCount}</p>
                  <p className="text-xs text-gray-500">Total Deliveries</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-2xl font-bold text-blue-700">{fmt$(earnings.total)}</p>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                </div>
                <div className="rounded-xl bg-yellow-50 p-4">
                  <p className="text-2xl font-bold text-yellow-700">{stats.readyForPickup || 0}</p>
                  <p className="text-xs text-gray-500">Pending Pickups</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-2xl font-bold text-purple-700">4.8 {"\u2B50"}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
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
