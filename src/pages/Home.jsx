import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4">
      
      <h1 className="text-5xl font-bold text-green-600 mb-4">
        Blood Donation ♻️
      </h1>

      <p className="text-lg text-gray-600 mb-6 max-w-xl">
        Turn your e-waste into value. Sell broken or unused devices and contribute to a sustainable future.
      </p>

      <div className="flex gap-4">
        <Link to="/sell">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Sell Your Device
          </button>
        </Link>

        <button className="border border-green-600 text-green-600 px-6 py-3 rounded-lg">
          Learn More
        </button>
      </div>

    </div>
  );
}