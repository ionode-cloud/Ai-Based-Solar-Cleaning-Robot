const dummyData = {
  voltage: Math.random() * (15 - 10) + 10,  // random between 10 and 15
  current: Math.random() * (3 - 1) + 1,    // random between 1 and 3
  power: Math.random() * (40 - 20) + 20,
  energyToday: Math.random() * (200 - 100) + 100,
  avgPower: 25.0,
  avgVoltage: 12.0,
  efficiency: 0.85,
  temperature: Math.random() * (45 - 25) + 25,
  aqi: Math.floor(Math.random() * 100),
  climate: "Clean",
  moisture: Math.random() * 20,
  dustStatus: {
    status: Math.random() > 0.5 ? "Dusty" : "Clean",
    dustLevel: Math.floor(Math.random() * 5),
    forceCleaningStatus: false
  },
  messageLogs: ["System started", "Dummy data sent successfully"]
};

// Fix power based on voltage and current to make it realistic
dummyData.power = dummyData.voltage * dummyData.current;

console.log("Sending dummy data...");

fetch("https://solar-clening.ionode.cloud/api/solar-data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(dummyData)
})
  .then(res => res.json())
  .then(data => console.log("Success:", JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error connecting to server. Is it running?", err.message));
