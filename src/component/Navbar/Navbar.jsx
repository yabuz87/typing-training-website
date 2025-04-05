import React,{useState} from 'react'
import "./Navbar.css";
const Navbar = () => {    
  return (
     
    <div>
      <div className="nav-bar">
        <div><i className="bi bi-keyboard text-color-light fs-3 mb-3"></i>ElType<i className="bi bi-keyboard text-color-light fs-3 mb-3"></i></div>
        <div><button className="m-2 btn-secondary">Sign up</button>
        <button className="m-3 btn-secondary">Sign in</button></div>
      </div>
    </div>
  )
}

export default Navbar
