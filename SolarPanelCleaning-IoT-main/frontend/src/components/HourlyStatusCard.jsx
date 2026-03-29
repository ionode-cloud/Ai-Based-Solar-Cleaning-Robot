import React from "react";
import "../App.css"
const HourlyStatusCard = ({ title, value, unit, color, icon: Icon }) => (
  <div className="hourly-status-card" style={{ borderColor: '#374151' }}>
    <Icon style={{ color }} size={30} className="status-icon" />
    <div className="status-value" style={{ color }}>
      {value}<span className="status-unit">{unit}</span>
    </div>
    <div className="status-title">{title}</div>
  </div>
);

export default HourlyStatusCard;
