
// src/components/StatCard.js
import React from 'react';

function StatCard({ icon, title, value, description }) {
  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-figure text-secondary">
          {icon}
        </div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-desc">{description}</div>
      </div>
    </div>
  );
}

export default StatCard;
