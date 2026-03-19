import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, provider, db } from "../firebase";

export default function Login() {
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email.endsWith("@neu.edu.ph")) {
        await auth.signOut();
        setError("Only @neu.edu.ph emails are allowed.");
        return;
      }

      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await set(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "user",
          isBlocked: false,
          college: "",
          isEmployee: false,
        });
      } else if (snapshot.val().isBlocked) {
        await auth.signOut();
        setError("Your account has been blocked.");
        return;
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f0f4f8" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "400px", width: "100%" }}>
        <h1 style={{ color: "#1a237e", marginBottom: "8px" }}>NEU Library</h1>
        <p style={{ color: "#666", marginBottom: "32px" }}>Visitor Management System</p>
        {error && <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>}
        <button onClick={handleLogin} style={{ backgroundColor: "#1a237e", color: "white", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "16px", cursor: "pointer", width: "100%" }}>
          Sign in with Institutional ID
        </button>
      </div>
    </div>
  );
}