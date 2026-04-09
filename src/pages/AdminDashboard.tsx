import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { Report, OperationType } from '../types';
import { format } from 'date-fns';
import { CheckCircle2, AlertTriangle, Filter, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const { t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
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

  const handleStatusChange = async (reportId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('adminDashboard')}</h1>
        <p className="text-gray-500">{t('manageIssues')}</p>
      </header>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Filter size={20} className="text-gray-400 mr-2 flex-shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('allReports')}
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('pending')}
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('inProgress')}
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('resolved')}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl">
          {t('noReports')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {report.status === 'pending' && (
                    <span className="flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                      <AlertTriangle size={14} /> {t('pending')}
                    </span>
                  )}
                  {report.status === 'in-progress' && (
                    <span className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                      <Activity size={14} /> {t('inProgress')}
                    </span>
                  )}
                  {report.status === 'resolved' && (
                    <span className="flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                      <CheckCircle2 size={14} /> {t('resolved')}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {format(new Date(report.createdAt), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {report.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(report.id!, 'pending')}
                      className="text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      {t('markPending')}
                    </button>
                  )}
                  {report.status !== 'in-progress' && (
                    <button
                      onClick={() => handleStatusChange(report.id!, 'in-progress')}
                      className="text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {t('markInProgress')}
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(report.id!, 'resolved')}
                      className="text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      {t('markResolved')}
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">{report.description}</h3>
              
              <div className="text-sm text-gray-500 mb-4">
                <p>{t('reportedBy')} <span className="font-medium text-gray-700">{report.userName}</span></p>
                <p>{t('location')}: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
              </div>

              {report.imageUrl && (
                <img 
                  src={report.imageUrl} 
                  alt="Issue" 
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
