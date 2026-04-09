import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { OperationType, Report } from '../types';
import { Camera, MapPin, Loader2, Upload, Mic, MicOff } from 'lucide-react';

export default function ReportIssue() {
  const { userProfile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const getLocation = () => {
    setLoadingLoc(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoadingLoc(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLoc(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable GPS.');
        setLoadingLoc(false);
      }
    );
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% quality
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
      } catch (err) {
        setError('Failed to process image.');
      }
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === 'te' ? 'te-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!location) {
      setError('Please capture your location first.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newReport: Report = {
        userId: userProfile.uid,
        userName: userProfile.name,
        description: description.trim(),
        latitude: location.lat,
        longitude: location.lng,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      if (image) {
        newReport.imageUrl = image;
      }

      await addDoc(collection(db, 'reports'), newReport);
      navigate('/home');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('reportIssue')}</h1>
        <p className="text-gray-500">{t('helpUsFix')}</p>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('description')}
            </label>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? t('listening') : t('voiceInput')}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('describeIssue')}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-32"
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('location')}
          </label>
          <button
            type="button"
            onClick={getLocation}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-xl hover:bg-blue-100 transition-colors"
          >
            {loadingLoc ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
            {location ? t('locationCaptured') : t('getCurrentLocation')}
          </button>
          {location && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('photoOptional')}
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
              id="camera-input"
            />
            <label
              htmlFor="camera-input"
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {image ? (
                <img src={image} alt="Preview" className="h-32 object-contain rounded-lg" />
              ) : (
                <>
                  <Camera size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{t('tapToPhoto')}</span>
                </>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !location || !description.trim()}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          {submitting ? t('submitting') : t('submitReport')}
        </button>
      </form>
    </div>
  );
}
