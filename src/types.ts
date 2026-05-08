export type DatasetStats = {
  rowCount: number;
  colCount: number;
  missingValues: number;
  duplicateRows: number;
  dataTypes: Record<string, string>; // e.g., { age: 'number', name: 'string' }
  qualityScore: number;
};

export type AICleaningSuggestion = {
  id: string;
  column: string;
  issue: string;
  explanation: string;
  confidenceScore: number;
  suggestedAction: "drop_rows" | "fill_mean" | "fill_zero" | "trim_spaces" | "uppercase" | "remove_duplicates" | "replace_text" | "format_date" | "detect_outliers" | "standardize_case";
  actionPayload?: any;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export interface Dataset {
  id: string;
  name: string;
  headers: string[];
  rows: any[];
  stats: DatasetStats;
  history: string[]; // logs of actions taken
}
