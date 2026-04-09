import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { saveDevice } from "../services/deviceService";

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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImageName(file.name);
    setImagePreview(previewUrl);
    setAiSummary("");
    setAiError("");
  };

  const normalizeCondition = (value) => {
    if (!value) return "";
    const v = String(value).toLowerCase();

    if (v.includes("excellent")) return "Excellent";
    if (v.includes("good")) return "Good";
    if (v.includes("damaged")) return "Damaged";
    if (v.includes("broken")) return "Damaged";
    if (v.includes("cracked")) return "Damaged";
    if (v.includes("dead")) return "Dead";

    return "";
  };

  const normalizeWorking = (conditionValue) => {
    if (!conditionValue) return "";

    const v = String(conditionValue).toLowerCase();

    if (v.includes("excellent") || v.includes("good")) return "Yes";
    if (v.includes("damaged") || v.includes("cracked") || v.includes("broken")) {
      return "Partially";
    }
    if (v.includes("dead")) return "No";

    return "";
  };

  const handleAIAnalyze = async () => {
    if (!imageFile) {
      setAiError("Please upload an image first.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiSummary("");

    try {
      const body = new FormData();
      body.append("image", imageFile);

      const response = await fetch("http://localhost:5000/api/analyze-device", {
        method: "POST",
        body,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "AI analysis failed");
      }

      if (!result.analysis) {
        throw new Error("No parsed AI analysis received from backend");
      }

      const parsed = result.analysis;

      const nextDeviceType = parsed.deviceType || "";
      const nextBrand = parsed.likelyBrand || "";
      const nextModel = parsed.exactModelReliable ? parsed.likelyModel || "" : "";
      const nextCondition = normalizeCondition(parsed.visibleCondition);
      const nextWorking = normalizeWorking(parsed.visibleCondition);

      const nextSummary = parsed.reasoning
        ? `${parsed.reasoning} Confidence: ${parsed.confidence}%.`
        : "AI detected device details successfully.";

      setFormData((prev) => ({
        ...prev,
        deviceType: nextDeviceType || prev.deviceType,
        brand: nextBrand || prev.brand,
        model: nextModel || prev.model,
        condition: nextCondition || prev.condition,
        working: nextWorking || prev.working,
        description: nextSummary || prev.description,
      }));

      setAiSummary(
        parsed.exactModelReliable
          ? `Detected ${parsed.deviceType}, likely ${parsed.likelyBrand} ${parsed.likelyModel}. Condition appears ${parsed.visibleCondition}. Confidence: ${parsed.confidence}%.`
          : `Detected ${parsed.deviceType}, likely brand ${parsed.likelyBrand}. Exact model was not confidently identified. Condition appears ${parsed.visibleCondition}. Confidence: ${parsed.confidence}%.`
      );
    } catch (error) {
      setAiError(error.message || "AI analysis failed. Please fill manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleReset = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData({
      deviceType: "",
      brand: "",
      model: "",
      age: "",
      condition: "",
      working: "",
      description: "",
    });
    setImageFile(null);
    setImagePreview("");
    setImageName("");
    setAiSummary("");
    setAiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setAiError("Please login first.");
        navigate("/login");
        return;
      }

      const payload = {
        ...formData,
        uid: currentUser.uid,
        userEmail: currentUser.email || "",
        imageName,
        imagePreview,
        status: "submitted",
        createdAt: new Date().toISOString(),
      };

      const firebaseId = await saveDevice(payload);

      navigate("/estimate", {
        state: {
          ...payload,
          firebaseId,
        },
      });
    } catch (error) {
      console.error("Firebase save error:", error);
      setAiError("Failed to save to Firebase");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            AI-Assisted Device Submission
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Sell Your E-Waste
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Upload a device image, let AI detect the details, review the
            autofilled fields, and continue to get a smart valuation.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white shadow-lg rounded-3xl p-6 sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Image
                </label>

                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-green-500 transition bg-gray-50 text-center">
                  <span className="text-gray-700 font-medium mb-1">
                    Upload device image
                  </span>
                  <span className="text-sm text-gray-400">
                    JPG, PNG, JPEG, WEBP supported
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imageName && (
                  <p className="text-sm text-green-600 mt-3 font-medium break-all">
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

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAIAnalyze}
                    disabled={aiLoading}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition"
                  >
                    {aiLoading ? "Analyzing with AI..." : "Analyze with AI"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl transition"
                  >
                    Reset Form
                  </button>
                </div>

                {aiSummary && (
                  <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      AI Summary
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiSummary}
                    </p>
                  </div>
                )}

                {aiError && (
                  <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                    <h3 className="font-semibold text-red-700 mb-1">Error</h3>
                    <p className="text-sm text-red-600 break-words">
                      {aiError}
                    </p>
                  </div>
                )}
              </div>

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
                  Age of Device
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="In years"
                  min="0"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
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
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe scratches, cracks, battery issues, screen damage, etc."
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                >
                  Get Estimated Value
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-3xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                How AI Helps
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                  📷 Detects device from uploaded image
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  🤖 Autofills brand, model, condition
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  ✍️ User can review and edit details
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  ⚡ Saves submission to Firebase
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-3xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Pro Tip
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload a clear front-facing image of the device for better AI
                detection. After analysis, confirm the autofilled details before
                moving ahead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}