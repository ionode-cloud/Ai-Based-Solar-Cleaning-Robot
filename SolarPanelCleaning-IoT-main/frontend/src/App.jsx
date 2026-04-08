import React, { useState, useCallback, useEffect } from "react";
import {
  Download,
  Wifi,
  Zap,
  Bolt,
  Power,
  Gauge,
  TrendingUp,
  Thermometer,
  Wind,
  CloudSun,
  Droplet,
  ThermometerSun,
} from "lucide-react";
import MetricCard from "./components/MetricCard";
import HourlyStatusCard from "./components/HourlyStatusCard";
import DustLevelBar from "./components/DustLevelBar";
import LiveVideoPanel from "./components/LiveVideoPanel";
import PerformanceChart from "./components/PerformanceChart";
import "./App.css";

// Initial Mock Data
const initialMockData = {
  voltage: 0,
  soc: 0,
  temperature: 0,
  dustStatus: "Unknown",
  dustLevel: 0,
  cleaningProgress: 0,
  robotPosition: "Unknown",
  batteryLevel: 100,
  cleaningHistory: [],
  performanceData: [],
  lastCleaned: null,
  forceCleaningStatus: false,
  operationMode: "Auto",
  cleaningMode: "Dry",
};

const App = () => {
  const [data, setData] = useState(initialMockData);
  // Separate UI-only state so the API fetch never resets the user's mode choice
  const [uiMode, setUiMode] = useState(initialMockData.operationMode); // "Auto" | "Manual"

  // Fetch Live Data from API
  const fetchSolarData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/solar-data`);
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Oops, API did not return JSON. Check your VITE_API_BASE_URL. Returning HTML error.");
        return;
      }

      const json = await response.json();

      if (json && json.data) {
        const latest = json.data;

        const newHistoryEntry = {
          date: new Date(latest.createdAt).toLocaleDateString(),
          status: latest.dustStatus?.forceCleaningStatus ? "Force Cleaning" : "Auto Update",
          createdAt: latest.createdAt,
          updatedAt: latest.updatedAt,
        };

        setData((prev) => ({
          ...prev,
          voltage: latest.voltage ?? prev.voltage,
          soc: latest.soc ?? prev.soc,
          temperature: latest.temperature ?? prev.temperature,
          dustStatus: latest.dustStatus?.status || "Unknown",
          dustLevel: latest.dustStatus?.dustLevel ?? prev.dustLevel,
          forceCleaningStatus: latest.dustStatus?.forceCleaningStatus || false,
          // NOTE: operationMode and cleaningMode are NOT overwritten here —
          // they are controlled by the user via uiMode / local data state only.
          cleaningMode: latest.cleaningMode || prev.cleaningMode,
          updatedAt: latest.updatedAt,
          cleaningHistory: [newHistoryEntry, ...prev.cleaningHistory],
        }));
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  useEffect(() => {
    fetchSolarData();
    const interval = setInterval(fetchSolarData, 120000); // 2 min refresh
    return () => clearInterval(interval);
  }, []);

  // Force Clean Function (Triggered by Button)
  const handleForceClean = async () => {
    const now = new Date();
    const newEntry = {
      date: now.toLocaleDateString(),
      status: "Force Cleaning",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Show immediate UI update
    setData((prev) => ({
      ...prev,
      dustStatus: "Cleaning",
      forceCleaningStatus: true,
      cleaningHistory: [newEntry, ...prev.cleaningHistory],
    }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/solar-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dustStatus: {
            status: "Cleaning",
            dustLevel: data.dustLevel,
            forceCleaningStatus: true, //  set TRUE
          },
        }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("Force Cleaning Triggered:", result);
      } else {
        console.warn("Force Cleaning API did not return JSON");
      }

      // Optional: Refresh latest API data after short delay
      setTimeout(fetchSolarData, 5000);
    } catch (error) {
      console.error("Error triggering Force Cleaning:", error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/solar-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          [key]: value
        }),
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log(`Setting ${key} updated:`, result);
      } else {
        console.warn(`Setting ${key} API did not return JSON`);
      }
      setTimeout(fetchSolarData, 1000);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  };

  const handleOperationModeChange = (mode) => {
    if (uiMode === mode) return;
    setUiMode(mode);
    setData(prev => ({ ...prev, operationMode: mode }));
    updateSetting("operationMode", mode);
  };

  const handleCleaningModeChange = (mode) => {
    if (data.cleaningMode === mode) return;
    setData(prev => ({ ...prev, cleaningMode: mode }));
    updateSetting("cleaningMode", mode);
  };

  //  Download Data
  const handleDownload = useCallback(() => {
    const dataToDownload = { timestamp: new Date().toISOString(), ...data };
    const jsonString = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solar_dashboard_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  return (
    <div className="dashboard-container">
      {/* ── HEADER ── */}
      <header className="header">
        <div>
          <h1 className="header-title">
            <span className="text-yellow">Solar</span> Panel Cleaning Robot
          </h1>
          <p className="header-subtitle">AI-Based Autonomous Cleaning System</p>
        </div>

        <div className="header-actions">
          <button onClick={handleDownload} className="download-button" title="Download All Data">
            <Download size={16} /> Download Data
          </button>
          <div className="online-badge">
            <span className="online-dot" />
            System Online
          </div>
        </div>
      </header>

      {/* ── DASHBOARD LAYOUT ── */}
      <div className="main-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="data-section">

          {/* Metric Cards */}
          <div className="data-cards-grid">
            <MetricCard title="Voltage" value={data.voltage} unit="V" icon={Zap} color="#f59e0b" />
            <MetricCard title="SOC" value={data.soc} unit="%" icon={Bolt} color="#10b981" />
            <MetricCard title="Temperature" value={data.temperature} unit="°C" icon={ThermometerSun} color="#f87171" />
          </div>

          {/* Control Panel */}
          <div className="hourly-status-section-title" style={{ marginTop: '8px' }}>Control Panel</div>
          <div className="control-panel-grid">

            {/* Operation Mode Card */}
            <div className="control-card">
              <span className="control-card-label">Operation Mode</span>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${data.operationMode === "Auto" ? "active-green" : ""}`}
                  onClick={() => handleOperationModeChange("Auto")}>
                  Auto
                </button>
                <button
                  className={`mode-btn ${data.operationMode === "Manual" ? "active-blue" : ""}`}
                  onClick={() => handleOperationModeChange("Manual")}>
                  Manual
                </button>
              </div>
            </div>

            {/* Cleaning Mode Card — locked in Auto mode */}
            <div className={`control-card${uiMode === "Auto" ? " panel-locked" : ""}`}>
              <span className="control-card-label">Cleaning Mode</span>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${data.cleaningMode === "Dry" ? "active-amber" : ""}`}
                  onClick={() => handleCleaningModeChange("Dry")}
                  disabled={uiMode === "Auto"}>
                  Dry
                </button>
                <button
                  className={`mode-btn ${data.cleaningMode === "Wet" ? "active-sky" : ""}`}
                  onClick={() => handleCleaningModeChange("Wet")}
                  disabled={uiMode === "Auto"}>
                  Wet
                </button>
              </div>
            </div>

          </div>

          {/* Dust Level Bar — locked in Auto mode */}
          <DustLevelBar
            percentage={data.dustLevel}
            status={data.dustStatus}
            lastCleaned={data.lastCleaned}
            onForceClean={handleForceClean}
            isAutoMode={uiMode === "Auto"}
          />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="video-column">
          <LiveVideoPanel
            progress={data.cleaningProgress}
            robotPosition={data.robotPosition}
            batteryLevel={data.batteryLevel}
            nextCleaning={data.nextCleaning}
            cleaningHistory={data.cleaningHistory}
          />
        </div>
      </div>

      {/* ── CHART ── */}
      <PerformanceChart data={data.performanceData} />
    </div>
  );
};

export default App;

