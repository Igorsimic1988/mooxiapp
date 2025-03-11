'use client';
import './globals.css';
import React from 'react';
import dynamic from 'next/dynamic'

const DynamicLeads = dynamic(
  () => import('./components/Leads/Leads'),
  { ssr: false }
)

function App() {
  return (
    <div className="App">
       <DynamicLeads /> 
    </div>
  );
}

export default App;
