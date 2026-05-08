import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DataUpload from './components/DataUpload';
import { Dataset } from './types';
import { calculateStats } from './lib/dataUtils';

export default function App() {
  const [view, setView] = useState<'landing' | 'upload' | 'dashboard'>('landing');
  const [dataset, setDataset] = useState<Dataset | null>(null);

  const handleUploadSuccess = (newDataset: Dataset) => {
    setDataset(newDataset);
    setView('dashboard');
  };

  const handleGoToUpload = () => {
    setView('upload');
  };

  const handleUploadNew = () => {
    setDataset(null);
    setView('upload');
  };

  const handleViewDemo = () => {
    const headers = ['id', 'customer_name', 'purchase_date', 'region', 'amount_usd'];
    const rows = [
      { id: '#8812', customer_name: 'Acme Logistics', purchase_date: '2023-11-12', region: 'North America', amount_usd: 42100.00 },
      { id: '#8813', customer_name: 'Globex Corp.', purchase_date: '2023-11-14', region: 'Europe', amount_usd: 12450.00 },
      { id: '#8814', customer_name: 'Soylent Corp', purchase_date: '2023-11-15', region: 'APAC', amount_usd: 8900.00 },
      { id: '#8815', customer_name: 'Initech', purchase_date: '11/15/23', region: 'North America', amount_usd: 112000.00 },
      { id: '#8816', customer_name: 'Wayne Ent.', purchase_date: null, region: 'North America', amount_usd: null },
      { id: '#8817', customer_name: 'Stark Ind.', purchase_date: '2023-11-16', region: null, amount_usd: 65400.00 },
      { id: '#8817', customer_name: 'Stark Ind.', purchase_date: '2023-11-16', region: null, amount_usd: 65400.00 },
      { id: '#8818', customer_name: ' Cyberdyne ', purchase_date: '2023-11-17', region: 'Europe', amount_usd: 23100.00 },
      { id: '#8819', customer_name: 'Massive Dynamic', purchase_date: '2023-11-18', region: 'APAC', amount_usd: 7600.00 },
      { id: '#8820', customer_name: 'Umbrella Corp', purchase_date: '2023-11-19', region: 'North America', amount_usd: 54000.00 },
    ];
    const stats = calculateStats(rows, headers);
    
    setDataset({
      id: 'demo-dataset-1',
      name: 'enterprise_sales_q4_v2.csv',
      headers,
      rows,
      stats,
      history: ['Loaded example demo dataset.']
    });
    setView('dashboard');
  };

  return (
    <>
      {view === 'landing' && <LandingPage onGetStarted={handleGoToUpload} onViewDemo={handleViewDemo} />}
      
      {view === 'upload' && (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-900 flex flex-col items-center justify-center p-6 transition-colors duration-300">
          {/* Simple header for upload view */}
          <div className="w-full max-w-4xl flex justify-between items-center mb-8">
            <button 
              onClick={() => setView('landing')} 
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow"
            >
              ← Back to Home
            </button>
          </div>
          <DataUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {view === 'dashboard' && dataset && (
        <Dashboard 
          dataset={dataset} 
          onUpdateDataset={setDataset} 
          onUploadNew={handleUploadNew}
          onGoHome={() => setView('landing')}
        />
      )}
    </>
  );
}
