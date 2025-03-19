'use client';
import './globals.css';
import React from 'react';
import dynamic from 'next/dynamic'

const DynamicLeads = dynamic(
  () => import('./components/Leads/Leads'),
  { ssr: false }
)

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
        <DynamicLeads /> 
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

