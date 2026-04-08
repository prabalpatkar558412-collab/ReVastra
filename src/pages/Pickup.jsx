import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

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

  const [submitted, setSubmitted] = useState(false);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/sell" className="text-green-600 font-semibold">
          Go to Sell Page
        </Link>
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
    setSubmitted(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            ✅ Pickup Requested
          </h1>
          <p className="text-gray-600">
            Your pickup has been scheduled successfully.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Schedule Pickup
        </h1>
        <p className="text-gray-500 mb-6">
          Confirm your pickup details for recycler:{" "}
          <span className="font-semibold">{data.recyclerName}</span>
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
            className="border rounded-lg px-4 py-3"
            required
          />

          <textarea
            name="address"
            placeholder="Pickup Address"
            value={formData.address}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
            required
          />

          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
            required
          />

          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
            required
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            Confirm Pickup
          </button>
        </form>
      </div>
    </div>
  );
}