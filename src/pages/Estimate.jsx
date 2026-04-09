import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export default function Estimate() {
  const location = useLocation();
  const data = location.state;
  const [estimateData, setEstimateData] = useState(data || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const previewImage = useMemo(
    () => estimateData?.localImagePreview || estimateData?.imageUrl,
    [estimateData]
  );

  if (!estimateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Submission Data Found
          </h1>
          <p className="text-gray-500 mb-6">
            Please submit your device first to continue.
          </p>
          <Link
            to="/sell"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Go to Sell Page
          </Link>
        </div>
      </div>
    );
  }

  const handleGenerateEstimate = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${apiBaseUrl}/estimates/${estimateData.submissionId}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to generate estimate");
      }

      setEstimateData((prev) => ({
        ...prev,
        ...result.data,
      }));
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const hasEstimate = Number.isFinite(estimateData.estimatedValue);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Smart Value Estimation
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            {hasEstimate ? "Estimated Device Value" : "Generate Device Estimate"}
          </h1>
          <p className="text-gray-500">
            {hasEstimate
              ? "Your submission has been processed and the estimated value is ready."
              : "Your submission is saved. Generate a real estimate from the backend to continue."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow-md rounded-3xl p-6 sm:p-8">
            {estimateData.imageUploadError ? (
              <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Submission was saved, but the image could not be uploaded to
                Firebase Storage.
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {previewImage ? (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Uploaded Image</p>
                <img
                  src={previewImage}
                  alt="Submitted device"
                  className="w-full max-w-md rounded-2xl border shadow"
                />
              </div>
            ) : null}

            {hasEstimate ? (
              <div className="mb-6 p-5 rounded-2xl bg-green-50 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Estimated Value</p>
                <h2 className="text-4xl sm:text-5xl font-bold text-green-600">
                  {"\u20B9"}
                  {estimateData.estimatedValue}
                </h2>
                <p className="mt-3 text-gray-700">
                  <span className="font-semibold">Suggestion:</span>{" "}
                  {estimateData.suggestion}
                </p>
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Submission ID</p>
                <h3 className="font-semibold break-all">
                  {estimateData.submissionId}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Status</p>
                <h3 className="font-semibold capitalize">{estimateData.status}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Device</p>
                <h3 className="font-semibold">{estimateData.deviceType}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Brand</p>
                <h3 className="font-semibold">{estimateData.brand}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Model</p>
                <h3 className="font-semibold">{estimateData.model}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Age</p>
                <h3 className="font-semibold">{estimateData.age} years</h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/sell"
                className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-100 text-center"
              >
                Back
              </Link>

              {!hasEstimate ? (
                <button
                  type="button"
                  onClick={handleGenerateEstimate}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl text-center disabled:opacity-70"
                >
                  {isLoading ? "Generating..." : "Generate Estimate"}
                </button>
              ) : (
                <Link
                  to="/recyclers"
                  state={estimateData}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl text-center hover:bg-green-700"
                >
                  View Recyclers
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-4">Backend Sync</h3>
              <div className="space-y-3 text-gray-700">
                <div className="p-3 bg-green-50 border rounded-xl">
                  Submission stored in Firestore
                </div>
                <div className="p-3 bg-blue-50 border rounded-xl">
                  {estimateData.imageUrl
                    ? "Image uploaded to Firebase Storage"
                    : "Image preview available locally"}
                </div>
                <div className="p-3 bg-yellow-50 border rounded-xl">
                  {hasEstimate
                    ? "Estimate generated from backend"
                    : "Waiting for estimate generation"}
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-4">Environmental Impact</h3>

              {hasEstimate ? (
                <div className="space-y-3 text-gray-700">
                  <div className="p-3 bg-green-50 border rounded-xl">
                    {"\u267B\uFE0F"} {estimateData.impact?.ewasteSavedKg}kg
                    e-waste saved
                  </div>
                  <div className="p-3 bg-blue-50 border rounded-xl">
                    {"\uD83C\uDF3F"} {estimateData.impact?.co2ReducedG}g CO2
                    reduced
                  </div>
                  <div className="p-3 bg-yellow-50 border rounded-xl">
                    {"\uD83D\uDD2C"} {estimateData.impact?.goldRecoveredG}g gold
                    recovered
                  </div>
                  <div className="p-3 bg-purple-50 border rounded-xl">
                    Sustainability Score: {estimateData.sustainabilityScore}%
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Generate the estimate to see impact insights and sustainability
                  score.
                </p>
              )}
            </div>

            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-4">Description</h3>
              <p className="text-gray-600">
                {estimateData.description || "No additional description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
