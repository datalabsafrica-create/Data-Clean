import React, { useState } from 'react';
import { Dataset } from '../types';
import { ArrowUpDown, Search } from 'lucide-react';

interface DataTableProps {
  dataset: Dataset;
}

export default function DataTable({ dataset }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Simple filtering
  const filteredRows = dataset.rows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(v => 
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-slate-400">Data Preview</span>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 w-16">Row</th>
              {dataset.headers.map((header) => (
                <th key={header} className="p-3 border-b border-r border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {header}
                    <ArrowUpDown size={12} className="cursor-pointer hover:text-indigo-500" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, i) => (
                <tr key={i} className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-3 border-r border-slate-100 dark:border-slate-700/50 text-slate-400 font-mono text-xs">
                    {(page - 1) * rowsPerPage + i + 1}
                  </td>
                  {dataset.headers.map((header) => (
                    <td key={header} className="p-3 border-r border-slate-100 dark:border-slate-700/50 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {row[header] === null || row[header] === undefined || row[header] === '' 
                        ? <span className="text-red-400 italic text-[10px] bg-red-50 dark:bg-red-900/20 px-1 rounded">null</span> 
                        : String(row[header])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={dataset.headers.length + 1} className="p-6 text-center text-slate-500">
                  No records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold text-slate-400">
        <div className="uppercase">
          SHOWING {filteredRows.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} - {Math.min(page * rowsPerPage, filteredRows.length)} OF {filteredRows.length} ROWS
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Prev
          </button>
          <span className="font-medium text-slate-500">
            {page} / {totalPages || 1}
          </span>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
