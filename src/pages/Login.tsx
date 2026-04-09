import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Droplets, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 relative">
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Globe size={16} />
          {language === 'en' ? 'తెలుగు' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <div className="bg-blue-100 p-4 rounded-full mb-6 text-blue-600">
          <Droplets size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('welcome')}</h2>
        <p className="text-gray-500 text-center mb-8">
          {t('loginSubtitle')}
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          {loading ? t('signingIn') : t('signInGoogle')}
        </button>
      </div>
    </div>
  );
}
