'use client';

import React from 'react';
import Leads from './components/Leads/Leads';

function App() {

  const accessToken = localStorage.getItem("access-token");
  const handleSignOut = () => {
    localStorage.removeItem("access-token"); 
    window.location.reload(); 
  };


  return (
    <div className="App">
      {accessToken ? (
        <>
        <button onClick={handleSignOut}>Sign Out</button>
        <Leads />
        </>
      ) : (
        <>
          <a href="/register">Register</a> | <a href="/login">Login</a>
        </>
      )}
    </div>
  );
}

export default App;

