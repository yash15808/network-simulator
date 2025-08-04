import React, { useState, useEffect } from 'react';
import './App.css';

// Hardcode node positions for a simple visual layout
const nodePositions = {
  A: { top: '50%', left: '10%' },
  B: { top: '20%', left: '35%' },
  C: { top: '80%', left: '35%' },
  D: { top: '50%', left: '60%' },
  E: { top: '50%', left: '85%' },
};

function App() {
  const [networkStatus, setNetworkStatus] = useState({ nodes: {}, links: {} });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        setNetworkStatus(data);
      } catch (error) {
        console.error("Failed to fetch network status:", error);
      }
    };

    const intervalId = setInterval(fetchData, 1000); // Fetch data every second

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <div className="App">
      <h1>Network Traffic Simulator</h1>
      <div className="network-map">
        {/* Render Links */}
        {Object.entries(networkStatus.links).map(([linkId, linkData]) => {
          const fromNode = nodePositions[linkData.from];
          const toNode = nodePositions[linkData.to];
          const isCongested = linkData.currentLoad >= linkData.capacity;

          return (
            <svg key={linkId} className="link-line">
              <line
                x1={fromNode.left}
                y1={fromNode.top}
                x2={toNode.left}
                y2={toNode.top}
                className={isCongested ? 'congested' : ''}
              />
            </svg>
          );
        })}

        {/* Render Nodes */}
        {Object.entries(networkStatus.nodes).map(([nodeId, nodeData]) => (
          <div
            key={nodeId}
            className="node"
            style={nodePositions[nodeId]}
          >
            <div className="node-id">{nodeId}</div>
            <div className="node-info">
              Queue: {nodeData.queue}
            </div>
          </div>
        ))}
      </div>
      <div className="stats-table">
        <h2>Link Status</h2>
        <table>
          <thead>
            <tr>
              <th>Link</th>
              <th>Load / Capacity (Packets/sec)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(networkStatus.links).map(([linkId, linkData]) => (
              <tr key={linkId}>
                <td>{linkId}</td>
                <td className={linkData.currentLoad >= linkData.capacity ? 'congested-text' : ''}>
                  {linkData.currentLoad} / {linkData.capacity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;