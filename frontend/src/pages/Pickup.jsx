import { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

export default function Pickup() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedRecyclerData = (() => {
    try {
      return JSON.parse(localStorage.getItem("selectedRecyclerData"));
    } catch {
      return null;
    }
  })();

  const data = location.state || storedRecyclerData;

  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    pickupDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Recycler Selected
          </h1>
          <p className="text-gray-500 mb-6">
            Please choose a recycler first to continue with pickup.
          </p>
          <Link
            to="/recyclers"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            Go to Recyclers
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.pickup) {
      alert("This recycler does not support pickup. Please choose another recycler or arrange drop-off.");
      return;
    }

    const bookingData = {
      ...data,
      customerName: formData.name,
      customerAddress: formData.address,
      customerContact: formData.contact,
      pickupDate: formData.pickupDate,
      notes: formData.notes,
      bookingStatus: "Pickup Confirmed",
      bookingId: `REV-${Date.now()}`,
      bookedAt: new Date().toISOString(),
    };

    localStorage.setItem("pickupBooking", JSON.stringify(bookingData));

    setLoading(true);

    setTimeout(() => {
      navigate("/dashboard", { state: bookingData });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-3xl p-6 sm:p-8 hover:shadow-xl transition duration-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          Schedule Pickup
        </h1>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Confirm your pickup details for recycler:{" "}
          <span className="font-semibold">{data.recyclerName}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 border rounded-xl">
            <p className="text-sm text-gray-500">Final Offer</p>
            <p className="text-lg font-bold text-green-600">
              ₹{data.finalOffer}
            </p>
          </div>

          <div className="p-4 bg-gray-50 border rounded-xl">
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="text-lg font-semibold">
              {data.pickup ? "Available" : "Drop Required"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 border rounded-xl">
            <p className="text-sm text-gray-500">Recycler Location</p>
            <p className="text-lg font-semibold text-gray-800">
              {data.recyclerLocation || "Not available"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 border rounded-xl">
            <p className="text-sm text-gray-500">Recycler Rating</p>
            <p className="text-lg font-semibold text-gray-800">
              ⭐ {data.recyclerRating || "N/A"}
            </p>
          </div>
        </div>

        {!data.pickup && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-1">
              Pickup not available
            </h3>
            <p className="text-sm text-yellow-700">
              This recycler requires manual drop-off. Go back and choose another
              recycler if you want home pickup.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <textarea
            name="address"
            placeholder="Pickup Address"
            value={formData.address}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            rows="4"
            required
          />

          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            min={today}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <textarea
            name="notes"
            placeholder="Extra instructions (optional) - e.g. call before arrival, 2nd floor, gate code, fragile screen"
            value={formData.notes}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={!data.pickup}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition transform hover:scale-105 active:scale-95"
            >
              Confirm Pickup
            </button>

            <Link
              to="/recyclers"
              className="text-center border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold transition"
            >
              Back to Recyclers
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}