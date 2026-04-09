import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { Report, OperationType } from '../types';
import { format } from 'date-fns';
import { Droplets, CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(20));
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

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const inProgressCount = reports.filter(r => r.status === 'in-progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const chartData = [
    { name: t('pending'), value: pendingCount, color: '#f59e0b' },
    { name: t('inProgress'), value: inProgressCount, color: '#3b82f6' },
    { name: t('resolved'), value: resolvedCount, color: '#10b981' }
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-500">{t('overview')}</p>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <Clock className="text-amber-500 mb-1" size={24} />
          <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
          <span className="text-xs font-medium text-amber-600">{t('pending')}</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <Activity className="text-blue-500 mb-1" size={24} />
          <span className="text-2xl font-bold text-blue-700">{inProgressCount}</span>
          <span className="text-xs font-medium text-blue-600">{t('inProgress')}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="text-emerald-500 mb-1" size={24} />
          <span className="text-2xl font-bold text-emerald-700">{resolvedCount}</span>
          <span className="text-xs font-medium text-emerald-600">{t('resolved')}</span>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 h-64">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('statusOverview')}</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('recentReports')}</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-2xl">
            <Droplets className="mx-auto text-gray-400 mb-2" size={32} />
            <p>{t('noReports')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.slice(0, 5).map(report => (
              <div key={report.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {report.status === 'pending' && <AlertTriangle className="text-amber-500" size={24} />}
                  {report.status === 'in-progress' && <Activity className="text-blue-500" size={24} />}
                  {report.status === 'resolved' && <CheckCircle2 className="text-emerald-500" size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">{report.description}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(report.createdAt), 'MMM d, yyyy • h:mm a')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('reportedBy')} {report.userName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
