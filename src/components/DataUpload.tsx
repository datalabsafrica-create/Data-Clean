import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, AlertCircle, Loader2, PlayCircle, Lock } from 'lucide-react';
import { parseCSV } from '../lib/dataUtils';
import { Dataset } from '../types';

interface DataUploadProps {
  onUploadSuccess: (dataset: Dataset) => void;
}

export default function DataUpload({ onUploadSuccess }: DataUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasWatchedAd, setHasWatchedAd] = useState(false);

  // ---> EXACT LINE TO INSERT SMART LINK <---
  const SMART_LINK = "#"; // Replace "#" with your smart link URL

  const onDrop = useCallback(async (acceptedFiles: File[]) => {

    setError(null);
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Currently only CSV files are supported in this demo.');
      return;
    }

    setIsProcessing(true);
    try {
      const dataset = await parseCSV(file);
      onUploadSuccess(dataset);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
      <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upload Dataset</h2>
         <p className="text-slate-500 dark:text-slate-400">Drag and drop your CSV file to get started.</p>
      </div>

      {!hasWatchedAd ? (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-16 text-center transition-all bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <Lock className="text-indigo-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Upload is Locked</h3>
          <p className="text-slate-500 mb-6 max-w-md">To keep this service free, please watch a short advertisement before uploading your dataset.</p>
          
          <a
            href={SMART_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setHasWatchedAd(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-sm"
          >
            <PlayCircle size={20} /> Watch Ad to Unlock
          </a>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 
            ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="animate-spin text-indigo-500" size={48} />
               <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Processing schema & rows...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                 <UploadCloud className="text-indigo-500" size={40} />
              </div>
              {isDragActive ? (
                <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Drop the file here ...</p>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Drag & drop file here, or click to select
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Supports CSV up to 100MB
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
                  <FileType size={16} /> CSV
                </div>
                 {/* Placeholders for visual sake */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md opacity-50">
                  JSON (Soon)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-900/50">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
