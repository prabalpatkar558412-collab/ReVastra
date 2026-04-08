import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Sell from "./pages/Sell";
import Estimate from "./pages/Estimate";
import Recyclers from "./pages/Recyclers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/recyclers" element={<Recyclers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;