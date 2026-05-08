import { GoogleGenAI } from "@google/genai";
import { Dataset, AICleaningSuggestion, ChatMessage } from "../types";

// Initialize the SDK using the injected API key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function analyzeDatasetWithAI(dataset: Dataset): Promise<AICleaningSuggestion[]> {
  try {
    // We only send a sample to avoid token limits
    const sampleSize = Math.min(dataset.rows.length, 5);
    const sampleRows = dataset.rows.slice(0, sampleSize);
    
    const prompt = `
    You are an expert Data Analyst AI. I am providing you with the statistics and a small sample of a dataset.
    
    Dataset Name: ${dataset.name}
    Columns: ${dataset.headers.join(', ')}
    Row Count: ${dataset.stats.rowCount}
    Missing Values: ${dataset.stats.missingValues}
    Duplicate Rows: ${dataset.stats.duplicateRows}
    
    Sample Data (First ${sampleSize} rows):
    ${JSON.stringify(sampleRows, null, 2)}
    
    Analyze this dataset and suggest actionable data cleaning steps. 
    Focus on missing values, duplicate rows, or string formatting issues.
    
    Respond STRICTLY with a valid JSON array matching this exact schema:
    [
      {
        "id": "unique-string-id",
        "column": "column_name_or_global",
        "issue": "Short description of issue",
        "explanation": "Plain English explanation of why this matters",
        "confidenceScore": 95, // 0-100
        "suggestedAction": "drop_rows" | "fill_mean" | "fill_zero" | "trim_spaces" | "uppercase" | "remove_duplicates"
      }
    ]
    
    Only return the JSON array, no markdown wrappers, no extra text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for deterministic, structured output
      }
    });

    const text = response.text || "[]";
    // Strip markdown code block if present just in case
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const suggestions: AICleaningSuggestion[] = JSON.parse(cleanText);
    return suggestions;
  } catch (error) {
    console.error("Failed to analyze dataset with Gemini", error);
    // Fallback basic rules if API fails
    const fallbacks: AICleaningSuggestion[] = [];
    
    if (dataset.stats.duplicateRows > 0) {
      fallbacks.push({
        id: `fallback-dupes-${Date.now()}`,
        column: 'global',
        issue: 'Duplicate rows found',
        explanation: 'There are identical rows in your dataset. Removing them prevents skewed statistics.',
        confidenceScore: 90,
        suggestedAction: 'remove_duplicates'
      });
    }

    if (dataset.stats.missingValues > 0) {
      // Find columns with missing values and propose actions
      const missingByCol: Record<string, number> = {};
      dataset.headers.forEach(h => missingByCol[h] = 0);
      
      dataset.rows.forEach(row => {
        dataset.headers.forEach(h => {
          if (row[h] === null || row[h] === undefined || row[h] === '') {
            missingByCol[h]++;
          }
        });
      });

      Object.entries(missingByCol).forEach(([col, count], index) => {
        if (count > 0) {
          fallbacks.push({
             id: `fallback-missing-${index}-${Date.now()}`,
             column: col,
             issue: `${count} Missing values`,
             explanation: `There are ${count} records with empty values in this column. Dropping these rows can help keep data structure solid.`,
             confidenceScore: 80,
             suggestedAction: 'drop_rows'
          });
        }
      });
    }

    return fallbacks;
  }
}

export async function chatAboutDataset(dataset: Dataset, chatHistory: ChatMessage[], newUserMsg: string): Promise<string> {
  try {
     const systemPrompt = `
      You are CleanFlow AI, a helpful, expert data analyst assistant.
      The user is working on a dataset called "${dataset.name}".
      Here are the dataset stats:
      - Rows: ${dataset.stats.rowCount}
      - Columns: ${dataset.headers.length}
      - Missing Values: ${dataset.stats.missingValues}
      - Duplicates: ${dataset.stats.duplicateRows}
      - Quality Score: ${dataset.stats.qualityScore}/100
      
      Help the user understand their dataset, explain cleaning operations in beginner-friendly ways, and suggest analytical approaches. Keep responses concise and focused.
    `;

    const contents: any[] = [];

    // Gemini API requires chat to start with a 'user' role message
    if (chatHistory.length > 0 && chatHistory[0].role === 'assistant') {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    chatHistory.forEach(msg => {
       const role = msg.role === 'assistant' ? 'model' : 'user';
       // Ensure strictly alternating roles
       if (contents.length > 0 && contents[contents.length - 1].role === role) {
         contents[contents.length - 1].parts[0].text += '\n\n' + msg.content;
       } else {
         contents.push({
           role: role,
           parts: [{ text: msg.content }]
         });
       }
    });

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
       contents[contents.length - 1].parts[0].text += '\n\n' + newUserMsg;
    } else {
       contents.push({ role: 'user', parts: [{ text: newUserMsg }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I'm having trouble thinking right now.";
  } catch (e: any) {
    console.error("Chat error:", e);
    if (e?.message?.includes('429') || e?.message?.includes('quota') || e?.status === 429) {
      return "I'm sorry, but my AI capabilities are currently unavailable due to system rate limits (Quota Exceeded). Please try again later or use the manual cleaning mode in the meantime.";
    }
    return "Sorry, I encountered an error while processing your message. Let's try again.";
  }
}
