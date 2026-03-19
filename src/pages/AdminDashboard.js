import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { auth, db } from "../firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [visits, setVisits] = useState([]);
  const [range, setRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [filterCollege, setFilterCollege] = useState("all");
  const [employeeOnly, setEmployeeOnly] = useState(false);

  const purposes = ["all", "Study", "Research", "Borrow Books", "Computer Use", "Group Discussion", "Consultation"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchVisits(); }, [range, startDate, endDate, filterPurpose, filterCollege, employeeOnly]);

  const fetchVisits = async () => {
    const snapshot = await get(ref(db, "visits"));
    if (!snapshot.exists()) return;
    let data = Object.values(snapshot.val());

    const now = new Date();
    let start;
    if (range === "today") { start = new Date(now); start.setHours(0,0,0,0); }
    else if (range === "week") { start = new Date(now); start.setDate(now.getDate()-7); }
    else if (range === "month") { start = new Date(now); start.setMonth(now.getMonth()-1); }
    else if (range === "custom" && startDate) { start = new Date(startDate); }

    if (start) data = data.filter(v => v.timestamp >= start.getTime());
    if (range === "custom" && endDate) {
      const end = new Date(endDate); end.setHours(23,59,59,999);
      data = data.filter(v => v.timestamp <= end.getTime());
    }
    if (filterPurpose !== "all") data = data.filter(v => v.purposeOfVisit === filterPurpose);
    if (filterCollege !== "all") data = data.filter(v => v.college === filterCollege);
    if (employeeOnly) data = data.filter(v => v.isEmployee);
    setVisits(data);
  };

  const getColleges = () => [...new Set(visits.map(v => v.college))];

  const byCollege = getColleges().map(col => ({
    name: col, visits: visits.filter(v => v.college === col).length
  }));

  const byPurpose = purposes.filter(p => p !== "all").map(p => ({
    name: p, visits: visits.filter(v => v.purposeOfVisit === p).length
  })).filter(p => p.visits > 0);

  return (
    <div style={{ padding: "24px", backgroundColor: "#f0f4f8", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#1a237e", margin: 0 }}>Admin Dashboard</h1>
        <button onClick={() => auth.signOut()} style={{ padding: "8px 16px", backgroundColor: "#c62828", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Sign Out</button>
      </div>

      {/* Filters */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
        {range === "custom" && <>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}/>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}/>
        </>}
        <select value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd" }}>
          {purposes.map(p => <option key={p} value={p}>{p === "all" ? "All Purposes" : p}</option>)}
        </select>
        <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <option value="all">All Colleges</option>
          {getColleges().map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <input type="checkbox" checked={employeeOnly} onChange={e => setEmployeeOnly(e.target.checked)}/>
          Employees only
        </label>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Visits", value: visits.length, color: "#1a237e" },
          { label: "Students", value: visits.filter(v => !v.isEmployee).length, color: "#00695c" },
          { label: "Employees", value: visits.filter(v => v.isEmployee).length, color: "#e65100" },
          { label: "Colleges", value: getColleges().length, color: "#6a1b9a" },
        ].map(card => (
          <div key={card.label} style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: card.color }}>{card.value}</div>
            <div style={{ color: "#666", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "white", padding: "24px", borderRadius: "12px" }}>
          <h3 style={{ color: "#1a237e", marginTop: 0 }}>Visits by College</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byCollege}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }}/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="visits" fill="#1a237e"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "white", padding: "24px", borderRadius: "12px" }}>
          <h3 style={{ color: "#1a237e", marginTop: 0 }}>Visits by Purpose</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byPurpose}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }}/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="visits" fill="#00695c"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
