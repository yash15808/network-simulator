const express = require('express');
const cors = require('cors');
const simulation = require('./simulation');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API endpoint to get network status
app.get('/api/status', (req, res) => {
    const status = simulation.getStatus();
    res.json(status);
});

// Start the simulation loop
setInterval(() => {
    simulation.runSimulationStep();
    // console.log("Simulation step completed."); // Optional: uncomment for debugging
}, 1000); // Run every 1 second

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Network simulation started.");
});