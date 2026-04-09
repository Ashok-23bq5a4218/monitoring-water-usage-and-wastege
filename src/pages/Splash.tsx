import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/home');
        } else {
          navigate('/login');
        }
      }, 3000); // 3 seconds delay
      return () => clearTimeout(timer);
    }
  }, [loading, user, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-teal-500 text-white overflow-hidden p-6 text-center">
      {/* Background Ripple Effects */}
      <motion.div
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: [0, 2, 4], opacity: [0.5, 0.2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-40 h-40 bg-white rounded-full"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: [0, 2, 4], opacity: [0.5, 0.2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.25 }}
        className="absolute w-40 h-40 bg-white rounded-full"
      />

      {/* App Logo / Icon */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="relative z-10 bg-white p-6 rounded-full shadow-2xl mb-8 text-blue-500"
      >
        <Droplets size={64} className="animate-bounce" />
      </motion.div>

      {/* Project Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 text-3xl md:text-4xl font-bold tracking-tight mb-4 drop-shadow-md leading-tight"
      >
        Water Usage Monitoring &<br />Wastage Reduction System
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 text-teal-100 text-xl font-medium tracking-wide drop-shadow-sm italic"
      >
        "Save Water, Save Life"
      </motion.p>

      {/* Loading Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute bottom-16 flex flex-col items-center"
      >
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-white/80 tracking-widest uppercase">Loading...</p>
      </motion.div>
    </div>
  );
}
