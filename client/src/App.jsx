import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PredictionForm from './pages/PredictionForm';
import FileUpload from './pages/FileUpload';
import ResultPage from './pages/ResultPage';
import Dashboard from './pages/Dashboard';
import ModelPerformance from './pages/ModelPerformance';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Architecture from './pages/Architecture';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar user={user} setUser={setUser} />
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />

            <Route path="/predict" element={<PredictionForm user={user} />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/upload" element={<FileUpload />} />

            <Route path="/history" element={user ? <History user={user} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/performance" element={<ModelPerformance />} />
            <Route path="/architecture" element={<Architecture />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
