'use client';
import './globals.css';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'

const DynamicLeads = dynamic(
  () => import('./components/Leads/Leads'),
  { ssr: false }
)

function App() {

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access-token");
    setAccessToken(token);
  }, []);

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

