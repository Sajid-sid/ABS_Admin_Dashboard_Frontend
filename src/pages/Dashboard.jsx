import React from "react";
import { useSelector } from "react-redux";
import "./Dashboard.css";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="dashboard">
      <div className="main">
        <div className="content">
          <h2 className="overview-title">
            Welcome {user ? user.name || user.email : "Admin"}
            
          </h2>
          <div className="status-section">
            <div className="status-box status-confirmed">Booking Confirmed</div>
            <div className="status-box status-waiting">Waiting for Acceptance</div>
            <div className="status-box status-rejected">Rejected</div>
            <div className="status-box status-completed">Completed</div>
            <div className="status-box status-cancelled">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
