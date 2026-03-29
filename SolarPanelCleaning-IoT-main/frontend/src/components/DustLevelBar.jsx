import React, { useState, useEffect } from "react";
import { Sun, Clock, RefreshCcw } from "lucide-react";
import "../App.css";

const DustLevelBar = ({ percentage, status, lastCleaned, onForceClean, addCleaningHistory }) => {
  const [currentPercentage, setCurrentPercentage] = useState(percentage);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [lastClean, setLastClean] = useState(lastCleaned);
  const [isCleaning, setIsCleaning] = useState(false); // cleaning flag

  // update state from parent props
  useEffect(() => {
    setCurrentPercentage(percentage);
    setCurrentStatus(status);
    setLastClean(lastCleaned);
  }, [percentage, status, lastCleaned]);

  // Force clean handler
  const handleForceClean = () => {
    if (!isCleaning) {
      setIsCleaning(true);
      setCurrentStatus("Cleaning");
      onForceClean && onForceClean();

      // Add new cleaning history record
      if (addCleaningHistory) {
        addCleaningHistory({
          date: new Date().toLocaleDateString(),
          status: "Force Cleaning",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Reset back after 5 seconds
      setTimeout(() => {
        setIsCleaning(false);
        setCurrentStatus("Force Cleaning");
      }, 5000);
    }
  };

  // Color logic
  let barColor = "#f59e0b";
  if (currentPercentage < 20) barColor = "#10b981";
  else if (currentPercentage > 50) barColor = "#ef4444";

  return (
    <div className="dust-bar">
      <div className="dust-bar-container" style={{ borderColor: "#374151" }}>
        <div className="dust-header">
          <Sun className="dust-icon" size={24} />
          <div className="dust-title">Dust Status - {currentStatus}</div>
          <div className="last-cleaned">
            <Clock size={16} style={{ marginRight: "0.25rem" }} />
            Last Cleaned: {lastClean || "N/A"}
          </div>
        </div>

        <div className="dust-level-label">Dust Level ({currentStatus})</div>
        <div className="progress-wrapper">
          <div className="progress-bg">
            <div
              className="progress-bar"
              style={{
                width: `${currentPercentage}%`,
                backgroundColor: barColor,
                transition: "width 0.8s ease-in-out",
              }}
            ></div>
          </div>
          <span className="progress-percentage">{currentPercentage}%</span>
        </div>

        <button
          className="force-clean-btn"
          onClick={handleForceClean}
          disabled={isCleaning}
          style={{
            padding: "8px 14px",
            backgroundColor: isCleaning ? "#10b981" : "rgb(59,130,246)",
            color: "#fff",
            fontWeight: 500,
            border: "none",
            borderRadius: "6px",
            cursor: isCleaning ? "not-allowed" : "pointer",
            marginTop: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            opacity: isCleaning ? 0.7 : 1,
            transition: "background-color 0.3s ease",
          }}
        >
          <RefreshCcw size={16} className={isCleaning ? "spin-animation" : ""} />
          {isCleaning ? "Cleaning in Progress..." : "Force Cleaning"}
        </button>
      </div>
    </div>
  );
};

export default DustLevelBar;
