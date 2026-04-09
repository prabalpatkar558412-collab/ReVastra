import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-green-600 font-semibold mb-3">
              Integrated E-Waste Circular Economy Marketplace
            </p>

            <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
              Connect Consumers, Collectors, and
              <span className="text-green-600"> Certified Recyclers</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              ReVastra helps users evaluate end-of-life devices, route them
              through local collection partners, deliver them to certified
              recyclers, and track value recovery with transparent status
              updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/sell"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition text-center"
              >
                Start Device Submission
              </Link>

              <Link
                to="/login"
                className="border border-gray-300 hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-semibold transition text-center"
              >
                Login To Dashboard
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              How The Marketplace Works
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <h3 className="font-semibold text-gray-800">
                  1. User Adds Device
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Consumers submit photos, condition, and model details for
                  phones, laptops, batteries, and other electronics.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <h3 className="font-semibold text-gray-800">
                  2. Platform Values It
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  AI validation and estimate logic calculate transparent device
                  value and sustainability impact.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
                <h3 className="font-semibold text-gray-800">
                  3. Collector Moves It
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Local scrap collectors handle doorstep pickup and move the
                  device toward the selected recycler.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <h3 className="font-semibold text-gray-800">
                  4. Recycler Processes It
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Certified recyclers verify, recover materials, and complete
                  the recycling or refurbishment workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Consumer</h3>
            <p className="text-gray-600">
              Submit old electronics, see real value, and track payment and
              impact.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Collector</h3>
            <p className="text-gray-600">
              Manage assigned pickups, collect devices, and deliver them to the
              right recycler.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Recycler</h3>
            <p className="text-gray-600">
              Verify devices, process materials, and close the loop with safe
              recovery.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Admin</h3>
            <p className="text-gray-600">
              Monitor marketplace activity, approvals, and overall e-waste
              operations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
