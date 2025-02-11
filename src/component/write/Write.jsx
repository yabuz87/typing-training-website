import React, { useState, useEffect } from 'react';
import { English, amharic } from '../../assets/texts';
import langs from '../../assets/Lang';
import './Write.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import time from '../../assets/time';

const Write = () => {
  const [rNumber, setRNumber] = useState(0);
  const [language, setLanguage] = useState('English');
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);

  const takeNumber = () => {
    const textsArray = language === 'English' ? English : amharic;
    setRNumber(Math.floor(Math.random() * textsArray.length));
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setRNumber(0);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(parseInt(e.target.value, 10));
  };

  useEffect(() => {
    const handleKeyDown = () => {
      if (!isTyping) {
        if (selectedTime === null) {
          alert('Please select a time to start the typing session.');
          return;
        }
        setIsTyping(true);
        setStartTime(Date.now());
        setElapsedTime(selectedTime);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTyping, selectedTime]);

  useEffect(() => {
    let timer;
    if (isTyping && selectedTime !== null) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setIsTyping(false);
            alert('Time is up!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isTyping, selectedTime]);

  const textsArray = language === 'English' ? English : amharic;

  return (
    <div>
      <div className="option-selection container-lg">
        <div className="button-container">
          <div>
            <i className="bi bi-keyboard keyboard-button" onClick={takeNumber}></i>
          </div>
          <button className={`${isTyping ? 'isVisible' : 'isNotVisible'} pause-button`}>Pause</button>
        </div>
        <div>
          <select className={`${isTyping ? 'isNotVisible' : 'isVisible'} bg-secondary`} value={language} onChange={handleLanguageChange}>
            <option value="" disabled>Select Language</option>
            {langs.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <select className={`${isTyping ? 'isNotVisible' : 'isVisible'} bg-secondary m-2`} value={selectedTime || ''} onChange={handleTimeChange}>
            <option value="" disabled>Select Time</option>
            {time.map((item, index) => (
              <option key={index} value={item}>{item} seconds</option>
            ))}
          </select>
        </div>
        <div>
          <h4 className={`${isTyping ? 'visible' : 'invisible'} ${elapsedTime < 5 ? 'text-danger' : ''}`}>{elapsedTime} seconds</h4>
        </div>
      </div>
      <h3 className="container-lg">{textsArray[rNumber]}</h3>
      
    </div>
  );
};

export default Write;
