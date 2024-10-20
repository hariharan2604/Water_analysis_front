import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState({
    home1: { waterLevel: 0, electricityUsage: 0, power: 0, pumpStatus: 'Unknown' },
    home2: { waterLevel: 0, electricityUsage: 0, power: 0, pumpStatus: 'Unknown' }
  });

  // Fetch data from the backend every second
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('http://localhost:3001/api/data')
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="App">
      <h1>Water and Power Monitoring</h1>

      <div className="home-container">
        <div className="home">
          <h2>Home 1</h2>
          <div className="water-level">
            <h3>Water Level: {data.home1.waterLevel}%</h3>
            <div className="water-tank">
              <div className="water" style={{ height: `${data.home1.waterLevel}%` }}></div>
            </div>
          </div>
          <p>Electricity Usage (Today): {data.home1.electricityUsage} W</p>
          <p>Instant Power: {data.home1.power} W</p>
          <p>Pump Status: {data.home1.pumpStatus}</p>
        </div>

        <div className="home">
          <h2>Home 2</h2>
          <div className="water-level">
            <h3>Water Level: {data.home2.waterLevel}%</h3>
            <div className="water-tank">
              <div className="water" style={{ height: `${data.home2.waterLevel}%` }}></div>
            </div>
          </div>
          <p>Electricity Usage (Today): {data.home2.electricityUsage} W</p>
          <p>Instant Power: {data.home2.power} W</p>
          <p>Pump Status: {data.home2.pumpStatus}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
