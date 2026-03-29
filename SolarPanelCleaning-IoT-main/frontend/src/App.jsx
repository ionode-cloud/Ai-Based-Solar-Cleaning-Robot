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
  current: 0,
  power: 0,
  avgVoltage: 0,
  avgPower: 0,
  energyToday: 0,
  efficiency: 0,
  temperature: 0,
  aqi: 0,
  moisture: 0,
  climate: "Unknown",
  dustStatus: "Unknown",
  dustLevel: 0,
  cleaningProgress: 0,
  robotPosition: "Unknown",
  batteryLevel: 100,
  cleaningHistory: [],
  performanceData: [],
  lastCleaned: null,
  forceCleaningStatus: false,
};

const App = () => {
  const [data, setData] = useState(initialMockData);

  // Fetch Live Data from API
  const fetchSolarData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/solar-data`);
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
          voltage: latest.voltage,
          current: latest.current,
          power: latest.power,
          avgVoltage: latest.avgVoltage,
          avgPower: latest.avgPower,
          energyToday: latest.energyToday,
          efficiency: latest.efficiency,
          temperature: latest.temperature,
          aqi: latest.aqi,
          moisture: latest.moisture,
          climate: latest.climate,
          dustStatus: latest.dustStatus?.status || "Unknown",
          dustLevel: latest.dustStatus?.dustLevel || 0,
          forceCleaningStatus: latest.dustStatus?.forceCleaningStatus || false,
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

      const result = await response.json();
      console.log("Force Cleaning Triggered:", result);

      // Optional: Refresh latest API data after short delay
      setTimeout(fetchSolarData, 5000);
    } catch (error) {
      console.error("Error triggering Force Cleaning:", error);
    }
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
      {/* Header */}
      <header className="header">
        <div>
          <h1 className="header-title text-white">
            <span className="text-yellow">Solar</span> Panel
          </h1>
          <p className="header-subtitle">AI Based Solar cleaning Robot</p>
        </div>

        <div className="header-actions">
          <button onClick={handleDownload} className="download-button" title="Download All Data">
            <Download size={18} className="download-icon" /> Download Data
          </button>
          <div className="text-green" style={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
            <Wifi size={20} style={{ marginRight: "0.5rem" }} /> System Online
          </div>
        </div>
      </header>

      {/* Dashboard Layout */}
      <div className="main-grid">
        {/* Left Column */}
        <div className="data-section">
          <div className="data-cards-grid">
            <MetricCard title="Voltage" value={data.voltage} unit="V" icon={Zap} color="#d97706" />
            <MetricCard title="Current" value={data.current} unit="A" icon={Bolt} color="#059669" />
            <MetricCard title="Power" value={data.power} unit="kW" icon={Power} color="#dc2626" />
            <MetricCard title="Energy Today" value={data.energyToday} unit="kWh" icon={Gauge} color="#2563eb" />
            <MetricCard title="AQI" value={data.aqi} icon={Wind} color="#2e4a82ff" />
            <MetricCard title="Moisture" value={data.moisture} unit="%" icon={Droplet} color="#775650ff" />
            <MetricCard title="Climate" value={data.climate} icon={CloudSun} color="#97afe3ff" />
            <MetricCard title="Temperature" value={data.temperature} unit="°C" icon={ThermometerSun} color="#FFD700" />
          </div>

          {/* Hourly Status */}
          <h3 className="hourly-status-section-title">Last Hourly Status</h3>
          <div className="hourly-status-grid">
            <HourlyStatusCard title="Avg Power" value={data.avgPower.toFixed(1)} unit="kW" color="#f87171" icon={Power} />
            <HourlyStatusCard title="Avg Voltage" value={data.avgVoltage.toFixed(1)} unit="V" color="#facc15" icon={Zap} />
            <HourlyStatusCard title="Efficiency" value={data.efficiency} unit="%" color="#4ade80" icon={TrendingUp} />
            <HourlyStatusCard title="Temperature" value={data.temperature} unit="°C" color="#60a5fa" icon={Thermometer} />
          </div>

          {/* Dust Level */}
          <DustLevelBar
            percentage={data.dustLevel}
            status={data.dustStatus}
            lastCleaned={data.lastCleaned}
            onForceClean={handleForceClean}
          />
        </div>

        {/* Right Column */}
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

      {/* Chart */}
      <PerformanceChart data={data.performanceData} />
    </div>
  );
};

export default App;
