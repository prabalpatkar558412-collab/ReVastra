import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Sell from "./pages/Sell";
import Loader from "./pages/Loader";
import Estimate from "./pages/EstimationResult";
import Recyclers from "./pages/Recyclers";
import Pickup from "./pages/Pickup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import StartupDashboard from "./pages/StartupDashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* User Protected Routes */}
          <Route
            path="/sell"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "recycler", "startup_owner"]}>
                <Sell />
              </ProtectedRoute>
            }
          />

          <Route
            path="/loading"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "recycler", "startup_owner"]}>
                <Loader />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estimate"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "recycler", "startup_owner"]}>
                <Estimate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recyclers"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "recycler", "startup_owner"]}>
                <Recyclers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pickup"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "recycler", "startup_owner"]}>
                <Pickup />
              </ProtectedRoute>
            }
          />

          {/* Main Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "recycler", "startup_owner"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Recycler Dashboard */}
          <Route
            path="/dashboard/recycler"
            element={
              <ProtectedRoute allowedRoles={["recycler", "admin"]}>
                <RecyclerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Startup Dashboard */}
          <Route
            path="/dashboard/startup"
            element={
              <ProtectedRoute allowedRoles={["startup_owner", "admin"]}>
                <StartupDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;