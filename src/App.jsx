import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import Dashboard from "./pages/Dashboard";
import Estimate from "./pages/Estimate";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Pickup from "./pages/Pickup";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import Recyclers from "./pages/Recyclers";
import Sell from "./pages/Sell";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/estimate" element={<Estimate />} />
            <Route path="/recyclers" element={<Recyclers />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="user">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collector"
              element={
                <ProtectedRoute role="collector">
                  <CollectorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recycler"
              element={
                <ProtectedRoute role="recycler">
                  <RecyclerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
