import React, { useState, useEffect } from "react";
import {
  LineChart,
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
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Oops, API did not return JSON. Check your VITE_API_BASE_URL. Returning HTML error.");
        return;
      }

      const json = await response.json();

      if (json?.data) {
        // Convert API object to array of data
        const chartData = [
          { metric: "Voltage", value: json.data.voltage },
          { metric: "SOC (%)", value: json.data.soc },
          { metric: "Temperature", value: json.data.temperature },
          { metric: "Dust Level", value: json.data.dustStatus?.dustLevel || 0 },
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
    const headers = ["Metric", "Value"];
    const rows = data.map(d => [d.metric, d.value]);
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
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey="metric" stroke="#9ca3af" tick={{ fill: "#e5e7eb" }} />
            <YAxis stroke="#9ca3af" tick={{ fill: "#e5e7eb" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#f59e0b", fontWeight: "bold" }}
              formatter={(value, name) => [value, name]}
            />
            <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: "#f59e0b" }} activeDot={{ r: 8 }}>
              <LabelList dataKey="value" position="top" fill="#f59e0b" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
