/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Pages (to be created)
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Features from './pages/Features';
import Promo from './pages/Promo';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF9F9]">
        <div className="animate-pulse text-[#D48C8C] font-medium">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/funcionalidades" element={<Features />} />
        <Route path="/divulgacao" element={<Promo />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard/*" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/b/:slug" element={<Booking />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}

