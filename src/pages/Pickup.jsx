import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

export default function Pickup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch, isAuthenticated, syncUser } = useAuth();
  const data = location.state;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    pickupDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authFetch("/pickups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: data.submissionId,
          recyclerId: data.recyclerId,
          recyclerName: data.recyclerName,
          finalOffer: data.finalOffer,
          pickup: data.pickup,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create pickup request");
      }

      if (result.data?.user) {
        syncUser(result.data.user);
      }

      navigate("/dashboard", {
        state: {
          pickupRequest: result.data?.pickupRequest || null,
        },
      });
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
      setLoading(false);
    }
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
              {"\u20B9"}
              {data.finalOffer}
            </p>
          </div>

          <div className="p-4 bg-gray-50 border rounded-xl">
            <p className="text-sm text-gray-500">Pickup</p>
            <p className="text-lg font-semibold">
              {data.pickup ? "Available" : "Drop Required"}
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Please{" "}
            <Link
              to="/login"
              state={{
                from: {
                  pathname: "/pickup",
                  state: data,
                },
              }}
              className="font-semibold underline"
            >
              log in as a user
            </Link>{" "}
            before confirming your pickup request.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

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
