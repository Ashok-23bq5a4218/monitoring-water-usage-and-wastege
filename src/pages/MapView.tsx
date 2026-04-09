import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { Report, OperationType } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pendingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const inProgressIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const resolvedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Try to get user's location to center map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    const q = query(collection(db, 'reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reps: Report[] = [];
      snapshot.forEach((doc) => {
        reps.push({ id: doc.id, ...doc.data() } as Report);
      });
      setReports(reps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading map...</div>;
  }

  const getIcon = (status: string) => {
    if (status === 'pending') return pendingIcon;
    if (status === 'in-progress') return inProgressIcon;
    return resolvedIcon;
  };

  const getStatusColor = (status: string) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-6 pb-4 bg-white z-10 shadow-sm relative">
        <h1 className="text-2xl font-bold text-gray-900">{t('issueMap')}</h1>
        <p className="text-gray-500 text-sm">{t('viewLeakages')}</p>
      </header>
      
      <div className="flex-1 relative z-0">
        <MapContainer center={center} zoom={5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.latitude, report.longitude]}
              icon={getIcon(report.status)}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <p className="font-semibold text-sm mb-1">{report.description}</p>
                  <p className="text-xs text-gray-500 mb-2">{t('reportedBy')} {report.userName}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(report.status)}`}>
                    {t(report.status === 'in-progress' ? 'inProgress' : report.status).toUpperCase()}
                  </span>
                  {report.imageUrl && (
                    <img src={report.imageUrl} alt="Issue" className="mt-2 rounded-md w-full h-24 object-cover" />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
