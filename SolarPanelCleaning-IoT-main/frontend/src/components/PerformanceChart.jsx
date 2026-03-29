import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const PerformanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch API data every 5 seconds
  const fetchSolarData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/solar-data`);
      const json = await response.json();

      if (json?.data) {
        // Convert API object to array of hourly-like data
        const chartData = [
          { hour: "Voltage", close: json.data.voltage, efficiency: json.data.efficiency },
          { hour: "Current", close: json.data.current, efficiency: json.data.efficiency },
          { hour: "Power", close: json.data.power, efficiency: json.data.efficiency },
          { hour: "Avg Power", close: json.data.avgPower, efficiency: json.data.efficiency },
          { hour: "Avg Voltage", close: json.data.avgVoltage, efficiency: json.data.efficiency },
          { hour: "Energy Today", close: json.data.energyToday, efficiency: json.data.efficiency },
          { hour: "Temperature", close: json.data.temperature, efficiency: json.data.efficiency },
        ];

        setData(chartData);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching solar data:", err);
    }
  };

  useEffect(() => {
    fetchSolarData();
    const interval = setInterval(fetchSolarData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const downloadCSV = () => {
    const headers = ["Metric", "Value", "Efficiency"];
    const rows = data.map(d => [d.hour, d.close, d.efficiency]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `solar_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading chart data...</p>;

  return (
    <div style={{ padding: "20px", marginTop: "20px", backgroundColor: "#1f2937", borderRadius: "8px" }}>
      <h3 style={{ color: "#e5e7eb" }}>Performance Analytics (Live)</h3>
      <button
        onClick={downloadCSV}
        style={{
          padding: "6px 12px",
          backgroundColor: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        Download CSV
      </button>

      <div className="recharts-wrapper" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fill: "#e5e7eb" }} />
            <YAxis stroke="#9ca3af" tick={{ fill: "#e5e7eb" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#f59e0b", fontWeight: "bold" }}
              formatter={(value, name) => [value, name]}
            />
            <Bar dataKey="close" fill="#f59e0b" barSize={20} background={{ fill: "#374151" }}>
              <LabelList dataKey="close" position="top" fill="#f59e0b" />
            </Bar>
            <Line type="monotone" dataKey="efficiency" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
