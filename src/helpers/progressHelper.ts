export function calculateFormProgress(data: any): { progress: number, missing: string[] } {
  if (!data) return { progress: 0, missing: [] };
  
  let totalFields = 0;
  let filledFields = 0;
  let missing: string[] = [];

  function formatKey(key: string) {
    return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }

  function traverse(obj: any, parentKey = "") {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const displayKey = formatKey(key);
        
        // Count array fields
        if (Array.isArray(obj[key])) {
          totalFields++;
          if (obj[key].length > 0) {
            filledFields++;
          } else {
            missing.push(displayKey + " (Table)");
          }
          continue;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], displayKey);
        } else {
          totalFields++;
          const val = obj[key];
          let isFilled = false;
          if (typeof val === 'string' && val.trim() !== '') {
            isFilled = true;
          } else if (typeof val === 'number') {
            isFilled = true;
          } else if (typeof val === 'boolean' && val === true) {
            isFilled = true;
          }
          
          if (isFilled) {
            filledFields++;
          } else {
            missing.push(parentKey ? `${parentKey} - ${displayKey}` : displayKey);
          }
        }
      }
    }
  }

  traverse(data);

  if (totalFields === 0) return { progress: 100, missing: [] };
  return { progress: Math.round((filledFields / totalFields) * 100), missing };
}
