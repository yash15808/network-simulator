// --- Network Data ---
const nodes = ['A', 'B', 'C', 'D', 'E'];
const links = [
    { from: 'A', to: 'B', capacity: 100 },
    { from: 'A', to: 'C', capacity: 80 },
    { from: 'B', to: 'D', capacity: 70 },
    { from: 'C', to: 'D', capacity: 90 },
    { from: 'C', to: 'E', capacity: 100 },
    { from: 'D', to: 'E', capacity: 60 }
];
const trafficRates = { 'A': 50, 'B': 30, 'C': 40, 'D': 20, 'E': 60 };

// --- Simulation State ---
let simulationState = { nodes: {}, links: {} };

// --- Adjacency List for Routing ---
const adjacencyList = {};
nodes.forEach(node => adjacencyList[node] = []);
links.forEach(link => {
    adjacencyList[link.from].push(link.to);
    adjacencyList[link.to].push(link.from); // Assuming bidirectional links for routing paths
});

// --- Shortest Path Algorithm (BFS) ---
function findShortestPath(start, end) {
    const queue = [[start]];
    const visited = new Set([start]);
    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        if (node === end) {
            return path;
        }
        for (const neighbor of adjacencyList[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                const newPath = [...path, neighbor];
                queue.push(newPath);
            }
        }
    }
    return null; // No path found
}

// --- Simulation Core Logic ---
function initializeState() {
    simulationState.nodes = {};
    simulationState.links = {};
    nodes.forEach(nodeId => {
        simulationState.nodes[nodeId] = {
            id: nodeId,
            trafficGenerationRate: trafficRates[nodeId] || 0,
            queue: []
        };
    });
    links.forEach(link => {
        const linkId = `${link.from}-${link.to}`;
        const reverseLinkId = `${link.to}-${link.from}`;
        simulationState.links[linkId] = { from: link.from, to: link.to, capacity: link.capacity, currentLoad: 0 };
        simulationState.links[reverseLinkId] = { from: link.to, to: link.from, capacity: link.capacity, currentLoad: 0 };
    });
}

function runSimulationStep() {
    // 1. Reset link loads
    Object.values(simulationState.links).forEach(link => link.currentLoad = 0);

    // 2. Process packets in queues
    nodes.forEach(nodeId => {
        const node = simulationState.nodes[nodeId];
        const newQueue = [];
        // Process only up to the node's capacity to prevent infinite loops in congested networks
        const packetsToProcess = [...node.queue]; 
        node.queue = []; 

        for (const packet of packetsToProcess) {
            if (packet.destination === nodeId) continue;

            const path = findShortestPath(nodeId, packet.destination);
            if (!path || path.length < 2) {
                newQueue.push(packet); // Keep packet if no path found
                continue;
            }

            const nextHop = path[1];
            const linkId = `${nodeId}-${nextHop}`;
            const link = simulationState.links[linkId];

            if (link.currentLoad < link.capacity) {
                link.currentLoad++;
                simulationState.nodes[nextHop].queue.push(packet);
            } else {
                newQueue.push(packet);
            }
        }
        // Add unprocessed or failed packets back to the main queue
        simulationState.nodes[nodeId].queue.unshift(...newQueue);
    });

    // 3. Generate new packets
    nodes.forEach(nodeId => {
        const node = simulationState.nodes[nodeId];
        const packetsToGenerate = node.trafficGenerationRate;
        for (let i = 0; i < packetsToGenerate; i++) {
            let destination;
            do {
                destination = nodes[Math.floor(Math.random() * nodes.length)];
            } while (destination === nodeId);
            
            node.queue.push({
                source: nodeId,
                destination: destination,
                id: `pkt-${nodeId}-${Date.now()}-${i}`
            });
        }
    });
}

function getStatus() {
    const displayLinks = {};
    links.forEach(link => {
        const linkId = `${link.from}-${link.to}`;
        const reverseLinkId = `${link.to}-${link.from}`;
        const load1 = simulationState.links[linkId]?.currentLoad || 0;
        const load2 = simulationState.links[reverseLinkId]?.currentLoad || 0;
        displayLinks[linkId] = {
            from: link.from,
            to: link.to,
            capacity: link.capacity,
            currentLoad: load1 + load2
        };
    });

    const displayNodes = {};
    nodes.forEach(nodeId => {
        displayNodes[nodeId] = {
            id: nodeId,
            // queue length instead of full queue object for cleaner output
            queue: simulationState.nodes[nodeId].queue.length 
        };
    });

    return { nodes: displayNodes, links: displayLinks };
}

initializeState();

module.exports = { getStatus, runSimulationStep };