import React from 'react';
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './component/Navbar/Navbar';
import Write from './component/write/Write';

const App = () => {
  return (
    <Router>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Write/>} />
      </Routes>
    </Router>
  );
}

export default App;