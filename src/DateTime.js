// DateTime.js
import React, { useEffect, useState } from 'react';

function DateTime() {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDateTime(new Date());
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

    return (
        <div className="date-time">
            {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
        </div>
    );
}

export default DateTime;
