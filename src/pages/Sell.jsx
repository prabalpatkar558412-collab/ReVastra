import { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export default function Sell() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    age: "",
    condition: "",
    working: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setErrorMessage("");
      setImageFile(file);
      setImageName(file.name);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setErrorMessage("Please upload a clear image of the electronic device.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = new FormData();
    payload.append("deviceType", formData.deviceType);
    payload.append("brand", formData.brand);
    payload.append("model", formData.model);
    payload.append("age", formData.age);
    payload.append("condition", formData.condition);
    payload.append("working", formData.working);
    payload.append("description", formData.description);

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/submissions`, {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create submission");
      }

      navigate("/estimate", {
        state: {
          ...result.data,
          localImagePreview: imagePreview,
          imageName,
        },
      });
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Smart Device Submission
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Sell Your E-Waste
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Enter your device details and upload an image to get a transparent
            value estimate and recycler recommendations.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {errorMessage ? (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Type
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select device</option>
                <option value="Phone">Phone</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
                <option value="Headphones">Headphones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple, Samsung"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. iPhone 11"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age of Device (Years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 2 years"
                min="0"
                step="0.1"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the age in years. Example: `0.5` for 6 months, `2` for 2
                years.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Dead">Dead</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is it Working?
              </label>
              <select
                name="working"
                value={formData.working}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose option</option>
                <option value="Yes">Yes</option>
                <option value="Partially">Partially</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Image
              </label>

              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-green-500 transition bg-gray-50">
                <span className="text-gray-600 font-medium mb-1">
                  Upload device image
                </span>
                <span className="text-sm text-gray-400">
                  PNG, JPG, JPEG, WEBP, HEIC or HEIF
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imageName && (
                <p className="text-sm text-green-600 mt-3 font-medium">
                  Selected: {imageName}
                </p>
              )}

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Device Preview"
                    className="w-full max-w-sm rounded-2xl shadow-md border"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe damage, scratches, battery issue, screen crack, etc."
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition"
              >
                {isSubmitting ? "Submitting..." : "Get Estimated Value"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    deviceType: "",
                    brand: "",
                    model: "",
                    age: "",
                    condition: "",
                    working: "",
                    description: "",
                  }) ||
                  setImagePreview(null) ||
                  setImageName("") ||
                  setImageFile(null) ||
                  setErrorMessage("")
                }
                disabled={isSubmitting}
                className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-8 py-3 rounded-xl transition"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
