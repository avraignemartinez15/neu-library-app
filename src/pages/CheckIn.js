import { useState } from "react";
import { ref, push } from "firebase/database";
import { auth, db } from "../firebase";

export default function CheckIn({ onCheckIn }) {
  const [colleges] = useState([
    "College of Informatics and Computer Studies",
    "College of Nursing",
    "College of Engineering",
    "College of Business Administration",
    "College of Education",
    "College of Arts and Sciences",
    "Faculty / Staff"
  ]);
  const [purpose, setPurpose] = useState("");
  const [college, setCollege] = useState("");
  const [isEmployee, setIsEmployee] = useState(false);

  const purposes = ["Study", "Research", "Borrow Books", "Computer Use", "Group Discussion", "Consultation"];

  const handleSubmit = async () => {
  if (!purpose || !college) return;
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in again.");
    return;
  }
  await push(ref(db, "visits"), {
    userId: user.uid,
    email: user.email,
    displayName: user.displayName,
    purposeOfVisit: purpose,
    college: college,
    isEmployee: isEmployee,
    timestamp: Date.now(),
  });
  onCheckIn(isEmployee);
};
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f0f4f8" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "440px" }}>
        <h2 style={{ color: "#1a237e", marginBottom: "24px", textAlign: "center" }}>Library Check-In</h2>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#333" }}>Purpose of Visit</label>
          <select value={purpose} onChange={e => setPurpose(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}>
            <option value="">Select purpose...</option>
            {purposes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#333" }}>College / Department</label>
          <select value={college} onChange={e => setCollege(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}>
            <option value="">Select college...</option>
            {colleges.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={isEmployee} onChange={e => setIsEmployee(e.target.checked)} />
            <span style={{ color: "#333" }}>I am an employee (teacher / staff)</span>
          </label>
        </div>
        <button onClick={handleSubmit} disabled={!purpose || !college} style={{ width: "100%", padding: "12px", backgroundColor: !purpose || !college ? "#ccc" : "#1a237e", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: !purpose || !college ? "not-allowed" : "pointer" }}>
          Check In
        </button>
      </div>
    </div>
  );
}