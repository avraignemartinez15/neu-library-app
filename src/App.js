import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "./firebase";
import Login from "./pages/Login";
import CheckIn from "./pages/CheckIn";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snapshot = await get(ref(db, "users/" + firebaseUser.uid));
        const data = snapshot.val();
        if (data?.isBlocked) {
          await auth.signOut();
          setUser(null);
          setRole(null);
        } else {
          setRole(data?.role || "user");
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
  }, []);

  const handleCheckIn = (isEmployee) => {
    if (isEmployee) {
      setRole("admin");
    } else {
      setRole("checkedin");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#1a237e", fontSize: "18px" }}>Loading...</p>
    </div>
  );

  if (!user) return <Login />;
  if (role === "admin") return <AdminDashboard onSwitchRole={() => setRole("user")} />;
  if (role === "checkedin") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f0f4f8" }}>
      <div style={{ background: "white", padding: "60px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📚</div>
        <h1 style={{ color: "#2e7d32", fontSize: "2rem", marginBottom: "8px" }}>Welcome to NEU Library!</h1>
        <p style={{ color: "#666" }}>Your visit has been recorded.</p>
      </div>
    </div>
  );
  return <CheckIn onCheckIn={handleCheckIn} />;
}

export default App;