import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Loader() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/estimate");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-green-100 p-8 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            ♻️
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Estimating Device Value
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Analyzing recyclable materials, device condition, and recycler demand...
          </p>
        </div>

        <div className="w-full space-y-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-green-500 animate-pulse rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Checking materials</span>
            <span>Almost done...</span>
          </div>
        </div>
      </div>
    </div>
  );
}