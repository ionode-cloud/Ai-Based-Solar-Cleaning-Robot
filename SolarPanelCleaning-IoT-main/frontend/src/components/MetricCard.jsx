import React from "react";
import "../App.css";

const MetricCard = ({ title, value, unit, icon: Icon, color }) => {
  const isNumeric = typeof value === "number" && !isNaN(value);
  const formattedValue = isNumeric ? value.toFixed(1) : String(value || "N/A");

  return (
    <div className="metric-card fade-up">
      {Icon && (
        <div className="icon-wrapper" style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}>
          <Icon size={20} style={{ color }} />
        </div>
      )}
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color: isNumeric ? "#f0f4ff" : color }}>
        {formattedValue}
        {isNumeric && <span className="card-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default MetricCard;
