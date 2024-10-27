import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState({
    home1: { waterLevel: 0, electricityUsage: 0, power: 0, pumpStatus: 'Unknown' },
    home2: { waterLevel: 0, electricityUsage: 0, power: 0, pumpStatus: 'Unknown' }
  });

  const [socket, setSocket] = useState(null);

  // Function to initialize WebSocket
  const initializeWebSocket = () => {
    const socket = new WebSocket('ws://localhost:3002');

    socket.onopen = () => console.log('WebSocket connection established');

    socket.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData(prevData => ({
          ...prevData,
          [`home${newData.HomeID}`]: {
            ...prevData[`home${newData.HomeID}`],
            waterLevel: newData.CurrentWaterLevel,
            power: newData.Power,
            pumpStatus: newData.PumpRunningStatus ? 'Running' : 'Stopped'
          }
        }));
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error occurred:', error);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        initializeWebSocket();
      }, 3000); // 3 seconds delay before reconnecting
    };

    setSocket(socket);
  };

  // Initialize WebSocket connection on mount
  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Fetch electricity usage from MongoDB via HTTP request
  useEffect(() => {
    const fetchElectricityUsage = () => {
      axios.get('http://localhost:3001/api/electricityUsage')
        .then((response) => {
          const { home1Usage, home2Usage } = response.data;
          setData(prevData => ({
            ...prevData,
            home1: {
              ...prevData.home1,
              electricityUsage: home1Usage
            },
            home2: {
              ...prevData.home2,
              electricityUsage: home2Usage
            }
          }));
        })
        .catch((error) => {
          console.error('Error fetching electricity usage:', error);
        });
    };

    fetchElectricityUsage(); // Initial fetch on mount

    const interval = setInterval(fetchElectricityUsage, 60000); // Update every minute

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
