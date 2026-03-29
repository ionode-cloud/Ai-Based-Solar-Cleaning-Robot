import React from "react";
import "../App.css";

const MetricCard = ({ title, value, unit, icon: Icon, color }) => {
  // Check if the value is numeric
  const isNumeric = typeof value === "number" && !isNaN(value);

  // Format only if numeric, otherwise show text directly
  const formattedValue = isNumeric ? value.toFixed(1) : String(value || "N/A");

  return (
    <div className="metric-card" style={{ borderColor: "#374151" }}>
      {/* Icon Section */}
      {Icon && (
        <div className="icon-wrapper" style={{ backgroundColor: color }}>
          <Icon size={24} />
        </div>
      )}

      {/* Title */}
      <div className="card-title">{title}</div>

      {/* Value */}
      <div className="card-value">
        {formattedValue}
        {/* Unit only for numeric values */}
        {isNumeric && <span className="card-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default MetricCard;
