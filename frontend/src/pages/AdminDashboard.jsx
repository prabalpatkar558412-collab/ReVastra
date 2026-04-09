import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  // 🔥 fetch all users
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));

    const userList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers(userList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 role update
  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        role: newRole,
      });

      alert("Role updated");

      fetchUsers(); // refresh
    } catch (error) {
      console.error(error);
      alert("Error updating role");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Admin Panel
        </h1>

        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-3">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="capitalize">{user.role}</td>

                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border rounded px-3 py-2"
                    >
                      <option value="user">User</option>
                      <option value="recycler">Recycler</option>
                      <option value="startup_owner">
                        Startup Owner
                      </option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}