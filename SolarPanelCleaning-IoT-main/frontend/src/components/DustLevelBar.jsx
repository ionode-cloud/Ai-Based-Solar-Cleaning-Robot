import React, { useState, useEffect } from "react";
import { Sun, Clock, RefreshCcw } from "lucide-react";
import "../App.css";

const DustLevelBar = ({ percentage, status, lastCleaned, onForceClean, addCleaningHistory, isAutoMode }) => {
  const [currentPercentage, setCurrentPercentage] = useState(percentage);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [lastClean, setLastClean] = useState(lastCleaned);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    setCurrentPercentage(percentage);
    setCurrentStatus(status);
    setLastClean(lastCleaned);
  }, [percentage, status, lastCleaned]);

  const handleForceClean = () => {
    if (!isCleaning) {
      setIsCleaning(true);
      setCurrentStatus("Cleaning");
      onForceClean && onForceClean();

      if (addCleaningHistory) {
        addCleaningHistory({
          date: new Date().toLocaleDateString(),
          status: "Force Cleaning",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setTimeout(() => {
        setIsCleaning(false);
        setCurrentStatus("Force Cleaning");
      }, 5000);
    }
  };

  let barColor = "#f59e0b";
  if (currentPercentage < 20) barColor = "#10b981";
  else if (currentPercentage > 50) barColor = "#ef4444";

  return (
    <div className="dust-bar">
      <div className={`dust-bar-container${isAutoMode ? " panel-locked" : ""}`}>
        <div className="dust-header">
          <Sun className="dust-icon" size={20} />
          <div className="dust-title">Dust Status — <span style={{ color: barColor }}>{currentStatus}</span></div>
          <div className="last-cleaned">
            <Clock size={14} />
            {lastClean || "N/A"}
          </div>
        </div>

        <div className="dust-level-label">Dust Level</div>
        <div className="progress-wrapper">
          <div className="progress-bg">
            <div
              className="progress-bar"
              style={{ width: `${currentPercentage}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="progress-percentage">{currentPercentage}%</span>
        </div>

        <button
          className="force-clean-btn"
          onClick={handleForceClean}
          disabled={isCleaning || isAutoMode}
        >
          <RefreshCcw size={15} className={isCleaning ? "spin-animation" : ""} />
          {isCleaning ? "Cleaning..." : "Force Clean"}
        </button>
      </div>
    </div>
  );
};

export default DustLevelBar;

