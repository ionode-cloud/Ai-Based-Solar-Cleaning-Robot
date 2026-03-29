export const generatePerformanceData = () => {
  return Array.from({ length: 25 }, (_, i) => {
    const hour = i.toString().padStart(2, '0') + ':00';
    const time = i;
    let power, efficiency;
    if (time >= 4 && time <= 20) {
      const noonOffset = Math.abs(12 - time);
      power = Math.max(0.1, 4.5 - noonOffset * noonOffset * 0.15);
      efficiency = Math.max(5, 98 - noonOffset * noonOffset * 3.0);
    } else {
      power = 0;
      efficiency = 0;
    }
    return {
      hour,
      'Power (kW)': parseFloat(power.toFixed(1)),
      'Efficiency (%)': parseFloat(efficiency.toFixed(0)),
    };
  });
};

export const initialMockData = {
  voltage: 48.0,
  current: 11.6,
  power: 1.4,
  energyToday: 28.0,
  dustLevel: 55,
  dustStatus: 'Moderate',
  lastCleaned: '2 hours ago',
  nextCleaning: '14:30 Today',
  avgPower: 4.1,
  AQIIndexwidget:35,
  Climate:'Rainy',
  Moisture: 12,
  avgVoltage: 47.8,
  efficiency: 92,
  temperature: 28,
  robotPosition: 'Panel 3 of 12',
  batteryLevel: 55,
  cleaningProgress: 30,
  performanceData: generatePerformanceData(),
  cleaningHistory: [ // solar cleaning
    { date: "2025-10-01", duration: "30 min", efficiency: 95, status: "Completed" },
    { date: "2025-10-02", duration: "28 min", efficiency: 92, status: "Completed" },
    { date: "2025-10-03", duration: "32 min", efficiency: 98, status: "Completed" },
  ],
};
