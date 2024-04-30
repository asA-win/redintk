import React, { useState } from 'react';
import Login from './login.jsx'; 
import Signup from './Signup.jsx'; 

function Header() {
  
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showImage, setShowImage] = useState(true); 

  
  const handleLoginClick = () => {
    setShowLogin(true); 
    setShowSignup(false); 
    setShowImage(false); 
  };

  //  click event of the signup button
  const handleSignupClick = () => {
    setShowSignup(true); 
    setShowLogin(false); 
    setShowImage(false); 
  };

  return (
    <div>
      <nav className="header">
        <div className="hl1">
          <h1>Task Manager</h1>
        </div>

        <div className="hl2">
          <button onClick={handleLoginClick}>Login</button>
          <button onClick={handleSignupClick}>Signup</button>
        </div>
      </nav>

      {showImage && (
        <div className="image-container">
          <img src="https://img.freepik.com/premium-photo/insights-into-field-cognitive-science_810293-96258.jpg?w=740" alt="Task Manager Image" className="header-image" />
          <div className="welcome-text">Welcome to Task Management Buddy</div> 
        </div>
      )}

      {showLogin && <Login />}
      {showSignup && <Signup />}
    </div>
  );
}

export default Header;
