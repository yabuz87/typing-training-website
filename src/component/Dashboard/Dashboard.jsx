import React, { useState } from 'react';
import langs from '../../assets/Lang';
import time from "../../assets/time";
const Dashboard = () => {
  const [wpm, setWpm] = useState(0);
  const [acc, setAcc] = useState(0);
  return (
    <div className="container-lg">
      <h1 className="text-center">Here is your status</h1>
      <div className="row">
      <div className="col">
        <div>
        </div>
      </div>
      <div className="col">
      <h3 className="">WordsPerMinute: {wpm}</h3>
      <h3>Accuracy: {acc}%</h3>
      </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
