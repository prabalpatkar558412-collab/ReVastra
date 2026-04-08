import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between p-4 bg-black text-white">
      <h1>EcoLoop</h1>
      <div>
        <Link to="/">Home</Link>
        <Link to="/sell" className="ml-4">Sell</Link>
      </div>
    </nav>
  );
}