import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

export default function Pickup() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    pickupDate: "",
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
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
        </div>

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
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition transform hover:scale-105 active:scale-95"
          >
            Confirm Pickup
          </button>
        </form>
      </div>
    </div>
  );
}