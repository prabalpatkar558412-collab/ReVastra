import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Sell from "./pages/Sell";
import Loader from "./pages/Loader";
import Estimate from "./pages/EstimationResult";
import Recyclers from "./pages/Recyclers";
import Pickup from "./pages/Pickup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/loading" element={<Loader />} />
            <Route path="/estimate" element={<Estimate />} />
            <Route path="/recyclers" element={<Recyclers />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;