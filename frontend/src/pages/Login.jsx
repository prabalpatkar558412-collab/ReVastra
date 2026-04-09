import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      let role = "user";

      if (userSnap.exists()) {
        role = userSnap.data().role || "user";
      }

      setMessage("Login successful");
      setFormData({
        email: "",
        password: "",
      });

      if (role === "admin") {
        navigate("/admin");
        return;
      }

      if (role === "recycler") {
        navigate("/dashboard/recycler");
        return;
      }

      if (role === "startup_owner") {
        navigate("/dashboard/startup");
        return;
      }

      // normal user ke liye device check
      const deviceQuery = query(
        collection(db, "devices"),
        where("uid", "==", uid),
        limit(1)
      );

      const deviceSnap = await getDocs(deviceQuery);

      if (deviceSnap.empty) {
        navigate("/sell");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}