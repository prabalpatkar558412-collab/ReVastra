export default function Loader({
  message = "Processing your request...",
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
        <div
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin"
          aria-hidden="true"
        />

        <p className="max-w-xs text-sm sm:text-base font-medium text-gray-600">
          {message}
        </p>
      </div>
    </div>
  );
}