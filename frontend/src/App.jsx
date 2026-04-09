import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Sell from "./pages/Sell";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import Recyclers from "./pages/Recyclers";

function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/admin" ||
    location.pathname === "/login" ||
    location.pathname === "/dashboard/recycler";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/recyclers" element={<Recyclers />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/recycler" element={<RecyclerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;