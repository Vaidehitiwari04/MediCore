import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar    from './components/Sidebar';
import Dashboard  from './Pages/Dashboard';
import Patients   from './Pages/Patients';
import Doctors from './Pages/Doctors';
import AddPatient from './Pages/AddPatient';
import AddDoctor  from './Pages/AddDoctor';
import './Pages/page.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <Routes>
            <Route path="/"            element={<Dashboard  />} />
            <Route path="/patients"    element={<Patients   />} />
            <Route path="/doctors"     element={<Doctors    />} />
            <Route path="/add-patient" element={<AddPatient />} />
            <Route path="/add-doctor"  element={<AddDoctor  />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}