import Papa from 'papaparse';
import { Dataset, DatasetStats } from '../types';

export const parseCSV = (file: File): Promise<Dataset> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const rows = results.data as any[];
        const headers = results.meta.fields || [];
        
        const stats = calculateStats(rows, headers);
        
        resolve({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          headers,
          rows,
          stats,
          history: ['Dataset uploaded successfully.']
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const calculateStats = (rows: any[], headers: string[]): DatasetStats => {
  let missingValues = 0;
  const dataTypes: Record<string, string> = {};
  
  // Hash rows to find duplicates
  const rowHashes = new Set<string>();
  let duplicateRows = 0;

  if (rows.length > 0) {
    // Detect types from first valid row
    const firstRow = rows[0];
    headers.forEach(h => {
      dataTypes[h] = typeof firstRow[h];
    });

    // Count missing & duplicates
    rows.forEach(row => {
      const hash = JSON.stringify(row);
      if (rowHashes.has(hash)) {
        duplicateRows++;
      } else {
        rowHashes.add(hash);
      }

      headers.forEach(h => {
        const val = row[h];
        if (val === null || val === undefined || val === '') {
          missingValues++;
        }
      });
    });
  }

  const totalCells = rows.length * headers.length;
  // Quality score formula: 100 - (percentage of missing cells * 100) - (percentage of duplicate rows * 100)
  const missingPenalty = totalCells > 0 ? (missingValues / totalCells) * 100 : 0;
  const duplicatePenalty = rows.length > 0 ? (duplicateRows / rows.length) * 100 : 0;
  let qualityScore = Math.max(0, Math.round(100 - missingPenalty - duplicatePenalty));

  return {
    rowCount: rows.length,
    colCount: headers.length,
    missingValues,
    duplicateRows,
    dataTypes,
    qualityScore
  };
};

// Actions
export const applyAction = (dataset: Dataset, action: any, column?: string, options?: any): Dataset => {
  let newRows = [...dataset.rows];
  let log = '';

  switch (action) {
    case 'remove_duplicates':
      const seen = new Set();
      newRows = newRows.filter(r => {
        const hash = JSON.stringify(r);
        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
      });
      log = `Removed ${dataset.rows.length - newRows.length} duplicate rows.`;
      break;

    case 'fill_mean':
      if (!column) break;
      const validVals = newRows.map(r => r[column]).filter(v => typeof v === 'number' && !isNaN(v));
      const mean = validVals.length > 0 ? validVals.reduce((a, b) => a + b, 0) / validVals.length : 0;
      let filledMean = 0;
      newRows = newRows.map(r => {
        if (r[column] === null || r[column] === undefined || r[column] === '') {
          filledMean++;
          return { ...r, [column]: Number(mean.toFixed(2)) };
        }
        return r;
      });
      log = `Filled missing values in '${column}' with mean (${mean.toFixed(2)}). Affected ${filledMean} cells.`;
      break;

    case 'fill_zero':
      if (!column) break;
      let filledZero = 0;
      newRows = newRows.map(r => {
        if (r[column] === null || r[column] === undefined || r[column] === '') {
          filledZero++;
          return { ...r, [column]: 0 };
        }
        return r;
      });
      log = `Filled missing values in '${column}' with 0. Affected ${filledZero} cells.`;
      break;
      
    case 'trim_spaces':
      if (!column) break;
      let trimmed = 0;
      newRows = newRows.map(r => {
        if (typeof r[column] === 'string') {
          const original = r[column];
          const newStr = original.trim();
          if (newStr !== original) trimmed++;
          return { ...r, [column]: newStr };
        }
        return r;
      });
      log = `Trimmed leading/trailing spaces in '${column}'. Affected ${trimmed} cells.`;
      break;

    case 'uppercase':
      if (!column) break;
      newRows = newRows.map(r => {
        if (typeof r[column] === 'string') {
          return { ...r, [column]: r[column].toUpperCase() };
        }
        return r;
      });
      log = `Converted '${column}' to uppercase.`;
      break;
      
    case 'drop_rows':
      if (!column) break;
      const originalLen = newRows.length;
      newRows = newRows.filter(r => {
        const v = r[column];
        return v !== null && v !== undefined && v !== '';
      });
      log = `Dropped ${originalLen - newRows.length} rows with missing values in '${column}'.`;
      break;

    case 'replace_text':
      if (!column || !options?.find) break;
      let replaced = 0;
      newRows = newRows.map(r => {
        if (typeof r[column] === 'string' && r[column].includes(options.find)) {
          replaced++;
          return { ...r, [column]: r[column].replaceAll(options.find, options.replace || '') };
        }
        return r;
      });
      log = `Replaced '${options.find}' with '${options.replace || ''}' in '${column}'. Affected ${replaced} cells.`;
      break;

    case 'format_date':
      if (!column) break;
      let formattedDates = 0;
      newRows = newRows.map(r => {
        if (r[column]) {
          const d = new Date(r[column]);
          // Check if valid date
          if (!isNaN(d.getTime()) && typeof r[column] !== 'number') {
            formattedDates++;
            return { ...r, [column]: d.toISOString().split('T')[0] }; // YYYY-MM-DD
          }
        }
        return r;
      });
      log = `Formatted dates in '${column}'. Affected ${formattedDates} cells.`;
      break;

    case 'detect_outliers':
      if (!column) break;
      const numericVals = newRows.map(r => r[column]).filter(v => typeof v === 'number' && !isNaN(v)).sort((a,b) => a-b);
      if (numericVals.length < 4) {
        log = `Not enough numeric data to detect outliers in '${column}'.`;
        break;
      }
      const q1 = numericVals[Math.floor(numericVals.length * 0.25)];
      const q3 = numericVals[Math.floor(numericVals.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const initialLength = newRows.length;
      newRows = newRows.filter(r => {
        const v = r[column];
        if (typeof v !== 'number' || isNaN(v)) return true;
        return v >= lowerBound && v <= upperBound;
      });
      log = `Removed ${initialLength - newRows.length} outliers in '${column}' using IQR method.`;
      break;

    case 'standardize_case':
      if (!column) break;
      const caseType = options?.case || 'title';
      newRows = newRows.map(r => {
        if (typeof r[column] === 'string') {
          let newStr = r[column];
          if (caseType === 'lower') newStr = newStr.toLowerCase();
          else if (caseType === 'upper') newStr = newStr.toUpperCase();
          else if (caseType === 'title') {
            newStr = newStr.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
          }
          return { ...r, [column]: newStr };
        }
        return r;
      });
      log = `Standardized case to ${caseType} in '${column}'.`;
      break;
  }

  const newStats = calculateStats(newRows, dataset.headers);

  return {
    ...dataset,
    rows: newRows,
    stats: newStats,
    history: [...dataset.history, log]
  };
};
