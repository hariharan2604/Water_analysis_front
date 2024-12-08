import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';
import DateTime from './DateTime'; // Import DateTime component

function App() {
  const [data, setData] = useState({
    home1: { waterLevel: 0, electricityUsage: 0, power: 0, pumpStatus: 'Unknown' },
    home2: { waterLevel: 0, electricityUsage: 0, power: 0, pumpStatus: 'Unknown' }
  });

  const socketRef = useRef(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;

    const initializeWebSocket = () => {
      if (retryCount >= maxRetries) return console.log("Max retries reached for WebSocket");
      const socket = new WebSocket('ws://localhost:3002');
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
        retryCount = 0;
      };

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
        retryCount++;
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          initializeWebSocket();
        }, 3000);
      };
    };

    initializeWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

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

    fetchElectricityUsage();

    const interval = setInterval(fetchElectricityUsage, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <DateTime /> {/* Display the date and time */}
      <h1>Water and Power Monitoring</h1>

      <div className="home-container">
        {['home1', 'home2'].map(home => (
          <div className="home" key={home}>
            <h2>{home === 'home1' ? 'Home 1' : 'Home 2'}</h2>
            <div className="water-level">
              <h3>Water Level: {data[home].waterLevel}%</h3>
              <div className="water-tank">
                <div className="water" style={{ height: `${data[home].waterLevel}%` }}></div>
              </div>
            </div>
            <p>Electricity Usage (This Month): {data[home].electricityUsage} W</p>
            <p>Instant Power: {data[home].power} W</p>
            <p>
              <span
                className={`status-dot ${data[home].pumpStatus === 'Running' ? 'status-running' : 'status-stopped'
                  }`}
              ></span>
              Pump Status: {data[home].pumpStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
