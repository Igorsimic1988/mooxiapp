'use client';
import './globals.css';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation';
import { useAccessToken } from './lib/useAccessToken';



const DynamicLeads = dynamic(
  () => import('./components/Leads/Leads'),
  { ssr: false }
)

function App() {
  const router = useRouter();
  const token = useAccessToken();
  useEffect(() => {
    if (token) {
      router.push('/leads');
    }
  }, [token, router]);

  const handleSignOut = () => {
    localStorage.removeItem("access-token"); 
    window.location.reload(); 
  };


  return (
    <div className="App">
      {token ? (
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
